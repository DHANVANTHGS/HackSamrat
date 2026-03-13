const { assertDto } = require("../../../lib/validation");

const validStatuses = new Set(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "DOCS_VERIFIED", "APPROVED", "REJECTED", "DISBURSED"]);
const isObject = (value) => value !== null && typeof value === "object";

const isValidAmount = (value) => value === undefined || value === null || value === "" || !Number.isNaN(Number(value));
const isValidDate = (value) => value === undefined || value === null || value === "" || !Number.isNaN(Date.parse(value));

const assertCreateClaimDto = (body) =>
  assertDto(
    body,
    (value) => {
      if (!isObject(value)) {
        return false;
      }

      const titleOk = typeof value.title === "string" && value.title.trim().length > 0;
      const amountRequired = value.amountClaimed !== undefined && value.amountClaimed !== null && value.amountClaimed !== "";
      const amountOk = amountRequired && isValidAmount(value.amountClaimed);
      const statusOk = !value.status || validStatuses.has(String(value.status).trim().toUpperCase());

      return titleOk && amountOk && statusOk;
    },
    "Claim creation requires title, amountClaimed, and a valid status when provided.",
  );

const assertUpdateClaimDto = (body) =>
  assertDto(
    body,
    (value) => {
      if (!isObject(value)) {
        return false;
      }

      if (value.status && !validStatuses.has(String(value.status).trim().toUpperCase())) {
        return false;
      }

      return (
        isValidAmount(value.amountClaimed) &&
        isValidAmount(value.amountApproved) &&
        isValidAmount(value.payoutAmount) &&
        isValidDate(value.insurerDecisionAt) &&
        isValidDate(value.payoutProcessedAt) &&
        isValidDate(value.resolvedAt)
      );
    },
    "Claim update contains invalid status, amount, or date fields.",
  );

module.exports = {
  assertCreateClaimDto,
  assertUpdateClaimDto,
};
