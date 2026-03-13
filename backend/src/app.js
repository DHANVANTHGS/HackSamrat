const express = require("express");

const { config } = require("./config/env");
const { createLogger } = require("./lib/logger");
const { getMetricsSnapshot } = require("./lib/metrics");
const { getDependencyStatus } = require("./lib/readiness");
const apiRoutes = require("./routes/api");
const {
  corsHandler,
  errorHandler,
  notFoundHandler,
  requestContext,
  requestLogger,
  securityHeaders,
} = require("./middleware/http");

const logger = createLogger(config.logLevel);
const app = express();

app.disable("x-powered-by");
app.use(requestContext());
app.use(securityHeaders());
app.use(corsHandler());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger(logger));

app.get("/health", (request, response) => {
  response.json({
    success: true,
    data: {
      status: "ok",
      service: config.appName,
      timestamp: new Date().toISOString(),
    },
  });
});

app.get("/ready", async (request, response) => {
  const dependencies = await getDependencyStatus(config);
  const isReady = dependencies.postgres.connected !== false;

  response.status(isReady ? 200 : 503).json({
    success: isReady,
    data: {
      status: isReady ? "ready" : "degraded",
      dependencies,
    },
  });
});

app.get("/metrics", (request, response) => {
  if (!config.security.enableMetrics) {
    response.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Metrics disabled" } });
    return;
  }

  response.json({
    success: true,
    data: getMetricsSnapshot(),
  });
});

app.use(config.apiPrefix, apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = {
  app,
  logger,
};
