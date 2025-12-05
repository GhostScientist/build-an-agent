import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import type { AgentConfig } from '../types.js';
import { withSpinner } from '../utils/spinner.js';
import { generateAgentProject } from './webapp-generator.js';

export async function generateProject(
  targetDir: string,
  config: AgentConfig
): Promise<void> {
  // Use the full webapp generator for feature parity
  const project = await generateAgentProject(config);
  const files = project.files;

  // Create project directory
  await fs.ensureDir(targetDir);

  // Write all files
  await withSpinner('Creating project files...', async () => {
    for (const file of files) {
      const filePath = path.join(targetDir, file.path);
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, file.content);
    }
  }, `Generated ${files.length} files`);

  // Install dependencies
  await withSpinner('Installing dependencies...', async () => {
    execSync('npm install', {
      cwd: targetDir,
      stdio: 'pipe',
    });
  }, 'Dependencies installed');
}
