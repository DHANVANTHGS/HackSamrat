"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestUrl = exports.assertDto = void 0;
const errors_1 = require("./errors");
const assertDto = (value, validator, message) => {
    if (!validator(value)) {
        throw new errors_1.AppError(message, 400, "VALIDATION_ERROR", value);
    }
    return value;
};
exports.assertDto = assertDto;
const getRequestUrl = (request) => {
    const host = request.headers.host ?? "localhost";
    return new URL(request.url ?? "/", `http://${host}`);
};
exports.getRequestUrl = getRequestUrl;
//# sourceMappingURL=validation.js.map