const isEchoRequestDto = (value) => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return typeof value.message === "string" && value.message.trim().length > 0;
};

module.exports = {
  isEchoRequestDto,
};
