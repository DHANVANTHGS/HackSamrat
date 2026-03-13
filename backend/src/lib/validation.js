const assertDto = (value, validator, message) => {
  if (!validator(value)) {
    const { AppError } = require("./errors");
    throw new AppError(message, 400, "VALIDATION_ERROR", value);
  }

  return value;
};

module.exports = {
  assertDto,
};
