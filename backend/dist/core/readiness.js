"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDependencyStatus = void 0;
const getDependencyStatus = (config) => ({
    postgres: {
        configured: Boolean(config.postgres.url),
        host: config.postgres.host,
        port: config.postgres.port,
    },
    redis: {
        configured: Boolean(config.redis.url),
        host: config.redis.host,
        port: config.redis.port,
    },
    storage: {
        configured: Boolean(config.storage.endpoint),
        endpoint: config.storage.endpoint,
        bucket: config.storage.bucket,
    },
});
exports.getDependencyStatus = getDependencyStatus;
//# sourceMappingURL=readiness.js.map