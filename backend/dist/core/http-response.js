"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.logRequest = void 0;
const http_1 = require("../lib/http");
const validation_1 = require("../lib/validation");
const logRequest = (logger, request, response, context) => {
    const url = (0, validation_1.getRequestUrl)(request);
    const durationMs = Date.now() - context.startedAt;
    logger.info("request.completed", {
        requestId: context.requestId,
        method: request.method,
        path: url.pathname,
        statusCode: response.statusCode,
        durationMs,
    });
};
exports.logRequest = logRequest;
const notFound = (response, requestId, path) => {
    (0, http_1.sendJson)(response, 404, {
        success: false,
        error: {
            code: "NOT_FOUND",
            message: `Route ${path} was not found`,
            requestId,
        },
    });
};
exports.notFound = notFound;
//# sourceMappingURL=http-response.js.map