const { assertDto } = require("../../../lib/validation");

const isObject = (value) => value !== null && typeof value === "object";

const assertAiChatDto = (body) =>
  assertDto(
    body,
    (value) =>
      isObject(value) &&
      typeof value.message === "string" &&
      value.message.trim().length > 0 &&
      (value.conversationId === undefined || typeof value.conversationId === "string"),
    "AI chat requires a message and an optional conversationId.",
  );

module.exports = {
  assertAiChatDto,
};
