import { AppConfig } from "../config/env";
export declare const getDependencyStatus: (config: AppConfig) => {
    postgres: {
        configured: boolean;
        host: string;
        port: number;
    };
    redis: {
        configured: boolean;
        host: string;
        port: number;
    };
    storage: {
        configured: boolean;
        endpoint: string;
        bucket: string;
    };
};
//# sourceMappingURL=readiness.d.ts.map