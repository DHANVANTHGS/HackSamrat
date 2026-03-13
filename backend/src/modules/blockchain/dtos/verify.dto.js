const { assertDto } = require("../../../lib/validation");

const isObject = (value) => value !== null && typeof value === "object";

const assertVerifyAnchorDto = (body) =>
  assertDto(
    body,
    (value) =>
      isObject(value) &&
      ((typeof value.digest === "string" && value.digest.trim().length > 0) ||
        (typeof value.anchorId === "string" && value.anchorId.trim().length > 0)),
    "Blockchain verification requires digest or anchorId.",
  );

module.exports = {
  assertVerifyAnchorDto,
};
