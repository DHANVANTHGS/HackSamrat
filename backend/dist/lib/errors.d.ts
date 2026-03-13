export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: unknown;
    constructor(message: string, statusCode?: number, code?: string, details?: unknown);
}
export declare const isAppError: (error: unknown) => error is AppError;
//# sourceMappingURL=errors.d.ts.map