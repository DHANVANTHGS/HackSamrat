"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = void 0;
const dotenv_1 = require("dotenv");
const errors_1 = require("../lib/errors");
(0, dotenv_1.config)();
const getEnv = (key, fallback) => {
    const value = process.env[key] ?? fallback;
    if (!value) {
        throw new errors_1.AppError(`Missing required environment variable: ${key}`, 500, "CONFIG_ERROR");
    }
    return value;
};
const getNumber = (key, fallback) => {
    const rawValue = getEnv(key, fallback);
    const value = Number(rawValue);
    if (Number.isNaN(value)) {
        throw new errors_1.AppError(`Environment variable ${key} must be a number`, 500, "CONFIG_ERROR");
    }
    return value;
};
const loadConfig = () => ({
    appName: getEnv("APP_NAME", "HackSamrat Backend"),
    nodeEnv: getEnv("NODE_ENV", "development"),
    port: getNumber("PORT", "5000"),
    apiPrefix: getEnv("API_PREFIX", "/api/v1"),
    logLevel: getEnv("LOG_LEVEL", "info"),
    postgres: {
        host: getEnv("POSTGRES_HOST", "localhost"),
        port: getNumber("POSTGRES_PORT", "5432"),
        database: getEnv("POSTGRES_DB", "hacksamrat"),
        user: getEnv("POSTGRES_USER", "postgres"),
        password: getEnv("POSTGRES_PASSWORD", "postgres"),
        url: getEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/hacksamrat"),
    },
    redis: {
        host: getEnv("REDIS_HOST", "localhost"),
        port: getNumber("REDIS_PORT", "6379"),
        url: getEnv("REDIS_URL", "redis://localhost:6379"),
    },
    storage: {
        endpoint: getEnv("S3_ENDPOINT", "http://localhost:9000"),
        port: getNumber("S3_PORT", "9000"),
        accessKey: getEnv("S3_ACCESS_KEY", "minioadmin"),
        secretKey: getEnv("S3_SECRET_KEY", "minioadmin"),
        bucket: getEnv("S3_BUCKET", "hacksamrat-dev"),
        region: getEnv("S3_REGION", "us-east-1"),
    },
});
exports.loadConfig = loadConfig;
//# sourceMappingURL=env.js.map