import { IncomingMessage, ServerResponse } from "node:http";
import { Logger } from "../lib/logger";
export interface RequestContext {
    requestId: string;
    startedAt: number;
}
export declare const createRequestContext: () => RequestContext;
export declare const withErrorHandling: (logger: Logger, handler: (request: IncomingMessage, response: ServerResponse, context: RequestContext) => Promise<void>) => (request: IncomingMessage, response: ServerResponse) => Promise<void>;
//# sourceMappingURL=error-handler.d.ts.map