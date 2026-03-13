const express = require("express");

const { asyncHandler } = require("../../lib/http");
const { requireAuth, requireRoles } = require("../../middleware/auth");
const { emergencyService } = require("../../services/emergency.service");
const { assertEmergencyLookupDto, assertEmergencySettingsDto } = require("./dtos/emergency.dto");

const router = express.Router();

const requestContext = (request) => ({
  ipAddress: request.ip,
  userAgent: request.get("user-agent") || null,
});

router.get(
  "/me",
  requireAuth,
  requireRoles("PATIENT"),
  asyncHandler(async (request, response) => {
    const settings = await emergencyService.getPatientSettings(request.auth.userId);
    response.json({ success: true, data: settings });
  }),
);

router.patch(
  "/me",
  requireAuth,
  requireRoles("PATIENT"),
  asyncHandler(async (request, response) => {
    const payload = assertEmergencySettingsDto(request.body);
    const settings = await emergencyService.updatePatientSettings(request.auth.userId, payload);
    response.json({ success: true, data: settings });
  }),
);

router.post(
  "/lookup",
  requireAuth,
  requireRoles("DOCTOR", "ADMIN"),
  asyncHandler(async (request, response) => {
    const payload = assertEmergencyLookupDto(request.body);
    const lookup = await emergencyService.emergencyLookup({
      doctorUserId: request.auth.userId,
      patientCode: payload.patientCode,
      reason: payload.reason,
      requestContext: requestContext(request),
    });
    response.json({ success: true, data: lookup });
  }),
);

module.exports = router;
