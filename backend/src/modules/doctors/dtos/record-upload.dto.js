const { assertDto } = require("../../../lib/validation");

const allowedRecordTypes = new Set([
  "REPORT",
  "PRESCRIPTION",
  "LAB_RESULT",
  "IMAGING",
  "DISCHARGE_SUMMARY",
  "CLAIM_DOCUMENT",
  "OTHER",
]);

const isObject = (value) => value !== null && typeof value === "object";

const assertDoctorRecordUploadDto = (body) =>
  assertDto(
    body,
    (value) => {
      if (!isObject(value)) {
        return false;
      }

      const titleOk = typeof value.title === "string" && value.title.trim().length > 0;
      const recordType = typeof value.recordType === "string" ? value.recordType.trim().toUpperCase() : "";
      const recordTypeOk = allowedRecordTypes.has(recordType);
      const occurredAtOk = !value.occurredAt || !Number.isNaN(Date.parse(value.occurredAt));

      return titleOk && recordTypeOk && occurredAtOk;
    },
    "Doctor record upload requires title, valid record type, and a valid occurredAt date when provided.",
  );

module.exports = {
  assertDoctorRecordUploadDto,
};
