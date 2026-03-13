const crypto = require("crypto");

const { config } = require("../config/env");
const { recordRequestMetric } = require("../lib/metrics");

const requestContext = () => (request, response, next) => {
  const requestId = request.headers["x-request-id"] || crypto.randomUUID();
  request.requestId = requestId;
  response.setHeader("x-request-id", requestId);
  next();
};

const securityHeaders = () => (request, response, next) => {
  response.setHeader("x-content-type-options", "nosniff");
  response.setHeader("x-frame-options", "DENY");
  response.setHeader("referrer-policy", "no-referrer");
  response.setHeader("permissions-policy", "camera=(), microphone=(), geolocation=()");
  response.setHeader("cross-origin-resource-policy", "same-site");
  next();
};

const corsHandler = () => (request, response, next) => {
  const origin = request.headers.origin;
  const allowedOrigins = config.security.corsAllowedOrigins;

  if (origin && allowedOrigins.includes(origin)) {
    response.setHeader("access-control-allow-origin", origin);
    response.setHeader("vary", "Origin");
    response.setHeader("access-control-allow-credentials", "true");
    response.setHeader("access-control-allow-methods", "GET,POST,PATCH,DELETE,OPTIONS");
    response.setHeader("access-control-allow-headers", "Content-Type, Authorization, X-Request-Id, X-Admin-Token");
  }

  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }

  next();
};

const requestLogger = (logger) => (request, response, next) => {
  const startedAt = Date.now();

  response.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    recordRequestMetric({
      statusCode: response.statusCode,
      durationMs,
    });

    logger.info("request.completed", {
      requestId: request.requestId,
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs,
    });
  });

  next();
};

const notFoundHandler = (request, response) => {
  response.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${request.originalUrl} was not found`,
    },
  });
};

const errorHandler = (error, request, response, next) => {
  const statusCode = error.statusCode || 500;
  const code = error.code || "INTERNAL_SERVER_ERROR";

  if (response.headersSent) {
    next(error);
    return;
  }

  response.status(statusCode).json({
    success: false,
    error: {
      code,
      message: error.message || "Unexpected server error",
      requestId: request.requestId,
      details: config.nodeEnv === "production" ? undefined : error.details,
    },
  });
};

module.exports = {
  corsHandler,
  errorHandler,
  notFoundHandler,
  requestContext,
  requestLogger,
  securityHeaders,
};
