const express = require("express");

const { asyncHandler } = require("../../lib/http");
const { AppError } = require("../../lib/errors");
const { auditService } = require("../../services/audit.service");
const { config } = require("../../config/env");

const router = express.Router();

const requireAdminToken = (request, response, next) => {
  const token = request.headers["x-admin-token"];

  if (!token || token !== config.security.adminAuditToken) {
    next(new AppError("Admin audit token is invalid.", 401, "ADMIN_AUTH_REQUIRED"));
    return;
  }

  next();
};

router.use(requireAdminToken);

router.get(
  "/audit-logs",
  asyncHandler(async (request, response) => {
    const events = await auditService.listEvents({
      action: request.query.action,
      targetResource: request.query.targetResource,
      actorUserId: request.query.actorUserId,
      limit: request.query.limit,
    });

    response.json({ success: true, data: { items: events } });
  }),
);

module.exports = router;
