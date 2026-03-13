export interface AppConfig {
    appName: string;
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    logLevel: "debug" | "info" | "warn" | "error";
    postgres: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
        url: string;
    };
    redis: {
        host: string;
        port: number;
        url: string;
    };
    storage: {
        endpoint: string;
        port: number;
        accessKey: string;
        secretKey: string;
        bucket: string;
        region: string;
    };
}
export declare const loadConfig: () => AppConfig;
//# sourceMappingURL=env.d.ts.map