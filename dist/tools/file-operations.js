import { readFile, writeFile, mkdir, stat, readdir } from 'fs/promises';
import { dirname, join, relative, extname } from 'path';
import { glob } from 'glob';
export class FileOperations {
    async readFile(filePath) {
        try {
            const content = await readFile(filePath, 'utf-8');
            return content;
        }
        catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async writeFile(filePath, content) {
        try {
            // Ensure directory exists
            await mkdir(dirname(filePath), { recursive: true });
            await writeFile(filePath, content, 'utf-8');
        }
        catch (error) {
            throw new Error(`Failed to write file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async editFile(filePath, oldText, newText) {
        try {
            const content = await this.readFile(filePath);
            if (!content.includes(oldText)) {
                throw new Error(`Text not found in file: "${oldText}"`);
            }
            const updatedContent = content.replace(oldText, newText);
            await this.writeFile(filePath, updatedContent);
        }
        catch (error) {
            throw new Error(`Failed to edit file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getFileInfo(filePath) {
        try {
            const stats = await stat(filePath);
            return {
                path: filePath,
                exists: true,
                isDirectory: stats.isDirectory(),
                size: stats.size,
                modified: stats.mtime,
            };
        }
        catch (error) {
            return {
                path: filePath,
                exists: false,
                isDirectory: false,
                size: 0,
                modified: new Date(0),
            };
        }
    }
    async listDirectory(dirPath) {
        try {
            const files = await readdir(dirPath);
            return files;
        }
        catch (error) {
            throw new Error(`Failed to list directory ${dirPath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async findFiles(pattern, baseDir = process.cwd()) {
        try {
            const files = await glob(pattern, {
                cwd: baseDir,
                ignore: ['node_modules/**', '.git/**', 'build/**', '.gradle/**']
            });
            return files.map(file => join(baseDir, file));
        }
        catch (error) {
            throw new Error(`Failed to find files with pattern ${pattern}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async findAndroidFiles(baseDir = process.cwd()) {
        const [kotlinFiles, xmlFiles, gradleFiles, manifestFiles] = await Promise.all([
            this.findFiles('**/*.kt', baseDir),
            this.findFiles('**/*.xml', baseDir),
            this.findFiles('**/build.gradle*', baseDir),
            this.findFiles('**/AndroidManifest.xml', baseDir)
        ]);
        return { kotlinFiles, xmlFiles, gradleFiles, manifestFiles };
    }
    async searchInFiles(searchTerm, filePattern = '**/*.{kt,java,xml}', baseDir = process.cwd()) {
        const results = [];
        const files = await this.findFiles(filePattern, baseDir);
        for (const file of files) {
            try {
                const content = await this.readFile(file);
                const lines = content.split('\n');
                lines.forEach((line, index) => {
                    if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
                        results.push({
                            file: relative(baseDir, file),
                            line: index + 1,
                            content: line.trim()
                        });
                    }
                });
            }
            catch (error) {
                // Skip files that can't be read
                continue;
            }
        }
        return results;
    }
    // Android-specific helpers
    async createKotlinFile(filePath, className, packageName, content = '') {
        const kotlinContent = `package ${packageName}

${content || `class ${className} {
    // TODO: Implement ${className}
}`}`;
        await this.writeFile(filePath, kotlinContent);
    }
    async createComposeFile(filePath, componentName, packageName) {
        const composeContent = `package ${packageName}

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp

@Composable
fun ${componentName}(
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Hello from ${componentName}!",
            style = MaterialTheme.typography.headlineMedium
        )
    }
}

@Preview(showBackground = true)
@Composable
fun ${componentName}Preview() {
    MaterialTheme {
        ${componentName}()
    }
}`;
        await this.writeFile(filePath, composeContent);
    }
    async createAndroidManifest(filePath, packageName) {
        const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="${packageName}">

    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.App"
        tools:targetApi="31">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.App">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;
        await this.writeFile(filePath, manifestContent);
    }
    isAndroidFile(filePath) {
        const ext = extname(filePath);
        const androidExtensions = ['.kt', '.java', '.xml'];
        return androidExtensions.includes(ext) || filePath.includes('build.gradle');
    }
    getFileType(filePath) {
        const ext = extname(filePath);
        switch (ext) {
            case '.kt': return 'kotlin';
            case '.java': return 'java';
            case '.xml': return 'xml';
            default:
                if (filePath.includes('build.gradle'))
                    return 'gradle';
                return 'other';
        }
    }
}
//# sourceMappingURL=file-operations.js.map