#!/usr/bin/env node
import { program } from 'commander';
import path from 'path';
import fs from 'fs-extra';

import { printHeader, printSuccess, printError, styles } from './utils/styles.js';
import { toPackageName, checkDirectoryExists } from './utils/validation.js';
import { promptProjectName, promptProjectDetails } from './prompts/project.js';
import { promptDomain } from './prompts/domain.js';
import { promptTemplate } from './prompts/template.js';
import { promptProviderOnly, promptModelForProvider } from './prompts/sdk.js';
import { promptTools } from './prompts/tools.js';
import { runHuggingFaceWizard } from './prompts/huggingface.js';
import { generateProject } from './generator/index.js';
import type { AgentConfig } from './types.js';

const VERSION = '1.0.0';

async function main() {

  program
    .name('build-agent-app')
    .description('Create AI agents with the Claude Agent SDK or OpenAI Agents SDK')
    .version(VERSION, '-v, --version')
    .argument('[project-name]', 'Name of the project')
    .action(async (projectNameArg?: string) => {
      try {
        // Print header
        printHeader();

        // Step 1: Project name and target directory
        let targetDir: string;
        let projectName: string;

        if (projectNameArg) {
          // Resolve the full path first, then extract just the directory name
          targetDir = path.resolve(process.cwd(), projectNameArg);
          projectName = path.basename(targetDir);
        } else {
          projectName = await promptProjectName();
          targetDir = path.resolve(process.cwd(), projectName);
        }

        // Check if directory already exists
        if (await checkDirectoryExists(targetDir)) {
          const existsAnswer = await (await import('enquirer')).default.prompt<{ overwrite: boolean }>({
            type: 'confirm',
            name: 'overwrite',
            message: `Directory ${projectName} already exists. Overwrite?`,
            initial: false,
          });

          if (!existsAnswer.overwrite) {
            console.log(styles.dim('\nOperation cancelled.\n'));
            process.exit(0);
          }

          await fs.remove(targetDir);
        }

        // Step 2: Provider selection (early to enable branching)
        const { provider } = await promptProviderOnly();

        let config: AgentConfig;

        if (provider === 'huggingface') {
          // ============================================
          // HUGGINGFACE BRANCH: Streamlined 3-step wizard
          // ============================================
          const hfResult = await runHuggingFaceWizard();

          config = {
            name: hfResult.name,
            description: hfResult.description,
            domain: 'knowledge', // Default domain for HF agents
            sdkProvider: 'huggingface',
            model: hfResult.model,
            tools: [],
            mcpServers: hfResult.mcpServers,
            customInstructions: '',
            permissions: 'balanced',
            projectName,
            packageName: toPackageName(projectName),
            version: '1.0.0',
            author: '',
            license: 'MIT',
          };
        } else {
          // ============================================
          // CLAUDE/OPENAI BRANCH: Full wizard flow
          // ============================================

          // Step 3: Domain selection
          const domain = await promptDomain();

          // Step 4: Template selection
          const template = await promptTemplate(domain);

          // Step 5: Model selection (provider already chosen)
          const model = await promptModelForProvider(provider);

          // Step 6: Tools and permissions
          const defaultToolIds = template?.defaultTools || [];
          const { tools, permissions } = await promptTools(defaultToolIds);

          // Step 7: Project details
          const { author, license } = await promptProjectDetails(projectName);

          // Build configuration
          config = {
            name: template?.name || `${domain.charAt(0).toUpperCase() + domain.slice(1)} Agent`,
            description: template?.description || `An AI agent for ${domain} tasks`,
            domain,
            templateId: template?.id,
            sdkProvider: provider,
            model,
            tools,
            mcpServers: [],
            customInstructions: '',
            permissions,
            projectName,
            packageName: toPackageName(projectName),
            version: '1.0.0',
            author,
            license,
          };
        }

        console.log(); // Empty line before generation

        // Generate the project
        await generateProject(targetDir, config);

        // Print success message
        printSuccess(projectName, provider);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ERR_USE_AFTER_CLOSE') {
          // User pressed Ctrl+C
          console.log(styles.dim('\n\nOperation cancelled.\n'));
          process.exit(0);
        }

        printError(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log(styles.dim('\n\nOperation cancelled.\n'));
    process.exit(0);
  });

  await program.parseAsync(process.argv);
}

main().catch((error) => {
  printError(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
