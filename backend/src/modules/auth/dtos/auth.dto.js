const { assertDto } = require("../../../lib/validation");

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const isEmail = (value) => isNonEmptyString(value) && value.includes("@");
const isObject = (value) => value !== null && typeof value === "object";

const assertDoctorLoginDto = (body) =>
  assertDto(
    body,
    (value) => isObject(value) && isEmail(value.email) && isNonEmptyString(value.password),
    "Doctor login requires a valid email and password.",
  );

const assertPatientEmailDto = (body, label) =>
  assertDto(body, (value) => isObject(value) && isEmail(value.email), `${label} requires a valid email.`);

const assertWebAuthnVerificationDto = (body, label) =>
  assertDto(
    body,
    (value) => isObject(value) && isEmail(value.email) && isObject(value.response) && isNonEmptyString(value.response.id),
    `${label} requires a valid email and WebAuthn response payload.`,
  );

module.exports = {
  assertDoctorLoginDto,
  assertPatientEmailDto,
  assertWebAuthnVerificationDto,
};
