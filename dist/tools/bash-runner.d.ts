export interface CommandResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    success: boolean;
    duration: number;
}
export interface CommandOptions {
    cwd?: string;
    timeout?: number;
    env?: Record<string, string>;
    shell?: boolean;
}
export declare class BashRunner {
    runCommand(command: string, options?: CommandOptions): Promise<CommandResult>;
    runGradleTask(task: string, options?: CommandOptions): Promise<CommandResult>;
    runAdbCommand(command: string, options?: CommandOptions): Promise<CommandResult>;
    buildProject(variant?: string, options?: CommandOptions): Promise<CommandResult>;
    runTests(options?: CommandOptions): Promise<CommandResult>;
    installApp(variant?: string, options?: CommandOptions): Promise<CommandResult>;
    getConnectedDevices(): Promise<string[]>;
    getAppLogs(packageName: string, options?: CommandOptions): Promise<CommandResult>;
    clearAppData(packageName: string): Promise<CommandResult>;
    uninstallApp(packageName: string): Promise<CommandResult>;
    getAndroidVersion(): Promise<string | null>;
    getDeviceInfo(): Promise<Record<string, string>>;
    gitStatus(): Promise<CommandResult>;
    gitAdd(files?: string): Promise<CommandResult>;
    gitCommit(message: string): Promise<CommandResult>;
    gitPush(branch?: string): Promise<CommandResult>;
    checkCommand(command: string): Promise<boolean>;
    checkGradleWrapper(): Promise<boolean>;
    checkAdb(): Promise<boolean>;
    checkGit(): Promise<boolean>;
    formatCommandResult(result: CommandResult): string;
}
//# sourceMappingURL=bash-runner.d.ts.map