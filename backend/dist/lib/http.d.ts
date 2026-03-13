import { IncomingMessage, ServerResponse } from "node:http";
export declare const sendJson: <T>(response: ServerResponse, statusCode: number, payload: T) => void;
export declare const readJsonBody: <T>(request: IncomingMessage) => Promise<T | undefined>;
//# sourceMappingURL=http.d.ts.map