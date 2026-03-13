"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readJsonBody = exports.sendJson = void 0;
const sendJson = (response, statusCode, payload) => {
    response.statusCode = statusCode;
    response.setHeader("Content-Type", "application/json; charset=utf-8");
    response.end(JSON.stringify(payload));
};
exports.sendJson = sendJson;
const readJsonBody = async (request) => {
    const chunks = [];
    for await (const chunk of request) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    if (chunks.length === 0) {
        return undefined;
    }
    const rawBody = Buffer.concat(chunks).toString("utf8");
    return JSON.parse(rawBody);
};
exports.readJsonBody = readJsonBody;
//# sourceMappingURL=http.js.map