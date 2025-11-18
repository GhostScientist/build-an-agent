export interface FileInfo {
    path: string;
    exists: boolean;
    isDirectory: boolean;
    size: number;
    modified: Date;
}
export declare class FileOperations {
    readFile(filePath: string): Promise<string>;
    writeFile(filePath: string, content: string): Promise<void>;
    editFile(filePath: string, oldText: string, newText: string): Promise<void>;
    getFileInfo(filePath: string): Promise<FileInfo>;
    listDirectory(dirPath: string): Promise<string[]>;
    findFiles(pattern: string, baseDir?: string): Promise<string[]>;
    findAndroidFiles(baseDir?: string): Promise<{
        kotlinFiles: string[];
        xmlFiles: string[];
        gradleFiles: string[];
        manifestFiles: string[];
    }>;
    searchInFiles(searchTerm: string, filePattern?: string, baseDir?: string): Promise<Array<{
        file: string;
        line: number;
        content: string;
    }>>;
    createKotlinFile(filePath: string, className: string, packageName: string, content?: string): Promise<void>;
    createComposeFile(filePath: string, componentName: string, packageName: string): Promise<void>;
    createAndroidManifest(filePath: string, packageName: string): Promise<void>;
    isAndroidFile(filePath: string): boolean;
    getFileType(filePath: string): 'kotlin' | 'java' | 'xml' | 'gradle' | 'other';
}
//# sourceMappingURL=file-operations.d.ts.map