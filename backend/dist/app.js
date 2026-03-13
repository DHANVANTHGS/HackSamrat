"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.app = void 0;
const node_http_1 = require("node:http");
const config_1 = require("./config");
const http_response_1 = require("./core/http-response");
const error_handler_1 = require("./core/error-handler");
const logger_1 = require("./lib/logger");
const validation_1 = require("./lib/validation");
const routes_1 = require("./routes");
const logger = (0, logger_1.createLogger)(config_1.config.logLevel);
exports.logger = logger;
exports.app = (0, node_http_1.createServer)((0, error_handler_1.withErrorHandling)(logger, async (request, response, context) => {
    const handled = await (0, routes_1.routeRequest)(request, response);
    if (!handled) {
        const url = (0, validation_1.getRequestUrl)(request);
        (0, http_response_1.notFound)(response, context.requestId, url.pathname);
    }
    (0, http_response_1.logRequest)(logger, request, response, context);
}));
//# sourceMappingURL=app.js.map