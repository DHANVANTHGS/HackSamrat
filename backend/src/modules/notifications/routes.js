const express = require("express");

const { asyncHandler } = require("../../lib/http");
const { requireAuth } = require("../../middleware/auth");
const { notificationService } = require("../../services/notification.service");

const router = express.Router();

router.use(requireAuth);

router.get(
  "/me",
  asyncHandler(async (request, response) => {
    const unreadOnly = String(request.query.unreadOnly || "false").toLowerCase() === "true";
    const limit = request.query.limit || 50;
    const notifications = await notificationService.listForUser(request.auth.userId, {
      unreadOnly,
      limit,
    });
    response.json({ success: true, data: notifications });
  }),
);

router.get(
  "/me/unread-summary",
  asyncHandler(async (request, response) => {
    const summary = await notificationService.getUnreadSummary(request.auth.userId);
    response.json({ success: true, data: summary });
  }),
);

router.post(
  "/me/:notificationId/read",
  asyncHandler(async (request, response) => {
    const notification = await notificationService.markOneRead(request.auth.userId, request.params.notificationId);
    response.json({ success: true, data: notification });
  }),
);

router.post(
  "/me/read-all",
  asyncHandler(async (request, response) => {
    const result = await notificationService.markAllRead(request.auth.userId);
    response.json({ success: true, data: result });
  }),
);

router.delete(
  "/me/:notificationId",
  asyncHandler(async (request, response) => {
    const result = await notificationService.deleteOne(request.auth.userId, request.params.notificationId);
    response.json({ success: true, data: result });
  }),
);

module.exports = router;
