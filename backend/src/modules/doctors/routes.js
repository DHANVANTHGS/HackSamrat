const express = require("express");
const multer = require("multer");

const { asyncHandler } = require("../../lib/http");
const { requireAuth, requirePatientAccess, requireRoles } = require("../../middleware/auth");
const { doctorService } = require("../../services/doctor.service");
const { medicalRecordService } = require("../../services/medical-record.service");
const { patientService } = require("../../services/patient.service");
const { assertDoctorRecordUploadDto } = require("./dtos/record-upload.dto");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 5,
  },
});

const requestContext = (request) => ({
  ipAddress: request.ip,
  userAgent: request.get("user-agent") || null,
});

router.use(requireAuth, requireRoles("DOCTOR", "ADMIN"));

router.get(
  "/me/dashboard",
  asyncHandler(async (request, response) => {
    const dashboard = await doctorService.getDashboard(request.auth.userId);
    response.json({ success: true, data: dashboard });
  }),
);

router.get(
  "/patients/search",
  asyncHandler(async (request, response) => {
    const results = await doctorService.searchPatients(request.query.q || "");
    response.json({ success: true, data: { items: results } });
  }),
);

router.get(
  "/patients/:patientId/profile",
  requirePatientAccess({ patientIdParam: "patientId", requiredPermission: "medical_records_read" }),
  asyncHandler(async (request, response) => {
    const profile = await doctorService.getPatientProfile(request.params.patientId);
    response.json({
      success: true,
      data: {
        ...profile,
        access: {
          scopes: request.accessDecision.scopes,
          reason: request.accessDecision.reason,
        },
      },
    });
  }),
);

router.get(
  "/patients/:patientId/records",
  requirePatientAccess({ patientIdParam: "patientId", requiredPermission: "medical_records_read" }),
  asyncHandler(async (request, response) => {
    const records = await medicalRecordService.listDoctorPatientRecords({
      doctorUserId: request.auth.userId,
      patientId: request.params.patientId,
      recordType: request.query.recordType,
      requestContext: requestContext(request),
    });
    response.json({ success: true, data: records });
  }),
);

router.get(
  "/patients/:patientId/records/:recordId",
  requirePatientAccess({ patientIdParam: "patientId", requiredPermission: "medical_records_read" }),
  asyncHandler(async (request, response) => {
    const record = await medicalRecordService.getDoctorPatientRecord({
      doctorUserId: request.auth.userId,
      patientId: request.params.patientId,
      recordId: request.params.recordId,
      requestContext: requestContext(request),
    });
    response.json({ success: true, data: record });
  }),
);

router.post(
  "/patients/:patientId/records",
  requirePatientAccess({ patientIdParam: "patientId", requiredPermission: "medical_records_write" }),
  upload.array("files", 5),
  asyncHandler(async (request, response) => {
    const payload = assertDoctorRecordUploadDto(request.body);
    const doctor = await doctorService.getDoctorProfile(request.auth.userId);
    const patient = await patientService.getPatientById(request.params.patientId);
    const record = await medicalRecordService.uploadDoctorPatientRecord({
      doctor,
      patient,
      payload,
      files: request.files,
      requestContext: requestContext(request),
    });
    response.status(201).json({ success: true, data: record });
  }),
);

router.get(
  "/patients/:patientId/records/:recordId/files/:fileId/download",
  requirePatientAccess({ patientIdParam: "patientId", requiredPermission: "medical_records_read" }),
  asyncHandler(async (request, response) => {
    const download = await medicalRecordService.downloadDoctorPatientRecordFile({
      doctorUserId: request.auth.userId,
      patientId: request.params.patientId,
      recordId: request.params.recordId,
      fileId: request.params.fileId,
      requestContext: requestContext(request),
    });

    response.setHeader("Content-Type", download.contentType);
    response.setHeader("Content-Length", String(download.contentLength));
    response.setHeader("Content-Disposition", `attachment; filename="${download.file.originalName}"`);
    download.stream.on("error", (error) => response.destroy(error));
    download.stream.pipe(response);
  }),
);

module.exports = router;
