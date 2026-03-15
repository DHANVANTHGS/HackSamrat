const { v2: cloudinary } = require("cloudinary");
const { Readable } = require("stream");

const { config } = require("../config/env");

// Manually parse CLOUDINARY_URL to ensure credentials are set correctly
const parseCloudinaryUrl = (url) => {
  try {
    const regex = /cloudinary:\/\/([^:]+):([^@]+)@(.+)/;
    const matches = url.match(regex);
    if (matches) {
      return {
        api_key: matches[1],
        api_secret: matches[2],
        cloud_name: matches[3],
      };
    }
  } catch (e) {
    console.error("Failed to parse CLOUDINARY_URL", e);
  }
  return {};
};

const cloudConfig = parseCloudinaryUrl(config.storage.cloudinaryUrl);

cloudinary.config({
  ...cloudConfig,
  secure: true
});

const storageService = {
  async uploadBuffer({ key, buffer, mimeType }) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: key, // Use our key as the public_id
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Write buffer to stream
      uploadStream.end(buffer);
    });
  },

  async getFile(key) {
    // Attempt to fetch as image first, then raw if that fails.
    // In a production environment, we'd store the resource_type in the DB.
    const types = ["image", "raw", "video"];

    for (const type of types) {
      const url = cloudinary.url(key, { secure: true, resource_type: type });
      try {
        const response = await fetch(url);
        if (response.ok) {
          return {
            stream: response.body ? Readable.fromWeb(response.body) : null,
            contentType: response.headers.get("content-type"),
            contentLength: Number(response.headers.get("content-length")),
          };
        }
      } catch (e) {
        // Continue to next type
      }
    }

    throw new Error(`Failed to fetch file from Cloudinary for key: ${key}`);
  },

  buildRecordStorageKey(patientCode, originalName) {
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "-");
    return `records/${patientCode}/${Date.now()}-${safeName}`;
  },

  buildClaimStorageKey(claimNumber, originalName) {
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "-");
    return `claims/${claimNumber}/${Date.now()}-${safeName}`;
  },
};

module.exports = {
  storageService,
};
