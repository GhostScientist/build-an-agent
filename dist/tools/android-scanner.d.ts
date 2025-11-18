export interface AndroidProjectInfo {
    isAndroidProject: boolean;
    projectType: 'single-module' | 'multi-module' | 'unknown';
    modules: string[];
    buildVariants: string[];
    dependencies: string[];
    kotlinVersion?: string;
    hasCompose: boolean;
    hasDataWedge: boolean;
    packageName?: string;
    targetSdk?: number;
    minSdk?: number;
}
export declare class AndroidProjectScanner {
    analyzeProject(projectPath: string): Promise<AndroidProjectInfo>;
    private isAndroidProject;
    private analyzeProjectStructure;
    private analyzeBuildFiles;
    private extractDependencies;
    private extractBuildVariants;
    private extractKotlinVersion;
    private extractAndroidConfig;
    private checkForCompose;
    private checkForDataWedge;
    private hasFile;
    private hasDirectory;
    private findFile;
    private findFiles;
}
//# sourceMappingURL=android-scanner.d.ts.map