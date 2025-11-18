import { type Query } from '@anthropic-ai/claude-agent-sdk';
export interface AndroidAgentConfig {
    verbose?: boolean;
    apiKey?: string;
}
export declare class AndroidAgent {
    private config;
    private conversationHistory;
    private scanner;
    private fileOps;
    private bashRunner;
    constructor(config?: AndroidAgentConfig);
    query(userQuery: string): Query;
    private buildSystemPrompt;
    clearHistory(): void;
    scanAndroidProject(): Promise<string>;
    readFile(filePath: string): Promise<string>;
    writeFile(filePath: string, content: string): Promise<void>;
    findFiles(pattern: string): Promise<string[]>;
    runCommand(command: string): Promise<void>;
    buildProject(variant?: string): Promise<void>;
    private formatProjectAnalysis;
    private getAvailableTools;
}
//# sourceMappingURL=agent.d.ts.map