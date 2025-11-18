import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
export class AndroidProjectScanner {
    async analyzeProject(projectPath) {
        const result = {
            isAndroidProject: false,
            projectType: 'unknown',
            modules: [],
            buildVariants: [],
            dependencies: [],
            hasCompose: false,
            hasDataWedge: false,
        };
        try {
            // Check if this is an Android project
            const isAndroid = await this.isAndroidProject(projectPath);
            if (!isAndroid) {
                return result;
            }
            result.isAndroidProject = true;
            // Analyze project structure
            await this.analyzeProjectStructure(projectPath, result);
            // Analyze build files
            await this.analyzeBuildFiles(projectPath, result);
            // Check for specific technologies
            await this.checkForCompose(projectPath, result);
            await this.checkForDataWedge(projectPath, result);
        }
        catch (error) {
            // If we can't analyze, but we know it's Android, return basic info
            if (result.isAndroidProject) {
                return result;
            }
            throw error;
        }
        return result;
    }
    async isAndroidProject(projectPath) {
        try {
            // Check for key Android project indicators
            const files = await readdir(projectPath);
            // Look for gradle files
            const hasGradleWrapper = files.includes('gradlew') || files.includes('gradlew.bat');
            const hasBuildGradle = files.includes('build.gradle') || files.includes('build.gradle.kts');
            if (!hasGradleWrapper && !hasBuildGradle) {
                return false;
            }
            // Look for Android-specific directories
            const hasAndroidManifest = await this.findFile(projectPath, 'AndroidManifest.xml');
            const hasSrcMain = await this.hasDirectory(join(projectPath, 'src', 'main'));
            const hasAppModule = await this.hasDirectory(join(projectPath, 'app'));
            return hasAndroidManifest || hasSrcMain || hasAppModule;
        }
        catch {
            return false;
        }
    }
    async analyzeProjectStructure(projectPath, result) {
        try {
            const files = await readdir(projectPath);
            const modules = [];
            for (const file of files) {
                const filePath = join(projectPath, file);
                const stats = await stat(filePath);
                if (stats.isDirectory()) {
                    // Check if this directory is a module (has build.gradle)
                    const hasBuildFile = await this.hasFile(join(filePath, 'build.gradle')) ||
                        await this.hasFile(join(filePath, 'build.gradle.kts'));
                    if (hasBuildFile) {
                        modules.push(file);
                    }
                }
            }
            result.modules = modules;
            result.projectType = modules.length > 1 ? 'multi-module' : 'single-module';
        }
        catch (error) {
            // Continue with limited info
            result.projectType = 'unknown';
        }
    }
    async analyzeBuildFiles(projectPath, result) {
        try {
            // Try to read main build.gradle files
            const buildFiles = [
                'build.gradle',
                'build.gradle.kts',
                'app/build.gradle',
                'app/build.gradle.kts'
            ];
            for (const buildFile of buildFiles) {
                try {
                    const buildPath = join(projectPath, buildFile);
                    const content = await readFile(buildPath, 'utf-8');
                    // Extract dependencies
                    this.extractDependencies(content, result);
                    // Extract build variants
                    this.extractBuildVariants(content, result);
                    // Extract Kotlin version
                    this.extractKotlinVersion(content, result);
                    // Extract SDK versions and package name
                    this.extractAndroidConfig(content, result);
                }
                catch {
                    // Continue with next file
                }
            }
        }
        catch {
            // Continue with limited info
        }
    }
    extractDependencies(content, result) {
        const dependencyRegex = /implementation\s+['"]([^'"]+)['"]/g;
        const apiRegex = /api\s+['"]([^'"]+)['"]/g;
        const kapt = /kapt\s+['"]([^'"]+)['"]/g;
        const dependencies = new Set(result.dependencies);
        let match;
        // Extract implementation dependencies
        while ((match = dependencyRegex.exec(content)) !== null) {
            dependencies.add(match[1]);
        }
        // Extract API dependencies
        while ((match = apiRegex.exec(content)) !== null) {
            dependencies.add(match[1]);
        }
        // Extract KAPT dependencies
        while ((match = kapt.exec(content)) !== null) {
            dependencies.add(match[1]);
        }
        result.dependencies = Array.from(dependencies);
    }
    extractBuildVariants(content, result) {
        const buildTypesRegex = /buildTypes\s*\{([^}]+)\}/s;
        const match = buildTypesRegex.exec(content);
        if (match) {
            const buildTypesContent = match[1];
            const typeRegex = /(\w+)\s*\{/g;
            let typeMatch;
            const variants = [];
            while ((typeMatch = typeRegex.exec(buildTypesContent)) !== null) {
                variants.push(typeMatch[1]);
            }
            result.buildVariants = variants;
        }
    }
    extractKotlinVersion(content, result) {
        const kotlinVersionRegex = /kotlin_version\s*=\s*['"]([^'"]+)['"]/;
        const match = kotlinVersionRegex.exec(content);
        if (match) {
            result.kotlinVersion = match[1];
        }
    }
    extractAndroidConfig(content, result) {
        // Extract package name
        const packageRegex = /applicationId\s+['"]([^'"]+)['"]/;
        const packageMatch = packageRegex.exec(content);
        if (packageMatch) {
            result.packageName = packageMatch[1];
        }
        // Extract target SDK
        const targetSdkRegex = /targetSdk(?:Version)?\s+(\d+)/;
        const targetMatch = targetSdkRegex.exec(content);
        if (targetMatch) {
            result.targetSdk = parseInt(targetMatch[1]);
        }
        // Extract min SDK
        const minSdkRegex = /minSdk(?:Version)?\s+(\d+)/;
        const minMatch = minSdkRegex.exec(content);
        if (minMatch) {
            result.minSdk = parseInt(minMatch[1]);
        }
    }
    async checkForCompose(projectPath, result) {
        // Check for Compose in dependencies
        const hasComposeDependency = result.dependencies.some(dep => dep.includes('androidx.compose') || dep.includes('compose-bom'));
        if (hasComposeDependency) {
            result.hasCompose = true;
            return;
        }
        // Check for Compose files in source code
        try {
            const composeFiles = await this.findFiles(projectPath, /\.kt$/, (content) => content.includes('@Composable') || content.includes('setContent'));
            if (composeFiles.length > 0) {
                result.hasCompose = true;
            }
        }
        catch {
            // Continue without Compose detection
        }
    }
    async checkForDataWedge(projectPath, result) {
        try {
            // Check for DataWedge-related code
            const dataWedgeFiles = await this.findFiles(projectPath, /\.(kt|java)$/, (content) => content.includes('DataWedge') ||
                content.includes('com.symbol.datawedge') ||
                content.includes('EXTRA_BARCODE_DATA'));
            if (dataWedgeFiles.length > 0) {
                result.hasDataWedge = true;
            }
        }
        catch {
            // Continue without DataWedge detection
        }
    }
    // Utility methods
    async hasFile(filePath) {
        try {
            await stat(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async hasDirectory(dirPath) {
        try {
            const stats = await stat(dirPath);
            return stats.isDirectory();
        }
        catch {
            return false;
        }
    }
    async findFile(basePath, fileName) {
        try {
            const files = await readdir(basePath, { withFileTypes: true });
            for (const file of files) {
                if (file.name === fileName) {
                    return true;
                }
                if (file.isDirectory()) {
                    const found = await this.findFile(join(basePath, file.name), fileName);
                    if (found)
                        return true;
                }
            }
            return false;
        }
        catch {
            return false;
        }
    }
    async findFiles(basePath, pattern, contentFilter) {
        const results = [];
        try {
            const files = await readdir(basePath, { withFileTypes: true });
            for (const file of files) {
                const fullPath = join(basePath, file.name);
                if (file.isDirectory()) {
                    const subResults = await this.findFiles(fullPath, pattern, contentFilter);
                    results.push(...subResults);
                }
                else if (pattern.test(file.name)) {
                    if (contentFilter) {
                        try {
                            const content = await readFile(fullPath, 'utf-8');
                            if (contentFilter(content)) {
                                results.push(fullPath);
                            }
                        }
                        catch {
                            // Continue with next file
                        }
                    }
                    else {
                        results.push(fullPath);
                    }
                }
            }
        }
        catch {
            // Return partial results
        }
        return results;
    }
}
//# sourceMappingURL=android-scanner.js.map