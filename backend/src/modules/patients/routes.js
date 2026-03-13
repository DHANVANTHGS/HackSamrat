const express = require("express");
const multer = require("multer");

const { asyncHandler } = require("../../lib/http");
const { requireAuth, requireRoles } = require("../../middleware/auth");
const { patientService } = require("../../services/patient.service");
const { medicalRecordService } = require("../../services/medical-record.service");
const { assertUploadMedicalRecordDto } = require("./dtos/record-upload.dto");

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

router.use(requireAuth, requireRoles("PATIENT"));

router.get(
  "/me/dashboard",
  asyncHandler(async (request, response) => {
    const dashboard = await patientService.getDashboard(request.auth.userId);
    response.json({ success: true, data: dashboard });
  }),
);

router.get(
  "/me/records",
  asyncHandler(async (request, response) => {
    const records = await medicalRecordService.listPatientRecords(
      request.auth.userId,
      { recordType: request.query.recordType },
      requestContext(request),
    );
    response.json({ success: true, data: records });
  }),
);

router.get(
  "/me/records/:recordId",
  asyncHandler(async (request, response) => {
    const record = await medicalRecordService.getPatientRecord(
      request.auth.userId,
      request.params.recordId,
      requestContext(request),
    );
    response.json({ success: true, data: record });
  }),
);

router.post(
  "/me/records",
  upload.array("files", 5),
  asyncHandler(async (request, response) => {
    const payload = assertUploadMedicalRecordDto(request.body);
    const record = await medicalRecordService.uploadPatientRecord(
      request.auth.userId,
      payload,
      request.files,
      requestContext(request),
    );
    response.status(201).json({ success: true, data: record });
  }),
);

router.get(
  "/me/records/:recordId/files/:fileId/download",
  asyncHandler(async (request, response) => {
    const download = await medicalRecordService.downloadPatientRecordFile(
      request.auth.userId,
      request.params.recordId,
      request.params.fileId,
      requestContext(request),
    );

    response.setHeader("Content-Type", download.contentType);
    response.setHeader("Content-Length", String(download.contentLength));
    response.setHeader("Content-Disposition", `attachment; filename="${download.file.originalName}"`);

    download.stream.on("error", (error) => {
      response.destroy(error);
    });

    download.stream.pipe(response);
  }),
);

module.exports = router;
