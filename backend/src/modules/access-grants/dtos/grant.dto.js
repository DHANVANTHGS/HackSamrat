const { assertDto } = require("../../../lib/validation");

const validScopes = new Set(["FULL_RECORDS", "PRESCRIPTIONS", "IMAGING", "INSURANCE", "CLAIMS", "EMERGENCY_ONLY"]);
const validStatuses = new Set(["ACTIVE", "REVOKED", "EXPIRED"]);
const isObject = (value) => value !== null && typeof value === "object";

const assertCreateGrantDto = (body) =>
  assertDto(
    body,
    (value) => {
      if (!isObject(value)) {
        return false;
      }

      const doctorUserIdOk = typeof value.doctorUserId === "string" && value.doctorUserId.trim().length > 0;
      const scopeOk = typeof value.scope === "string" && validScopes.has(value.scope.trim().toUpperCase());
      const expiresAtOk = !value.expiresAt || !Number.isNaN(Date.parse(value.expiresAt));

      return doctorUserIdOk && scopeOk && expiresAtOk;
    },
    "Access grant creation requires doctorUserId, valid scope, and a valid expiresAt when provided.",
  );

const assertUpdateGrantDto = (body) =>
  assertDto(
    body,
    (value) => {
      if (!isObject(value)) {
        return false;
      }

      if (value.scope && !validScopes.has(String(value.scope).trim().toUpperCase())) {
        return false;
      }

      if (value.status && !validStatuses.has(String(value.status).trim().toUpperCase())) {
        return false;
      }

      if (value.expiresAt && Number.isNaN(Date.parse(value.expiresAt))) {
        return false;
      }

      return true;
    },
    "Access grant update contains invalid scope, status, or expiresAt.",
  );

module.exports = {
  assertCreateGrantDto,
  assertUpdateGrantDto,
};
