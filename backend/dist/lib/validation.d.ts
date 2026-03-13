import { IncomingMessage } from "node:http";
export type Validator<T> = (value: unknown) => value is T;
export declare const assertDto: <T>(value: unknown, validator: Validator<T>, message: string) => T;
export declare const getRequestUrl: (request: IncomingMessage) => URL;
//# sourceMappingURL=validation.d.ts.map