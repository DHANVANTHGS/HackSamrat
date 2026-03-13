const path = require("path");
const dotenv = require("dotenv");

const { AppError } = require("../lib/errors");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const getEnv = (key, fallback) => {
  const value = process.env[key] ?? fallback;

  if (!value) {
    throw new AppError(`Missing required environment variable: ${key}`, 500, "CONFIG_ERROR");
  }

  return value;
};

const getNumber = (key, fallback) => {
  const rawValue = getEnv(key, fallback);
  const value = Number(rawValue);

  if (Number.isNaN(value)) {
    throw new AppError(`Environment variable ${key} must be a number`, 500, "CONFIG_ERROR");
  }

  return value;
};

const getBoolean = (key, fallback) => String(process.env[key] ?? fallback).toLowerCase() === "true";
const getCsv = (key, fallback) =>
  String(process.env[key] ?? fallback)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const config = {
  appName: getEnv("APP_NAME", "HackSamrat Backend"),
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: getNumber("PORT", "5000"),
  apiPrefix: getEnv("API_PREFIX", "/api/v1"),
  logLevel: getEnv("LOG_LEVEL", "info"),
  security: {
    corsAllowedOrigins: getCsv("CORS_ALLOWED_ORIGINS", "http://localhost:3000"),
    enableMetrics: getBoolean("ENABLE_METRICS", "true"),
    adminAuditToken: getEnv("ADMIN_AUDIT_TOKEN", "replace-me"),
  },
  auth: {
    sessionTtlHours: getNumber("AUTH_SESSION_TTL_HOURS", "24"),
    maxLoginAttempts: getNumber("AUTH_MAX_LOGIN_ATTEMPTS", "5"),
    lockoutMinutes: getNumber("AUTH_LOCKOUT_MINUTES", "15"),
    webauthnChallengeTtlMinutes: getNumber("AUTH_WEBAUTHN_CHALLENGE_TTL_MINUTES", "5"),
    webauthn: {
      rpName: getEnv("AUTH_WEBAUTHN_RP_NAME", "HackSamrat"),
      rpId: getEnv("AUTH_WEBAUTHN_RP_ID", "localhost"),
      origin: getEnv("AUTH_WEBAUTHN_ORIGIN", "http://localhost:3000"),
    },
  },
  blockchain: {
    enabled: getBoolean("BLOCKCHAIN_ENABLED", "true"),
    chainName: getEnv("BLOCKCHAIN_CHAIN_NAME", "polygon-amoy"),
    anchorAuditActions: getCsv(
      "BLOCKCHAIN_ANCHOR_AUDIT_ACTIONS",
      "CLAIM_CREATED,CLAIM_UPDATED,ACCESS_GRANTED,ACCESS_REVOKED,EMERGENCY_LOOKUP,RECORD_UPLOADED",
    ),
  },
  postgres: {
    host: getEnv("POSTGRES_HOST", "localhost"),
    port: getNumber("POSTGRES_PORT", "5432"),
    database: getEnv("POSTGRES_DB", "hacksamrat"),
    user: getEnv("POSTGRES_USER", "postgres"),
    password: getEnv("POSTGRES_PASSWORD", "postgres"),
    schema: getEnv("POSTGRES_SCHEMA", "public"),
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
};

module.exports = {
  config,
};
