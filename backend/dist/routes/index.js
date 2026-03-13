"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeRequest = void 0;
const routes_1 = require("../modules/meta/routes");
const health_1 = require("./health");
const routeRequest = async (request, response) => {
    if ((0, health_1.handleHealthRoutes)(request, response)) {
        return true;
    }
    if (await (0, routes_1.handleMetaRoutes)(request, response)) {
        return true;
    }
    return false;
};
exports.routeRequest = routeRequest;
//# sourceMappingURL=index.js.map