const express = require("express");
const multer = require("multer");

const { asyncHandler } = require("../../lib/http");
const { requireAuth, requireRoles } = require("../../middleware/auth");
const { claimService } = require("../../services/claim.service");
const { assertCreateClaimDto, assertUpdateClaimDto } = require("./dtos/claim.dto");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});

const requestContext = (request) => ({
  ipAddress: request.ip,
  userAgent: request.get("user-agent") || null,
});

router.use(requireAuth, requireRoles("PATIENT"));

router.get(
  "/me",
  asyncHandler(async (request, response) => {
    const claims = await claimService.listForPatient(request.auth.userId);
    response.json({ success: true, data: { items: claims } });
  }),
);

router.post(
  "/me",
  asyncHandler(async (request, response) => {
    const payload = assertCreateClaimDto(request.body);
    const claim = await claimService.createForPatient(request.auth.userId, payload, requestContext(request));
    response.status(201).json({ success: true, data: claim });
  }),
);

router.get(
  "/me/:claimId",
  asyncHandler(async (request, response) => {
    const claim = await claimService.getForPatient(request.auth.userId, request.params.claimId);
    response.json({ success: true, data: claim });
  }),
);

router.patch(
  "/me/:claimId",
  asyncHandler(async (request, response) => {
    const payload = assertUpdateClaimDto(request.body);
    const claim = await claimService.updateForPatient(
      request.auth.userId,
      request.params.claimId,
      payload,
      requestContext(request),
    );
    response.json({ success: true, data: claim });
  }),
);

router.post(
  "/me/:claimId/documents",
  upload.single("file"),
  asyncHandler(async (request, response) => {
    const result = await claimService.uploadDocumentForPatient(
      request.auth.userId,
      request.params.claimId,
      request.file,
      requestContext(request),
    );
    response.status(201).json({ success: true, data: result });
  }),
);

router.get(
  "/me/:claimId/documents/:documentId/download",
  asyncHandler(async (request, response) => {
    const download = await claimService.downloadDocumentForPatient(
      request.auth.userId,
      request.params.claimId,
      request.params.documentId,
      requestContext(request),
    );

    response.setHeader("Content-Type", download.contentType);
    response.setHeader("Content-Length", String(download.contentLength));
    response.setHeader("Content-Disposition", `attachment; filename="${download.document.originalName}"`);
    download.stream.on("error", (error) => response.destroy(error));
    download.stream.pipe(response);
  }),
);

module.exports = router;
