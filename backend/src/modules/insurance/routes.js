const express = require("express");

const { asyncHandler } = require("../../lib/http");
const { requireAuth, requireRoles } = require("../../middleware/auth");
const { insuranceService } = require("../../services/insurance.service");

const router = express.Router();

router.use(requireAuth, requireRoles("PATIENT"));

router.get(
  "/me/summary",
  asyncHandler(async (request, response) => {
    const summary = await insuranceService.getSummary(request.auth.userId);
    response.json({ success: true, data: summary });
  }),
);

router.get(
  "/me/policies",
  asyncHandler(async (request, response) => {
    const policies = await insuranceService.listPolicies(request.auth.userId);
    response.json({ success: true, data: { items: policies } });
  }),
);

router.get(
  "/me/policies/:policyId",
  asyncHandler(async (request, response) => {
    const policy = await insuranceService.getPolicy(request.auth.userId, request.params.policyId);
    response.json({ success: true, data: policy });
  }),
);

router.get(
  "/me/policies/:policyId/benefits",
  asyncHandler(async (request, response) => {
    const benefits = await insuranceService.getPolicyBenefits(request.auth.userId, request.params.policyId);
    response.json({ success: true, data: { items: benefits } });
  }),
);

module.exports = router;
