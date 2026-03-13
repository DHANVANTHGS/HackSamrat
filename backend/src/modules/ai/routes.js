const express = require("express");

const { asyncHandler } = require("../../lib/http");
const { requireAuth, requireRoles } = require("../../middleware/auth");
const { aiService } = require("../../services/ai.service");
const { assertAiChatDto } = require("./dtos/chat.dto");

const router = express.Router();

const requestContext = (request) => ({
  ipAddress: request.ip,
  userAgent: request.get("user-agent") || null,
});

router.use(requireAuth, requireRoles("PATIENT"));

router.post(
  "/chat",
  asyncHandler(async (request, response) => {
    const payload = assertAiChatDto(request.body);
    const result = await aiService.chat({
      userId: request.auth.userId,
      conversationId: payload.conversationId,
      message: payload.message,
      requestContext: requestContext(request),
    });
    response.json({ success: true, data: result });
  }),
);

module.exports = router;
