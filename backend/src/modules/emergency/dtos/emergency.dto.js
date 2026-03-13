const { assertDto } = require("../../../lib/validation");

const isObject = (value) => value !== null && typeof value === "object";

const assertEmergencySettingsDto = (body) =>
  assertDto(
    body,
    (value) => {
      if (!isObject(value)) {
        return false;
      }

      const enabledOk = value.enabled === undefined || typeof value.enabled === "boolean";
      const criticalOnlyOk = value.allowCriticalOnly === undefined || typeof value.allowCriticalOnly === "boolean";
      const unlockMinutesOk =
        value.unlockWindowMinutes === undefined ||
        (Number.isInteger(Number(value.unlockWindowMinutes)) && Number(value.unlockWindowMinutes) > 0);

      return enabledOk && criticalOnlyOk && unlockMinutesOk;
    },
    "Emergency settings payload is invalid.",
  );

const assertEmergencyLookupDto = (body) =>
  assertDto(
    body,
    (value) =>
      isObject(value) &&
      typeof value.patientCode === "string" &&
      value.patientCode.trim().length > 0 &&
      typeof value.reason === "string" &&
      value.reason.trim().length > 0,
    "Emergency lookup requires patientCode and reason.",
  );

module.exports = {
  assertEmergencyLookupDto,
  assertEmergencySettingsDto,
};
