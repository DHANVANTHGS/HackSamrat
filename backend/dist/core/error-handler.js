"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withErrorHandling = exports.createRequestContext = void 0;
const node_crypto_1 = require("node:crypto");
const errors_1 = require("../lib/errors");
const http_1 = require("../lib/http");
const createRequestContext = () => ({
    requestId: (0, node_crypto_1.randomUUID)(),
    startedAt: Date.now(),
});
exports.createRequestContext = createRequestContext;
const withErrorHandling = (logger, handler) => {
    return async (request, response) => {
        const context = (0, exports.createRequestContext)();
        response.setHeader("X-Request-Id", context.requestId);
        try {
            await handler(request, response, context);
        }
        catch (error) {
            const appError = (0, errors_1.isAppError)(error)
                ? error
                : new errors_1.AppError("Unexpected server error", 500, "INTERNAL_SERVER_ERROR");
            logger.error(appError.message, {
                requestId: context.requestId,
                code: appError.code,
                statusCode: appError.statusCode,
                details: appError.details,
            });
            (0, http_1.sendJson)(response, appError.statusCode, {
                success: false,
                error: {
                    code: appError.code,
                    message: appError.message,
                    requestId: context.requestId,
                },
            });
        }
    };
};
exports.withErrorHandling = withErrorHandling;
//# sourceMappingURL=error-handler.js.map