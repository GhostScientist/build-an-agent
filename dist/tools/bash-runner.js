import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
export class BashRunner {
    async runCommand(command, options = {}) {
        const startTime = Date.now();
        try {
            const { stdout, stderr } = await execAsync(command, {
                cwd: options.cwd || process.cwd(),
                timeout: options.timeout || 30000, // 30 second default timeout
                env: { ...process.env, ...options.env }
            });
            return {
                stdout,
                stderr,
                exitCode: 0,
                success: true,
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return {
                stdout: error.stdout || '',
                stderr: error.stderr || error.message || '',
                exitCode: error.code || 1,
                success: false,
                duration: Date.now() - startTime
            };
        }
    }
    // Android-specific commands
    async runGradleTask(task, options = {}) {
        const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
        return this.runCommand(`${gradleCommand} ${task}`, {
            ...options,
            timeout: options.timeout || 120000 // 2 minutes for Gradle tasks
        });
    }
    async runAdbCommand(command, options = {}) {
        return this.runCommand(`adb ${command}`, options);
    }
    async buildProject(variant = 'debug', options = {}) {
        return this.runGradleTask(`assemble${variant.charAt(0).toUpperCase() + variant.slice(1)}`, options);
    }
    async runTests(options = {}) {
        return this.runGradleTask('test', options);
    }
    async installApp(variant = 'debug', options = {}) {
        return this.runGradleTask(`install${variant.charAt(0).toUpperCase() + variant.slice(1)}`, options);
    }
    async getConnectedDevices() {
        const result = await this.runAdbCommand('devices');
        if (!result.success) {
            return [];
        }
        const lines = result.stdout.split('\n').filter(line => line.includes('\t'));
        return lines.map(line => line.split('\t')[0]).filter(device => device.length > 0);
    }
    async getAppLogs(packageName, options = {}) {
        return this.runAdbCommand(`logcat -s ${packageName}`, options);
    }
    async clearAppData(packageName) {
        return this.runAdbCommand(`shell pm clear ${packageName}`);
    }
    async uninstallApp(packageName) {
        return this.runAdbCommand(`uninstall ${packageName}`);
    }
    async getAndroidVersion() {
        const result = await this.runAdbCommand('shell getprop ro.build.version.release');
        return result.success ? result.stdout.trim() : null;
    }
    async getDeviceInfo() {
        const commands = {
            model: 'shell getprop ro.product.model',
            manufacturer: 'shell getprop ro.product.manufacturer',
            android_version: 'shell getprop ro.build.version.release',
            api_level: 'shell getprop ro.build.version.sdk',
            serial: 'get-serialno'
        };
        const info = {};
        for (const [key, command] of Object.entries(commands)) {
            const result = await this.runAdbCommand(command);
            info[key] = result.success ? result.stdout.trim() : 'Unknown';
        }
        return info;
    }
    // Git commands
    async gitStatus() {
        return this.runCommand('git status --porcelain');
    }
    async gitAdd(files = '.') {
        return this.runCommand(`git add ${files}`);
    }
    async gitCommit(message) {
        return this.runCommand(`git commit -m "${message}"`);
    }
    async gitPush(branch = 'main') {
        return this.runCommand(`git push origin ${branch}`);
    }
    // Utility methods
    async checkCommand(command) {
        const result = await this.runCommand(`which ${command}`);
        return result.success;
    }
    async checkGradleWrapper() {
        const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
        const result = await this.runCommand(`ls -la ${gradleCommand}`);
        return result.success;
    }
    async checkAdb() {
        return this.checkCommand('adb');
    }
    async checkGit() {
        return this.checkCommand('git');
    }
    formatCommandResult(result) {
        let output = '';
        if (result.success) {
            output += `✅ Command completed successfully (${result.duration}ms)\n`;
            if (result.stdout) {
                output += `📤 Output:\n${result.stdout}\n`;
            }
        }
        else {
            output += `❌ Command failed with exit code ${result.exitCode} (${result.duration}ms)\n`;
            if (result.stderr) {
                output += `🚨 Error:\n${result.stderr}\n`;
            }
            if (result.stdout) {
                output += `📤 Output:\n${result.stdout}\n`;
            }
        }
        return output;
    }
}
//# sourceMappingURL=bash-runner.js.map