const express = require("express");

const { asyncHandler } = require("../../lib/http");
const { requireAuth, requirePatientAccess, requireRoles } = require("../../middleware/auth");
const { authService } = require("../../services/auth.service");
const { assertDoctorLoginDto, assertPatientEmailDto, assertWebAuthnVerificationDto } = require("./dtos/auth.dto");

const router = express.Router();

const requestContext = (request) => ({
  ipAddress: request.ip,
  userAgent: request.get("user-agent") || null,
});

router.post(
  "/doctor/login",
  asyncHandler(async (request, response) => {
    const body = assertDoctorLoginDto(request.body);
    const session = await authService.doctorLogin({ ...body, ...requestContext(request) });
    response.json({ success: true, data: session });
  }),
);

router.post(
  "/patients/webauthn/register/options",
  asyncHandler(async (request, response) => {
    const body = assertPatientEmailDto(request.body, "Registration");
    const payload = await authService.startPatientRegistration({ ...body, ...requestContext(request) });
    response.json({ success: true, data: payload });
  }),
);

router.post(
  "/patients/webauthn/register/verify",
  asyncHandler(async (request, response) => {
    const body = assertWebAuthnVerificationDto(request.body, "Registration verification");
    const session = await authService.verifyPatientRegistration({ ...body, ...requestContext(request) });
    response.json({ success: true, data: session });
  }),
);

router.post(
  "/patients/webauthn/login/options",
  asyncHandler(async (request, response) => {
    const body = assertPatientEmailDto(request.body, "Authentication");
    const payload = await authService.startPatientAuthentication({ ...body, ...requestContext(request) });
    response.json({ success: true, data: payload });
  }),
);

router.post(
  "/patients/webauthn/login/verify",
  asyncHandler(async (request, response) => {
    const body = assertWebAuthnVerificationDto(request.body, "Authentication verification");
    const session = await authService.verifyPatientAuthentication({ ...body, ...requestContext(request) });
    response.json({ success: true, data: session });
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    response.json({
      success: true,
      data: {
        sessionId: request.auth.sessionId,
        expiresAt: request.auth.expiresAt,
        user: {
          id: request.auth.user.id,
          email: request.auth.user.email,
          firstName: request.auth.user.firstName,
          lastName: request.auth.user.lastName,
          role: request.auth.user.role,
          roles: request.auth.roles,
          permissions: request.auth.permissions,
          patientId: request.auth.patientId,
          doctorId: request.auth.doctorId,
        },
      },
    });
  }),
);

router.post(
  "/logout",
  requireAuth,
  asyncHandler(async (request, response) => {
    await authService.logout(request.auth, requestContext(request));
    response.json({ success: true, data: { loggedOut: true } });
  }),
);

router.get(
  "/access/patients/:patientId",
  requireAuth,
  requireRoles("PATIENT", "DOCTOR", "ADMIN", "SUPPORT"),
  requirePatientAccess({ patientIdParam: "patientId" }),
  asyncHandler(async (request, response) => {
    response.json({ success: true, data: request.accessDecision });
  }),
);

module.exports = router;
