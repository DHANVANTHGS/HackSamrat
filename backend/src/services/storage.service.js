const crypto = require("crypto");
const { Readable } = require("stream");
const { CreateBucketCommand, GetObjectCommand, HeadBucketCommand, PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");

const { config } = require("../config/env");
const { AppError } = require("../lib/errors");

const forcePathStyle = config.storage.endpoint.includes("localhost") || config.storage.endpoint.includes("127.0.0.1");

const client = new S3Client({
  region: config.storage.region,
  endpoint: config.storage.endpoint,
  forcePathStyle,
  credentials: {
    accessKeyId: config.storage.accessKey,
    secretAccessKey: config.storage.secretKey,
  },
});

let bucketReadyPromise;

const ensureBucket = async () => {
  if (!bucketReadyPromise) {
    bucketReadyPromise = (async () => {
      try {
        await client.send(new HeadBucketCommand({ Bucket: config.storage.bucket }));
      } catch (error) {
        const statusCode = error?.$metadata?.httpStatusCode;
        const code = error?.name || error?.Code;
        const shouldCreate = statusCode === 404 || code === "NotFound" || code === "NoSuchBucket";

        if (!shouldCreate) {
          throw error;
        }

        await client.send(
          new CreateBucketCommand({
            Bucket: config.storage.bucket,
          }),
        );
      }
    })().catch((error) => {
      bucketReadyPromise = null;
      throw new AppError("Object storage bucket is unavailable.", 503, "STORAGE_UNAVAILABLE", {
        message: error.message,
      });
    });
  }

  return bucketReadyPromise;
};

const toNodeStream = (body) => {
  if (!body) {
    throw new AppError("Stored file body is empty.", 500, "FILE_STREAM_ERROR");
  }

  if (typeof body.pipe === "function") {
    return body;
  }

  if (typeof body.transformToWebStream === "function") {
    return Readable.fromWeb(body.transformToWebStream());
  }

  throw new AppError("Unsupported file stream response.", 500, "FILE_STREAM_ERROR");
};

const buildStorageKey = (folder, scopeId, originalName) => {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${folder}/${scopeId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
};

const storageService = {
  async uploadBuffer({ key, buffer, mimeType, checksumSha256 }) {
    await ensureBucket();

    await client.send(
      new PutObjectCommand({
        Bucket: config.storage.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        Metadata: {
          checksumsha256: checksumSha256,
        },
      }),
    );
  },

  async getFile(key) {
    await ensureBucket();

    const response = await client.send(
      new GetObjectCommand({
        Bucket: config.storage.bucket,
        Key: key,
      }),
    );

    return {
      stream: toNodeStream(response.Body),
      contentType: response.ContentType,
      contentLength: response.ContentLength,
    };
  },

  buildRecordStorageKey(patientCode, originalName) {
    return buildStorageKey("records", patientCode, originalName);
  },

  buildClaimStorageKey(claimNumber, originalName) {
    return buildStorageKey("claims", claimNumber, originalName);
  },
};

module.exports = {
  storageService,
};
