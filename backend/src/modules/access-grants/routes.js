const express = require("express");

const { asyncHandler } = require("../../lib/http");
const { requireAuth, requireRoles } = require("../../middleware/auth");
const { accessGrantService } = require("../../services/access-grant.service");
const { doctorService } = require("../../services/doctor.service");
const { assertCreateGrantDto, assertUpdateGrantDto } = require("./dtos/grant.dto");

const router = express.Router();

const requestContext = (request) => ({
  ipAddress: request.ip,
  userAgent: request.get("user-agent") || null,
});

router.use(requireAuth, requireRoles("PATIENT"));

router.get(
  "/doctors/search",
  asyncHandler(async (request, response) => {
    const doctors = await doctorService.searchDirectory(request.query.q || "");
    response.json({ success: true, data: { items: doctors } });
  }),
);

router.get(
  "/me",
  asyncHandler(async (request, response) => {
    const grants = await accessGrantService.listPatientGrants(request.auth.userId);
    response.json({ success: true, data: { items: grants } });
  }),
);

router.post(
  "/me",
  asyncHandler(async (request, response) => {
    const payload = assertCreateGrantDto(request.body);
    const grant = await accessGrantService.createPatientGrant(request.auth.userId, payload, requestContext(request));
    response.status(201).json({ success: true, data: grant });
  }),
);

router.patch(
  "/me/:grantId",
  asyncHandler(async (request, response) => {
    const payload = assertUpdateGrantDto(request.body);
    const grant = await accessGrantService.updatePatientGrant(
      request.auth.userId,
      request.params.grantId,
      payload,
      requestContext(request),
    );
    response.json({ success: true, data: grant });
  }),
);

router.delete(
  "/me/:grantId",
  asyncHandler(async (request, response) => {
    const grant = await accessGrantService.revokePatientGrant(
      request.auth.userId,
      request.params.grantId,
      requestContext(request),
    );
    response.json({ success: true, data: grant });
  }),
);

module.exports = router;
