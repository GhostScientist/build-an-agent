import { query } from '@anthropic-ai/claude-agent-sdk';
import { AndroidProjectScanner } from './tools/android-scanner.js';
import { FileOperations } from './tools/file-operations.js';
import { BashRunner } from './tools/bash-runner.js';
export class AndroidAgent {
    config;
    conversationHistory = [];
    scanner;
    fileOps;
    bashRunner;
    constructor(config = {}) {
        this.config = config;
        this.scanner = new AndroidProjectScanner();
        this.fileOps = new FileOperations();
        this.bashRunner = new BashRunner();
    }
    query(userQuery) {
        // Add to conversation history
        this.conversationHistory.push(`User: ${userQuery}`);
        // Build the specialized Android agent prompt
        const systemPrompt = this.buildSystemPrompt();
        const fullPrompt = `${systemPrompt}\n\nConversation History:\n${this.conversationHistory.join('\n')}\n\nCurrent Query: ${userQuery}`;
        // Create Claude query with Android specialization
        return query({
            prompt: fullPrompt,
            options: {
                includePartialMessages: true
            }
        });
    }
    buildSystemPrompt() {
        return `You are Android Agent, a specialized AI assistant for Android development with FULL DEVELOPER CAPABILITIES. You can read, write, and edit files, execute commands, and manage Android projects just like Claude Code. You are an expert in:

## Core Android Technologies:
- **Kotlin**: Modern syntax, coroutines, flow, extension functions
- **Jetpack Compose**: UI development, state management, navigation, theming
- **Android SDK**: Activities, fragments, services, broadcast receivers
- **Architecture Components**: ViewModel, LiveData, Room, Navigation
- **Dependency Injection**: Hilt, Dagger, manual DI patterns

## DataWedge & Enterprise:
- **DataWedge**: Barcode scanning, RFID, intent configuration, profile management
- **Zebra Devices**: TC21, TC26, MC33, scanning workflows, device management
- **StageNow**: Device staging and configuration
- **Enterprise Features**: MDM integration, kiosk mode, security policies

## Build & Tooling:
- **Gradle**: Kotlin DSL, Groovy DSL, build variants, dependencies, plugins
- **Android Studio**: Project templates, debugging, profiling, layout inspector
- **ADB**: Device management, debugging, log analysis, installation
- **Testing**: JUnit, Espresso, Compose testing, instrumentation tests

## Performance & Best Practices:
- **Memory Management**: Leak detection, optimization patterns
- **Threading**: Coroutines, WorkManager, background processing
- **Battery Optimization**: Doze mode, app standby, background limits
- **UI Performance**: Layout optimization, overdraw reduction, RecyclerView patterns

## Response Guidelines:
1. **Provide complete, working code examples** with proper imports and context
2. **Use modern Android patterns** (Compose over Views, Hilt over manual DI, etc.)
3. **Include error handling** and edge cases in code samples
4. **Explain the reasoning** behind architectural decisions
5. **Suggest testing approaches** for the solutions provided

## Non-Android Query Handling:
When asked about topics outside Android development, respond with:
"I'm specialized in Android development with Kotlin, Jetpack Compose, and DataWedge. While I can attempt to help with [topic], I strongly recommend verifying this with domain experts as it's outside my area of expertise. Can I help you adapt this to an Android context instead?"

Always prioritize Android-specific solutions and patterns. Be thorough, practical, and production-ready in your responses.

## Available Developer Tools:
You have access to the following tools to assist with development:

### File Operations:
- **readFile(filePath)** - Read any file in the project
- **writeFile(filePath, content)** - Create new files with content
- **editFile(filePath, oldText, newText)** - Edit existing files by replacing text
- **findFiles(pattern, baseDir?)** - Find files matching glob patterns (e.g., "**/*.kt")
- **searchInFiles(term, pattern?, baseDir?)** - Search for text across files

### Command Execution:
- **runCommand(command, options?)** - Execute any shell command
- **buildProject(variant?)** - Build the Android project (./gradlew assembleDebug)
- **runTests()** - Run project tests (./gradlew test)
- **installApp(variant?)** - Install app on device (./gradlew installDebug)
- **getConnectedDevices()** - List connected Android devices

### Android File Generation:
- **createComposeFile(path, componentName, packageName)** - Generate Jetpack Compose components
- **createKotlinFile(path, className, packageName, content?)** - Generate Kotlin files
- **analyzeAndroidProject(baseDir?)** - Analyze project structure and dependencies

## Usage Guidelines:
1. **Always use tools** when asked to create, modify, or analyze files
2. **Read existing code** before making changes to understand context and patterns
3. **Build and test** after making significant changes
4. **Follow Android conventions** found in the existing codebase
5. **Be proactive** - if you see improvements or issues, mention them

Example workflows:
- User: "Create a login screen" → Use analyzeAndroidProject, readFile existing activities, createComposeFile, editFile to integrate
- User: "Fix this bug" → Use readFile to understand code, editFile to fix, buildProject to verify
- User: "Add a new feature" → Use multiple tools to read, create, and modify files as needed

Use these tools actively to provide complete, working solutions that integrate properly with the user's Android project.`;
    }
    clearHistory() {
        this.conversationHistory = [];
    }
    async scanAndroidProject() {
        try {
            const projectInfo = await this.scanner.analyzeProject(process.cwd());
            return this.formatProjectAnalysis(projectInfo);
        }
        catch (error) {
            throw new Error(`Failed to scan Android project: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // Direct access methods for tools (for CLI commands)
    async readFile(filePath) {
        return this.fileOps.readFile(filePath);
    }
    async writeFile(filePath, content) {
        return this.fileOps.writeFile(filePath, content);
    }
    async findFiles(pattern) {
        return this.fileOps.findFiles(pattern);
    }
    async runCommand(command) {
        const result = await this.bashRunner.runCommand(command);
        console.log(this.bashRunner.formatCommandResult(result));
    }
    async buildProject(variant) {
        const result = await this.bashRunner.buildProject(variant);
        console.log(this.bashRunner.formatCommandResult(result));
    }
    formatProjectAnalysis(projectInfo) {
        if (!projectInfo.isAndroidProject) {
            return '❌ This doesn\'t appear to be an Android project.\n   Looking for: build.gradle files, Android manifest, src/main/java or src/main/kotlin directories.';
        }
        let analysis = '';
        analysis += `✅ **Android Project Detected**\n`;
        analysis += `📁 **Project Type**: ${projectInfo.projectType}\n`;
        if (projectInfo.modules && projectInfo.modules.length > 0) {
            analysis += `🏗️  **Modules**: ${projectInfo.modules.join(', ')}\n`;
        }
        if (projectInfo.buildVariants && projectInfo.buildVariants.length > 0) {
            analysis += `🎯 **Build Variants**: ${projectInfo.buildVariants.join(', ')}\n`;
        }
        if (projectInfo.dependencies && projectInfo.dependencies.length > 0) {
            analysis += `📦 **Key Dependencies**:\n`;
            projectInfo.dependencies.slice(0, 10).forEach((dep) => {
                analysis += `   • ${dep}\n`;
            });
            if (projectInfo.dependencies.length > 10) {
                analysis += `   • ... and ${projectInfo.dependencies.length - 10} more\n`;
            }
        }
        if (projectInfo.hasCompose) {
            analysis += `🎨 **Jetpack Compose**: Enabled\n`;
        }
        if (projectInfo.hasDataWedge) {
            analysis += `📱 **DataWedge Integration**: Detected\n`;
        }
        if (projectInfo.kotlinVersion) {
            analysis += `⚡ **Kotlin Version**: ${projectInfo.kotlinVersion}\n`;
        }
        return analysis;
    }
    getAvailableTools() {
        return {
            // File operations
            readFile: async (filePath) => {
                try {
                    const content = await this.fileOps.readFile(filePath);
                    return { success: true, content };
                }
                catch (error) {
                    return { success: false, error: error instanceof Error ? error.message : String(error) };
                }
            },
            writeFile: async (filePath, content) => {
                try {
                    await this.fileOps.writeFile(filePath, content);
                    return { success: true, message: `File written successfully: ${filePath}` };
                }
                catch (error) {
                    return { success: false, error: error instanceof Error ? error.message : String(error) };
                }
            },
            editFile: async (filePath, oldText, newText) => {
                try {
                    await this.fileOps.editFile(filePath, oldText, newText);
                    return { success: true, message: `File edited successfully: ${filePath}` };
                }
                catch (error) {
                    return { success: false, error: error instanceof Error ? error.message : String(error) };
                }
            },
            findFiles: async (pattern, baseDir) => {
                try {
                    const files = await this.fileOps.findFiles(pattern, baseDir);
                    return { success: true, files };
                }
                catch (error) {
                    return { success: false, error: error instanceof Error ? error.message : String(error) };
                }
            },
            searchInFiles: async (searchTerm, filePattern, baseDir) => {
                try {
                    const results = await this.fileOps.searchInFiles(searchTerm, filePattern, baseDir);
                    return { success: true, results };
                }
                catch (error) {
                    return { success: false, error: error instanceof Error ? error.message : String(error) };
                }
            },
            // Bash commands
            runCommand: async (command, options) => {
                try {
                    const result = await this.bashRunner.runCommand(command, options);
                    return {
                        success: result.success,
                        stdout: result.stdout,
                        stderr: result.stderr,
                        exitCode: result.exitCode,
                        duration: result.duration
                    };
                }
                catch (error) {
                    return { success: false, error: error instanceof Error ? error.message : String(error) };
                }
            },
            // Android-specific commands
            buildProject: async (variant) => {
                try {
                    const result = await this.bashRunner.buildProject(variant);
                    return {
                        success: result.success,
                        output: this.bashRunner.formatCommandResult(result)
                    };
                }
                catch (error) {
                    return { success: false, error: error instanceof Error ? error.message : String(error) };
                }
            },
            runTests: async () => {
                try {
                    const result = await this.bashRunner.runTests();
                    return {
                        success: result.success,
                        output: this.bashRunner.formatCommandResult(result)
                    };
                }
                catch (error) {
                    return { success: false, error: error instanceof Error ? error.message : String(error) };
                }
            },
            installApp: async (variant) => {
                try {
                    const result = await this.bashRunner.installApp(variant);
                    return {
                        success: result.success,
                        output: this.bashRunner.formatCommandResult(result)
                    };
                }
                catch (error) {
                    return { success: false, error: error instanceof Error ? error.message : String(error) };
                }
            },
            getConnectedDevices: async () => {
                try {
                    const devices = await this.bashRunner.getConnectedDevices();
                    return { success: true, devices };
                }
                catch (error) {
                    return { success: false, error: error instanceof Error ? error.message : String(error) };
                }
            },
            // Android file templates
            createComposeFile: async (filePath, componentName, packageName) => {
                try {
                    await this.fileOps.createComposeFile(filePath, componentName, packageName);
                    return { success: true, message: `Compose file created: ${filePath}` };
                }
                catch (error) {
                    return { success: false, error: error instanceof Error ? error.message : String(error) };
                }
            },
            createKotlinFile: async (filePath, className, packageName, content) => {
                try {
                    await this.fileOps.createKotlinFile(filePath, className, packageName, content);
                    return { success: true, message: `Kotlin file created: ${filePath}` };
                }
                catch (error) {
                    return { success: false, error: error instanceof Error ? error.message : String(error) };
                }
            },
            analyzeAndroidProject: async (baseDir) => {
                try {
                    const analysis = await this.scanner.analyzeProject(baseDir || process.cwd());
                    return { success: true, analysis };
                }
                catch (error) {
                    return { success: false, error: error instanceof Error ? error.message : String(error) };
                }
            }
        };
    }
}
//# sourceMappingURL=agent.js.map