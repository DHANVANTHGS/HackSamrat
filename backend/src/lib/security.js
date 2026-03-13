const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const hashToken = (value) => crypto.createHash("sha256").update(value).digest("hex");
const generateToken = (size = 32) => crypto.randomBytes(size).toString("base64url");
const comparePassword = (plainText, passwordHash) => bcrypt.compare(plainText, passwordHash);
const hashPassword = (plainText) => bcrypt.hash(plainText, 12);
const toBase64Url = (value) => Buffer.from(value).toString("base64url");
const fromBase64Url = (value) => Uint8Array.from(Buffer.from(value, "base64url"));

module.exports = {
  comparePassword,
  fromBase64Url,
  generateToken,
  hashPassword,
  hashToken,
  toBase64Url,
};
