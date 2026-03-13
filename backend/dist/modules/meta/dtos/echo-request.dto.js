"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEchoRequestDto = void 0;
const isEchoRequestDto = (value) => {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const candidate = value;
    return typeof candidate.message === "string" && candidate.message.trim().length > 0;
};
exports.isEchoRequestDto = isEchoRequestDto;
//# sourceMappingURL=echo-request.dto.js.map