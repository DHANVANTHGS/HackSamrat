import { IncomingMessage, ServerResponse } from "node:http";
import { Logger } from "../lib/logger";
import { RequestContext } from "./error-handler";
export declare const logRequest: (logger: Logger, request: IncomingMessage, response: ServerResponse, context: RequestContext) => void;
export declare const notFound: (response: ServerResponse, requestId: string, path: string) => void;
//# sourceMappingURL=http-response.d.ts.map