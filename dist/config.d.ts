export interface Config {
    apiKey?: string;
    verbose?: boolean;
}
export declare class ConfigManager {
    private config;
    load(): Promise<Config>;
    save(config: Partial<Config>): Promise<void>;
    get(): Config;
    getApiKey(): string | undefined;
    hasApiKey(): boolean;
}
//# sourceMappingURL=config.d.ts.map