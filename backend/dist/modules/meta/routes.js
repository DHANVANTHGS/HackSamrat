"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMetaRoutes = void 0;
const config_1 = require("../../config");
const readiness_1 = require("../../core/readiness");
const http_1 = require("../../lib/http");
const validation_1 = require("../../lib/validation");
const echo_request_dto_1 = require("./dtos/echo-request.dto");
const handleMetaRoutes = async (request, response) => {
    const url = (0, validation_1.getRequestUrl)(request);
    if (request.method === "GET" && url.pathname === `${config_1.config.apiPrefix}/meta/config`) {
        (0, http_1.sendJson)(response, 200, {
            success: true,
            data: {
                appName: config_1.config.appName,
                nodeEnv: config_1.config.nodeEnv,
                apiPrefix: config_1.config.apiPrefix,
                dependencies: (0, readiness_1.getDependencyStatus)(config_1.config),
            },
        });
        return true;
    }
    if (request.method === "POST" && url.pathname === `${config_1.config.apiPrefix}/meta/echo`) {
        const body = await Promise.resolve().then(() => __importStar(require("../../lib/http"))).then(({ readJsonBody }) => readJsonBody(request));
        const dto = (0, validation_1.assertDto)(body, echo_request_dto_1.isEchoRequestDto, "Request body must include a non-empty message string");
        (0, http_1.sendJson)(response, 200, {
            success: true,
            data: {
                echoedMessage: dto.message,
            },
        });
        return true;
    }
    return false;
};
exports.handleMetaRoutes = handleMetaRoutes;
//# sourceMappingURL=routes.js.map