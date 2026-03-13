const express = require("express");

const { config } = require("../../config/env");
const { getDependencyStatus } = require("../../lib/readiness");
const { assertDto } = require("../../lib/validation");
const { isEchoRequestDto } = require("./dtos/echo-request.dto");

const router = express.Router();

router.get("/config", async (request, response) => {
  response.json({
    success: true,
    data: {
      appName: config.appName,
      nodeEnv: config.nodeEnv,
      apiPrefix: config.apiPrefix,
      dependencies: await getDependencyStatus(config),
    },
  });
});

router.post("/echo", (request, response) => {
  const dto = assertDto(
    request.body,
    isEchoRequestDto,
    "Request body must include a non-empty message string",
  );

  response.json({
    success: true,
    data: {
      echoedMessage: dto.message,
    },
  });
});

module.exports = router;
