"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleHealthRoutes = void 0;
const config_1 = require("../config");
const readiness_1 = require("../core/readiness");
const http_1 = require("../lib/http");
const validation_1 = require("../lib/validation");
const handleHealthRoutes = (request, response) => {
    const url = (0, validation_1.getRequestUrl)(request);
    if (request.method === "GET" && (url.pathname === "/health" || url.pathname === `${config_1.config.apiPrefix}/health`)) {
        (0, http_1.sendJson)(response, 200, {
            success: true,
            data: {
                status: "ok",
                service: config_1.config.appName,
                timestamp: new Date().toISOString(),
            },
        });
        return true;
    }
    if (request.method === "GET" && (url.pathname === "/ready" || url.pathname === `${config_1.config.apiPrefix}/ready`)) {
        (0, http_1.sendJson)(response, 200, {
            success: true,
            data: {
                status: "ready",
                dependencies: (0, readiness_1.getDependencyStatus)(config_1.config),
            },
        });
        return true;
    }
    return false;
};
exports.handleHealthRoutes = handleHealthRoutes;
//# sourceMappingURL=health.js.map