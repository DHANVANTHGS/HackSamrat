const express = require("express");

const { asyncHandler } = require("../../lib/http");
const { requireAuth, requireRoles } = require("../../middleware/auth");
const { blockchainService } = require("../../services/blockchain.service");
const { assertVerifyAnchorDto } = require("./dtos/verify.dto");

const router = express.Router();

router.use(requireAuth, requireRoles("ADMIN", "SUPPORT", "DOCTOR"));

router.get(
  "/anchors",
  asyncHandler(async (request, response) => {
    const anchors = await blockchainService.listRecentAnchors(request.query.limit || 20);
    response.json({ success: true, data: { items: anchors } });
  }),
);

router.post(
  "/verify",
  asyncHandler(async (request, response) => {
    const payload = assertVerifyAnchorDto(request.body);
    const result = await blockchainService.verifyDigest({
      digest: payload.digest,
      anchorId: payload.anchorId,
    });
    response.json({ success: true, data: result });
  }),
);

module.exports = router;
