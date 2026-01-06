import type { AgentConfig, GeneratedProject, GeneratedFile, ProjectMetadata, AgentTemplate } from '../types.js';
import { AGENT_TEMPLATES } from '../data/agent-templates.js';

const KNOWLEDGE_TOOL_IDS = ['doc-ingest', 'table-extract', 'source-notes', 'local-rag']

// Helper function to get the correct API key environment variable name for each provider
function getApiKeyEnvVar(provider: string | undefined): string {
  switch (provider) {
    case 'claude':
      return 'ANTHROPIC_API_KEY';
    case 'openai':
      return 'OPENAI_API_KEY';
    case 'huggingface':
      return 'HF_TOKEN';
    default:
      return 'ANTHROPIC_API_KEY';
  }
}

// Helper function to sanitize names for use in TypeScript class names and identifiers
function sanitizeClassName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove all special characters except spaces
    .replace(/\s+/g, '') // Remove spaces
    .replace(/^[0-9]/, '_$&') // Prefix with underscore if starts with number
}

export async function generateAgentProject(config: AgentConfig): Promise<GeneratedProject> {
  const template = AGENT_TEMPLATES.find(t => t.id === config.templateId)
  const enabledTools = config.tools.filter(t => t.enabled)
  
  const files: GeneratedFile[] = []
  
  // Generate package.json
  files.push({
    path: 'package.json',
    content: generatePackageJson(config),
    type: 'json',
    template: 'package.json'
  })
  
  // Generate TypeScript config
  files.push({
    path: 'tsconfig.json', 
    content: generateTsConfig(),
    type: 'json',
    template: 'tsconfig.json'
  })
  
  // Generate main CLI file
  files.push({
    path: 'src/cli.ts',
    content: generateCLI(config, enabledTools),
    type: 'typescript',
    template: 'cli.ts'
  })
  
  // Generate core agent file
  files.push({
    path: 'src/agent.ts',
    content: generateAgent(config, enabledTools, template),
    type: 'typescript', 
    template: 'agent.ts'
  })
  
  // Generate configuration management
  files.push({
    path: 'src/config.ts',
    content: generateConfig(config),
    type: 'typescript',
    template: 'config.ts'
  })

  // Generate permission management
  files.push({
    path: 'src/permissions.ts',
    content: generatePermissions(config),
    type: 'typescript',
    template: 'permissions.ts'
  })

  // Generate MCP configuration manager
  files.push({
    path: 'src/mcp-config.ts',
    content: generateMcpConfigManager(),
    type: 'typescript',
    template: 'mcp-config.ts'
  })

  // Generate initial .mcp.json with configured servers
  files.push({
    path: '.mcp.json',
    content: generateMcpJson(config),
    type: 'json',
    template: '.mcp.json'
  })

  // Generate agent.json for HuggingFace tiny-agents
  if (config.sdkProvider === 'huggingface') {
    files.push({
      path: 'agent.json',
      content: generateTinyAgentJson(config),
      type: 'json',
      template: 'agent.json'
    })

    // Generate AGENTS.md (custom prompt file for tiny-agents)
    files.push({
      path: 'AGENTS.md',
      content: generateTinyAgentPrompt(config, template),
      type: 'markdown',
      template: 'AGENTS.md'
    })
  }

  // Generate tool implementations based on enabled tools
  const toolCategories = Array.from(new Set(enabledTools.map(tool => tool.category)))
  for (const category of toolCategories) {
    const toolFile = generateToolImplementation({ category }, config)
    if (toolFile) {
      files.push(toolFile)
    }
  }

  if (enabledTools.some(tool => KNOWLEDGE_TOOL_IDS.includes(tool.id))) {
    const knowledgeToolsFile = generateKnowledgeToolsImpl()
    if (knowledgeToolsFile) {
      files.push(knowledgeToolsFile)
    }
  }
  
  // Generate README
  files.push({
    path: 'README.md',
    content: generateReadme(config, template, enabledTools),
    type: 'markdown',
    template: 'README.md'
  })

  // Generate environment template
  files.push({
    path: '.env.example',
    content: generateEnvExample(config),
    type: 'shell',
    template: '.env.example'
  })

  // Generate .gitignore
  files.push({
    path: '.gitignore',
    content: generateGitignore(config),
    type: 'shell',
    template: '.gitignore'
  })

  // Publishing support
  files.push({
    path: 'scripts/publish.sh',
    content: generatePublishScript(config),
    type: 'shell',
    template: 'scripts/publish.sh'
  })

  files.push({
    path: '.npmrc.example',
    content: generateNpmrcExample(config),
    type: 'shell',
    template: '.npmrc.example'
  })

  files.push({
    path: 'LICENSE',
    content: generateLicense(config),
    type: 'markdown',
    template: 'LICENSE'
  })

  // Planning mode support
  files.push({
    path: 'src/planner.ts',
    content: generatePlanManager(config),
    type: 'typescript',
    template: 'src/planner.ts'
  })

  files.push({
    path: '.plans/.gitkeep',
    content: '# This directory stores plan files\n# Plans can be created with /plan <query> or --plan flag\n',
    type: 'shell',
    template: '.plans/.gitkeep'
  })

  // Workflow support files
  files.push({
    path: 'src/workflows.ts',
    content: generateWorkflowExecutor(config),
    type: 'typescript',
    template: 'src/workflows.ts'
  })

  // Add domain-specific workflows based on agent template
  const domain = config.domain || template?.domain

  // Knowledge domain workflows
  if (domain === 'knowledge') {
    files.push({
      path: '.commands/literature-review.json',
      content: generateLiteratureReviewWorkflow(),
      type: 'json',
      template: '.commands/literature-review.json'
    })
    files.push({
      path: '.commands/experiment-log.json',
      content: generateExperimentLogWorkflow(),
      type: 'json',
      template: '.commands/experiment-log.json'
    })
  }

  // Development domain workflows
  if (domain === 'development') {
    files.push({
      path: '.commands/code-audit.json',
      content: generateCodeAuditWorkflow(),
      type: 'json',
      template: '.commands/code-audit.json'
    })
    files.push({
      path: '.commands/test-suite.json',
      content: generateTestSuiteWorkflow(),
      type: 'json',
      template: '.commands/test-suite.json'
    })
    files.push({
      path: '.commands/refactor-analysis.json',
      content: generateRefactorAnalysisWorkflow(),
      type: 'json',
      template: '.commands/refactor-analysis.json'
    })
  }

  // Business domain workflows
  if (domain === 'business') {
    files.push({
      path: '.commands/invoice-batch.json',
      content: generateInvoiceBatchWorkflow(),
      type: 'json',
      template: '.commands/invoice-batch.json'
    })
    files.push({
      path: '.commands/contract-review.json',
      content: generateContractReviewWorkflow(),
      type: 'json',
      template: '.commands/contract-review.json'
    })
    files.push({
      path: '.commands/meeting-summary.json',
      content: generateMeetingSummaryWorkflow(),
      type: 'json',
      template: '.commands/meeting-summary.json'
    })
  }

  // Creative domain workflows
  if (domain === 'creative') {
    files.push({
      path: '.commands/content-calendar.json',
      content: generateContentCalendarWorkflow(),
      type: 'json',
      template: '.commands/content-calendar.json'
    })
    files.push({
      path: '.commands/blog-outline.json',
      content: generateBlogOutlineWorkflow(),
      type: 'json',
      template: '.commands/blog-outline.json'
    })
    files.push({
      path: '.commands/campaign-brief.json',
      content: generateCampaignBriefWorkflow(),
      type: 'json',
      template: '.commands/campaign-brief.json'
    })
  }

  // Data domain workflows
  if (domain === 'data') {
    files.push({
      path: '.commands/dataset-profile.json',
      content: generateDatasetProfileWorkflow(),
      type: 'json',
      template: '.commands/dataset-profile.json'
    })
    files.push({
      path: '.commands/chart-report.json',
      content: generateChartReportWorkflow(),
      type: 'json',
      template: '.commands/chart-report.json'
    })
  }

  // Claude Code configuration files (levers)
  const claudeCodeFiles = generateClaudeCodeFiles(config)
  files.push(...claudeCodeFiles)

  // Claude Config Loader (runtime loader for Claude Code files)
  files.push({
    path: 'src/claude-config.ts',
    content: generateClaudeConfigLoader(),
    type: 'typescript',
    template: 'src/claude-config.ts'
  })

  // Type declaration for inquirer-autocomplete-prompt
  files.push({
    path: 'src/inquirer-autocomplete.d.ts',
    content: `declare module 'inquirer-autocomplete-prompt' {
  import { PromptModule } from 'inquirer';
  const autocomplete: any;
  export default autocomplete;
}
`,
    type: 'typescript',
    template: 'src/inquirer-autocomplete.d.ts'
  })

  const metadata: ProjectMetadata = {
    generatedAt: new Date(),
    templateVersion: '1.0.0',
    agentWorkshopVersion: '0.1.0',
    dependencies: getDependencies(config),
    devDependencies: {
      '@types/node': '^20.10.0',
      '@types/inquirer': '^9.0.7',
      '@types/pdf-parse': '^1.1.4',
      'typescript': '^5.3.0',
      'ts-node': '^10.9.2'
    },
    scripts: {
      'build': 'tsc',
      'dev': 'tsc --watch',
      'start': 'node dist/cli.js',
      'test': 'node dist/cli.js --help'
    },
    buildInstructions: [
      'npm install',
      'npm run build',
      'npm run start'
    ],
    deploymentOptions: [
      'Local development',
      'Docker container',
      'npm global install',
      'Cloud deployment'
    ]
  }

  return {
    config,
    files,
    metadata
  }
}

function generatePackageJson(config: AgentConfig): string {
  const packageData: Record<string, any> = {
    name: config.packageName || config.projectName,
    version: config.version || '1.0.0',
    description: config.description || `${config.name} - AI Agent built with Agent Workshop`,
    main: 'dist/cli.js',
    bin: {
      [config.projectName]: './dist/cli.js'
    },
    scripts: {
      build: 'tsc',
      dev: 'tsc --watch',
      start: 'node dist/cli.js',
      test: 'node dist/cli.js --help',
      clean: 'rm -rf dist',
      prepare: 'npm run build',
      prepublishOnly: 'npm run build && npm test'
    },
    keywords: [
      'ai-agent',
      'cli',
      config.sdkProvider === 'claude' ? 'claude' : config.sdkProvider === 'openai' ? 'openai' : 'ai',
      'automation',
      config.domain,
      'assistant'
    ].filter(Boolean),
    author: config.author,
    license: config.license || 'MIT',
    type: 'module',
    engines: {
      node: '>=18.0.0'
    },
    files: [
      'dist/**/*',
      'README.md',
      'LICENSE'
    ],
    repository: config.repository ? {
      type: 'git',
      url: config.repository
    } : undefined,
    bugs: config.repository ? {
      url: `${config.repository.replace(/\.git$/, '')}/issues`
    } : undefined,
    homepage: config.repository ? config.repository.replace(/\.git$/, '') : undefined,
    publishConfig: {
      access: 'public'
    },
    dependencies: getDependencies(config),
    devDependencies: {
      '@types/node': '^20.10.0',
      '@types/inquirer': '^9.0.7',
      '@types/pdf-parse': '^1.1.4',
      'typescript': '^5.3.0'
    }
  }

  // Remove undefined fields
  Object.keys(packageData).forEach(key => {
    if (packageData[key] === undefined) {
      delete packageData[key]
    }
  })

  return JSON.stringify(packageData, null, 2)
}

function getDependencies(config: AgentConfig): Record<string, string> {
  const baseDeps: Record<string, string> = {
    'commander': '^12.0.0',
    'chalk': '^5.3.0',
    'ora': '^8.0.1',
    'inquirer': '^9.2.12',
    'inquirer-autocomplete-prompt': '^3.0.1',
    'dotenv': '^16.3.1'
  }
  
  // Add SDK-specific dependencies
  switch (config.sdkProvider) {
    case 'claude':
      baseDeps['@anthropic-ai/claude-agent-sdk'] = '^0.1.53'
      break
    case 'openai':
      baseDeps['@openai/agents'] = '^0.1.0'
      baseDeps['zod'] = '^3.0.0'
      break
    case 'huggingface':
      baseDeps['@huggingface/tiny-agents'] = '^0.3.4'
      baseDeps['@huggingface/mcp-client'] = '^0.1.0'
      baseDeps['@modelcontextprotocol/sdk'] = '^1.11.4'
      baseDeps['zod'] = '^3.25.0'
      break
  }
  
  // Add tool-specific dependencies
  const enabledTools = config.tools.filter(t => t.enabled)
  
  if (enabledTools.some(t => t.category === 'file')) {
    baseDeps['glob'] = '^10.3.10'
  }
  
  if (enabledTools.some(t => t.category === 'web')) {
    baseDeps['axios'] = '^1.6.0'
    baseDeps['cheerio'] = '^1.0.0-rc.12'
  }
  
  if (enabledTools.some(t => t.category === 'database')) {
    baseDeps['better-sqlite3'] = '^9.0.0'
  }
  
  if (enabledTools.some(t => KNOWLEDGE_TOOL_IDS.includes(t.id))) {
    baseDeps['pdf-parse'] = '^1.1.1'
    baseDeps['mammoth'] = '^1.7.2'
  }
  
  return baseDeps
}

function generateTsConfig(): string {
  return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src", 
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "useDefineForClassFields": true,
    "noEmitOnError": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ],
  "ts-node": {
    "esm": true,
    "experimentalSpecifierResolution": "node"
  }
}`
}

function generateCLI(config: AgentConfig, enabledTools: AgentConfig['tools']): string {
  const hasFileOps = enabledTools.some(t => t.category === 'file')
  const hasCommands = enabledTools.some(t => t.category === 'command')
  const isDARE = false // DARE templates removed

  return `#!/usr/bin/env node

import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import inquirerAutocomplete from 'inquirer-autocomplete-prompt';
import { ${sanitizeClassName(config.name)}Agent } from './agent.js';
import { ConfigManager } from './config.js';
import { PermissionManager, type PermissionPolicy } from './permissions.js';
import { PlanManager, formatAge, type Plan, type PlanStep } from './planner.js';
import { MCPConfigManager, type MCPServerConfig } from './mcp-config.js';
import { loadClaudeConfig, getCommand, expandCommand, type ClaudeConfig } from './claude-config.js';${isDARE ? `
import { DAREOrchestrator, type SubagentConfig } from './dare-orchestrator.js';` : ''}

// Register autocomplete prompt
inquirer.registerPrompt('autocomplete', inquirerAutocomplete);

// Load .env from current working directory (supports global installation)
const workingDir = process.cwd();
loadEnv({ path: resolve(workingDir, '.env') });

// Load Claude Code configuration (skills, commands, memory)
const claudeConfig = loadClaudeConfig(workingDir);

const program = new Command();

program
  .name('${config.projectName}')
  .description('${config.description || config.name + ' - AI Agent'}')
  .version('${config.version || '1.0.0'}');

// Config command
program
  .command('config')
  .description('Configure the agent')
  .option('--show', 'Show current configuration')
  .action(async (options) => {
    const configManager = new ConfigManager();
    await configManager.load();

    if (options.show) {
      const config = configManager.get();
      console.log(chalk.cyan('\\n📋 Current Configuration:'));
      console.log(chalk.gray('API Key:'), config.apiKey ? '***' + config.apiKey.slice(-4) : chalk.red('Not set'));
      console.log(chalk.gray('Source:'), process.env.${getApiKeyEnvVar(config.sdkProvider)} ? 'Environment variable' : 'Config file');
      return;
    }

    console.log(chalk.yellow('\\n🔐 API Key Configuration\\n'));
    console.log(chalk.white('To configure your API key, create a .env file in the project root:\\n'));
    console.log(chalk.gray('  echo "${getApiKeyEnvVar(config.sdkProvider)}=your-key-here" > .env\\n'));
    console.log(chalk.white('Or set the environment variable directly:\\n'));
    console.log(chalk.gray('  export ${getApiKeyEnvVar(config.sdkProvider)}=your-key-here\\n'));
    console.log(chalk.cyan('Tip: Copy .env.example to .env and fill in your API key.'));
  });

program
  .argument('[query]', 'Direct query to the agent')
  .option('-i, --interactive', 'Start interactive session')
  .option('-v, --verbose', 'Verbose output')
  .option('-p, --plan', 'Planning mode - create plan before executing')
  .action(async (query?: string, options?: { interactive?: boolean; verbose?: boolean; plan?: boolean }) => {
    try {
      const configManager = new ConfigManager();
      const config = await configManager.load();

      if (!configManager.hasApiKey()) {
        console.log(chalk.red('❌ No API key found.'));
        console.log(chalk.yellow('\\nCreate a .env file with your API key:'));
        console.log(chalk.gray('  echo "${getApiKeyEnvVar(config.sdkProvider)}=your-key-here" > .env'));
        console.log(chalk.yellow('\\nOr set the environment variable:'));
        console.log(chalk.gray('  export ${getApiKeyEnvVar(config.sdkProvider)}=your-key-here'));
        process.exit(1);
      }

      const permissionManager = new PermissionManager({ policy: '${config.permissions || 'balanced'}' });
      const agent = new ${sanitizeClassName(config.name)}Agent({
        verbose: options?.verbose || false,
        apiKey: config.apiKey,
        permissionManager
      });

      console.log(chalk.cyan.bold('\\n🤖 ${config.name}'));
      console.log(chalk.gray('${config.description || 'AI Agent for ' + config.domain}'));
      console.log(chalk.gray(\`📁 Working directory: \${workingDir}\\n\`));

      if (query && options?.plan) {
        // Planning mode with query
        await handlePlanningMode(agent, query, permissionManager);
      } else if (query) {
        await handleSingleQuery(agent, query, options?.verbose);
      } else {
        await handleInteractiveMode(agent, permissionManager, options?.verbose);
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

function parseSlashCommand(input: string): { command: string; args: Record<string, any>; error?: string } {
  // Remove leading slash
  const trimmed = input.slice(1).trim();

  // Split by spaces, but respect quotes
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];

    if ((char === '"' || char === "'") && (i === 0 || trimmed[i - 1] !== '\\\\')) {
      if (!inQuotes) {
        inQuotes = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuotes = false;
        quoteChar = '';
      } else {
        current += char;
      }
    } else if (char === ' ' && !inQuotes) {
      if (current) {
        parts.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current) {
    parts.push(current);
  }

  if (inQuotes) {
    return { command: '', args: {}, error: 'Unclosed quote in command' };
  }

  const command = parts[0];
  const args: Record<string, any> = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];

    if (part.startsWith('--')) {
      const key = part.slice(2);
      const nextPart = parts[i + 1];

      if (!nextPart || nextPart.startsWith('--')) {
        args[key] = true;
      } else {
        // Try to parse as number
        const numValue = Number(nextPart);
        args[key] = isNaN(numValue) ? nextPart : numValue;
        i++;
      }
    }
  }

  return { command, args };
}

/** Global to store stdin history - read at startup before commander parses */
let stdinHistory: Array<{role: string, content: string}> = [];

/** Read conversation history from stdin synchronously using fs */
function initStdinHistory(): void {
  // If stdin is a TTY (interactive), no history
  if (process.stdin.isTTY) {
    return;
  }

  try {
    // Read stdin synchronously using fs
    const fs = require('fs');
    const data = fs.readFileSync(0, 'utf8');  // fd 0 is stdin
    if (data.trim()) {
      const history = JSON.parse(data);
      if (Array.isArray(history)) {
        stdinHistory = history;
      }
    }
  } catch (e) {
    // No stdin data or invalid JSON, ignore
  }
}

async function handleSingleQuery(agent: any, query: string, verbose?: boolean) {
  // Use the global stdin history (read before commander.parse())
  const history = stdinHistory;

  const spinner = ora('Processing...').start();

  try {
    // Pass history to agent for multi-turn context
    const response = agent.query(query, history);
    spinner.stop();

    console.log(chalk.yellow('Query:'), query);
    console.log(chalk.green('Response:') + '\\n');

    for await (const message of response) {
      // Handle streaming text deltas for real-time output
      if (message.type === 'stream_event') {
        const event = (message as any).event;
        if (event?.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          process.stdout.write(event.delta.text || '');
        } else if (event?.type === 'content_block_start' && event.content_block?.type === 'tool_use') {
          // Show tool being called
          console.log(chalk.cyan(\`\\n🔧 Using tool: \${event.content_block.name}\`));
        } else if (event?.type === 'content_block_stop') {
          // Tool finished or content block ended
        }
      } else if (message.type === 'tool_result') {
        // Show tool result summary
        const result = (message as any).content;
        if (verbose && result) {
          console.log(chalk.gray(\`   ↳ Tool completed\`));
        }
      } else if (message.type === 'result') {
        // Display statistics (verbose mode only)
        if (verbose) {
          const stats = (message as any).content || message;
          if (stats.durationMs) {
            console.log(chalk.gray('\\n--- Statistics ---'));
            console.log(chalk.gray(\`Duration: \${stats.durationMs}ms\`));
            console.log(chalk.gray(\`Input tokens: \${stats.inputTokens}\`));
            console.log(chalk.gray(\`Output tokens: \${stats.outputTokens}\`));
            if (stats.cacheReadTokens) console.log(chalk.gray(\`Cache read: \${stats.cacheReadTokens}\`));
          }
        }
      } else if (message.type === 'system') {
        // System messages (verbose mode only)
        if (verbose) console.log(chalk.blue(\`[system] \${(message as any).content || (message as any).subtype || ''}\`));
      }
    }

    console.log('\\n');
  } catch (error) {
    spinner.fail('Failed to process query');
    throw error;
  }
}

async function handleInteractiveMode(agent: any, permissionManager: PermissionManager, verbose?: boolean) {
  // Load workflow executor
  const { WorkflowExecutor } = await import('./workflows.js');
  const workflowExecutor = new WorkflowExecutor(agent.permissionManager);
  const planManager = new PlanManager();

  // Build list of all available slash commands
  const builtinCommands = [
    { name: 'help', description: 'Show available commands' },
    { name: 'quit', description: 'Exit the agent' },
    { name: 'exit', description: 'Exit the agent' },
    { name: 'plan', description: 'Create a plan for a task' },
    { name: 'plans', description: 'List all pending plans' },
    { name: 'execute', description: 'Execute plan by number' },
    { name: 'plan-delete', description: 'Delete plans' },
    { name: 'mcp-list', description: 'List configured MCP servers' },
    { name: 'mcp-add', description: 'Add a new MCP server' },
    { name: 'mcp-remove', description: 'Remove an MCP server' },
    { name: 'mcp-toggle', description: 'Enable/disable an MCP server' },
    { name: 'command-add', description: 'Create a new custom slash command' },
    { name: 'command-list', description: 'List all custom commands' },
    { name: 'skill-add', description: 'Create a new skill' },
    { name: 'skill-list', description: 'List all available skills' },${hasFileOps ? `
    { name: 'files', description: 'List files in current directory' },` : ''}${hasCommands ? `
    { name: 'run', description: 'Execute a command' },` : ''}${config.domain === 'knowledge' ? `
    { name: 'literature-review', description: 'Systematic literature review with citations' },
    { name: 'experiment-log', description: 'Structured experiment log with traceability' },` : ''}${config.domain === 'development' ? `
    { name: 'code-audit', description: 'Comprehensive code audit for technical debt and security' },
    { name: 'test-suite', description: 'Generate comprehensive test suite' },
    { name: 'refactor-analysis', description: 'Analyze code for refactoring opportunities' },` : ''}${config.domain === 'business' ? `
    { name: 'invoice-batch', description: 'Batch process invoices into structured data' },
    { name: 'contract-review', description: 'Analyze contract terms, obligations, and risks' },
    { name: 'meeting-summary', description: 'Process transcripts into structured summaries' },` : ''}${config.domain === 'creative' ? `
    { name: 'content-calendar', description: 'Generate 30-day social media content calendar' },
    { name: 'blog-outline', description: 'Create SEO-optimized blog post outline' },
    { name: 'campaign-brief', description: 'Generate multi-channel marketing campaign brief' },` : ''}${config.domain === 'data' ? `
    { name: 'dataset-profile', description: 'Analyze dataset with statistical profile' },
    { name: 'chart-report', description: 'Generate visualization report with insights' },` : ''}${isDARE ? `
    { name: 'dare-status', description: 'Show DARE project status' },
    { name: 'dare-discover', description: 'Start Discovery phase' },
    { name: 'dare-assess', description: 'Start Assessment phase' },
    { name: 'dare-roadmap', description: 'Start Roadmap phase' },
    { name: 'dare-execute', description: 'Start Execution phase' },
    { name: 'dare-citations', description: 'Export all citations' },
    { name: 'dare-reset', description: 'Reset DARE project' },` : ''}
  ];

  // Add Claude Code commands from .claude/commands/
  const allCommands = [
    ...builtinCommands,
    ...claudeConfig.commands.map(c => ({ name: c.name, description: c.description || 'Custom command' }))
  ];

  // Autocomplete source function
  const commandSource = async (answers: any, input: string) => {
    input = input || '';

    // Only show autocomplete when typing slash commands
    if (!input.startsWith('/')) {
      return [];
    }

    const search = input.slice(1).toLowerCase();
    const matches = allCommands.filter(cmd =>
      cmd.name.toLowerCase().startsWith(search)
    );

    return matches.map(cmd => ({
      name: \`/\${cmd.name} - \${cmd.description}\`,
      value: \`/\${cmd.name}\`,
      short: \`/\${cmd.name}\`
    }));
  };

  console.log(chalk.gray('Type your questions, or:'));
  console.log(chalk.gray('• /help - Show available commands'));
  console.log(chalk.gray('• /plan <query> - Create a plan before executing'));
  console.log(chalk.gray('• /quit or Ctrl+C - Exit'));
  if (claudeConfig.commands.length > 0) {
    console.log(chalk.gray(\`• \${claudeConfig.commands.length} custom commands available (type / to see them)\`));
  }
  console.log();

  while (true) {
    try {
      const { input } = await inquirer.prompt([
        {
          type: 'autocomplete',
          name: 'input',
          message: chalk.cyan('${config.projectName}>'),
          prefix: '',
          source: commandSource,
          suggestOnly: true,  // Allow free text input
          emptyText: '',      // Don't show "no results" message
        }
      ]);

      if (!input.trim()) continue;

      if (input === '/quit' || input === '/exit') {
        console.log(chalk.yellow('\\n👋 Goodbye!'));
        break;
      }

      if (input === '/help') {
        console.log(chalk.cyan.bold('\\n📚 Available Commands:'));
        console.log(chalk.gray('• /help - Show this help'));
        console.log(chalk.gray('• /quit - Exit the agent'));${hasFileOps ? `
        console.log(chalk.gray('• /files - List files in current directory'));` : ''}${hasCommands ? `
        console.log(chalk.gray('• /run <command> - Execute a command'));` : ''}
        console.log(chalk.gray('\\n📋 Planning Commands:'));
        console.log(chalk.gray('• /plan <query> - Create a plan for a task'));
        console.log(chalk.gray('• /plans - List all pending plans'));
        console.log(chalk.gray('• /execute <num> - Execute plan by number'));
        console.log(chalk.gray('• /plan-delete <num|all|all-completed> - Delete plans'));
        console.log(chalk.gray('• <number> - Quick shortcut to execute plan by number'));
        console.log(chalk.gray('\\n🔌 MCP Server Commands:'));
        console.log(chalk.gray('• /mcp-list - List configured MCP servers'));
        console.log(chalk.gray('• /mcp-add - Add a new MCP server (interactive)'));
        console.log(chalk.gray('• /mcp-remove [name] - Remove an MCP server'));
        console.log(chalk.gray('• /mcp-toggle [name] - Enable/disable an MCP server'));
        console.log(chalk.gray('\\n✨ Customization Commands:'));
        console.log(chalk.gray('• /command-add - Create a new custom slash command'));
        console.log(chalk.gray('• /command-list - List all custom commands'));
        console.log(chalk.gray('• /skill-add - Create a new skill'));
        console.log(chalk.gray('• /skill-list - List all available skills'));
        console.log(chalk.gray('\\n🔮 Workflow Commands:'));${config.domain === 'knowledge' ? `
        console.log(chalk.gray('• /literature-review --sources <path> [--output <path>] [--limit <number>]'));
        console.log(chalk.gray('  Systematic literature review with citations'));
        console.log(chalk.gray('• /experiment-log --hypothesis "<text>" [--data <path>] [--context "<text>"]'));
        console.log(chalk.gray('  Structured experiment log with traceability'));` : ''}${config.domain === 'development' ? `
        console.log(chalk.gray('• /code-audit --path <dir> [--output <path>] [--focus <area>]'));
        console.log(chalk.gray('  Comprehensive code audit for technical debt and security'));
        console.log(chalk.gray('• /test-suite --target <file> [--framework <name>] [--output <path>]'));
        console.log(chalk.gray('  Generate comprehensive test suite'));
        console.log(chalk.gray('• /refactor-analysis --target <file> [--goal <objective>]'));
        console.log(chalk.gray('  Analyze code for refactoring opportunities'));` : ''}${config.domain === 'business' ? `
        console.log(chalk.gray('• /invoice-batch --input <dir> [--output <path>]'));
        console.log(chalk.gray('  Batch process invoices into structured data'));
        console.log(chalk.gray('• /contract-review --contract <file> [--type <contract_type>]'));
        console.log(chalk.gray('  Analyze contract terms, obligations, and risks'));
        console.log(chalk.gray('• /meeting-summary --transcript <file> [--meeting_type <type>]'));
        console.log(chalk.gray('  Process transcripts into structured summaries'));` : ''}${config.domain === 'creative' ? `
        console.log(chalk.gray('• /content-calendar --brand <name> --industry <niche> [--platforms <list>]'));
        console.log(chalk.gray('  Generate 30-day social media content calendar'));
        console.log(chalk.gray('• /blog-outline --topic "<title>" [--target_audience <audience>] [--word_count <n>]'));
        console.log(chalk.gray('  Create SEO-optimized blog post outline'));
        console.log(chalk.gray('• /campaign-brief --product <name> --goal <objective> [--channels <list>]'));
        console.log(chalk.gray('  Generate multi-channel marketing campaign brief'));` : ''}${config.domain === 'data' ? `
        console.log(chalk.gray('• /dataset-profile --data <file> [--output <path>]'));
        console.log(chalk.gray('  Analyze dataset with statistical profile'));
        console.log(chalk.gray('• /chart-report --data <file> [--focus <analysis_type>]'));
        console.log(chalk.gray('  Generate visualization report with insights'));` : ''}${isDARE ? `
        console.log(chalk.gray('\\n🎯 DARE Methodology Commands:'));
        console.log(chalk.gray('• /dare-status - Show DARE project status'));
        console.log(chalk.gray('• /dare-discover --target <path> - Start Discovery phase'));
        console.log(chalk.gray('• /dare-assess [--focus <area>] - Start Assessment phase'));
        console.log(chalk.gray('• /dare-roadmap [--strategy <type>] - Start Roadmap phase'));
        console.log(chalk.gray('• /dare-execute [--workItem <id>] - Start Execution phase'));
        console.log(chalk.gray('• /dare-citations [--output <file>] - Export all citations'));
        console.log(chalk.gray('• /dare-reset - Reset DARE project'));` : ''}

        // Show custom Claude Code commands if any
        if (claudeConfig.commands.length > 0) {
          console.log(chalk.gray('\\n📌 Custom Commands:'));
          claudeConfig.commands.forEach(cmd => {
            console.log(chalk.gray(\`• /\${cmd.name} - \${cmd.description || 'Custom command'}\`));
          });
        }

        // Show available skills if any
        if (claudeConfig.skills.length > 0) {
          console.log(chalk.gray('\\n🎯 Available Skills:'));
          claudeConfig.skills.forEach(skill => {
            console.log(chalk.gray(\`• \${skill.name} - \${skill.description}\`));
          });
          console.log(chalk.gray('  (Say "use <skill>" or "run the <skill> skill" to invoke)'));
        }

        console.log(chalk.gray('\\n💡 Ask me anything about ${config.domain}!\\n'));
        continue;
      }

      // Handle planning commands
      if (input.startsWith('/plan ')) {
        const query = input.slice(6).trim();
        await handlePlanningMode(agent, query, permissionManager);
        continue;
      }

      if (input === '/plans') {
        await listPlans(planManager);
        continue;
      }

      if (input.startsWith('/execute ')) {
        const arg = input.slice(9).trim();
        await executePlanByRef(arg, agent, permissionManager, planManager);
        continue;
      }

      if (input.startsWith('/plan-delete ')) {
        const arg = input.slice(13).trim();
        await deletePlanByRef(arg, planManager);
        continue;
      }

      // Quick shortcut: just type a number to execute that plan
      if (/^\\d+$/.test(input.trim())) {
        const planNum = parseInt(input.trim());
        await executePlanByNumber(planNum, agent, permissionManager, planManager);
        continue;
      }

      // Handle MCP commands
      if (input === '/mcp-list') {
        await handleMcpList();
        continue;
      }

      if (input === '/mcp-add') {
        await handleMcpAdd();
        continue;
      }

      if (input.startsWith('/mcp-remove')) {
        const name = input.slice(11).trim();
        await handleMcpRemove(name);
        continue;
      }

      if (input.startsWith('/mcp-toggle')) {
        const name = input.slice(11).trim();
        await handleMcpToggle(name);
        continue;
      }

      // Handle command/skill creation
      if (input === '/command-add') {
        await handleCommandAdd();
        continue;
      }

      if (input === '/command-list') {
        handleCommandList();
        continue;
      }

      if (input === '/skill-add') {
        await handleSkillAdd();
        continue;
      }

      if (input === '/skill-list') {
        handleSkillList();
        continue;
      }${isDARE ? `

      // Handle DARE commands
      if (input.startsWith('/dare-')) {
        const { command, args, error } = parseSlashCommand(input);
        if (error) {
          console.log(chalk.red(\`Error: \${error}\`));
          continue;
        }

        const handled = await handleDareCommand(command, args, agent, verbose || false);
        if (handled) continue;
      }` : ''}

      // Handle slash commands (including custom Claude Code commands)
      if (input.startsWith('/')) {
        const { command, args, error} = parseSlashCommand(input);

        if (error) {
          console.log(chalk.red(\`Error: \${error}\`));
          continue;
        }

        // Check for custom Claude Code command first
        const customCmd = getCommand(claudeConfig.commands, command);
        if (customCmd) {
          // Get any positional arguments after the command name
          const inputAfterCommand = input.slice(command.length + 2).trim();
          const positionalArgs = inputAfterCommand.split(/\\s+/).filter(Boolean);

          // Expand the command template with arguments
          const expandedPrompt = expandCommand(customCmd, inputAfterCommand);

          console.log(chalk.cyan(\`\\n📋 Running /\${command}...\\n\`));

          // Send the expanded prompt to the agent
          const spinner = ora('Processing command...').start();
          try {
            const response = agent.query(expandedPrompt);
            spinner.stop();

            for await (const message of response) {
              if (message.type === 'stream_event') {
                const event = (message as any).event;
                if (event?.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                  process.stdout.write(event.delta.text || '');
                } else if (event?.type === 'content_block_start' && event.content_block?.type === 'tool_use') {
                  console.log(chalk.cyan(\`\\n🔧 Using tool: \${event.content_block.name}\`));
                }
              } else if (message.type === 'tool_result') {
                if (verbose) console.log(chalk.gray(\`   ↳ Tool completed\`));
              }
            }
            console.log('\\n');
          } catch (error) {
            spinner.fail('Command failed');
            console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
          }
          continue;
        }

        // List of all possible workflow commands
        const validCommands = [
          'literature-review', 'experiment-log',
          'code-audit', 'test-suite', 'refactor-analysis',
          'invoice-batch', 'contract-review', 'meeting-summary',
          'content-calendar', 'blog-outline', 'campaign-brief',
          'dataset-profile', 'chart-report'
        ];

        if (validCommands.includes(command)) {
          try {
            const workflow = await workflowExecutor.loadWorkflow(command);
            const context = {
              variables: new Map(),
              agent,
              permissionManager: agent.permissionManager
            };

            await workflowExecutor.execute(workflow, args, context);
            continue;
          } catch (error) {
            console.error(chalk.red('Workflow error:'), error instanceof Error ? error.message : String(error));
            continue;
          }
        }

        console.log(chalk.yellow(\`Unknown command: /\${command}\`));
        console.log(chalk.gray('Type /help to see available commands'));
        continue;
      }

      const spinner = ora('Processing...').start();

      try {
        const response = agent.query(input);
        spinner.stop();

        console.log();

        for await (const message of response) {
          // Handle streaming text deltas for real-time output
          if (message.type === 'stream_event') {
            const event = (message as any).event;
            if (event?.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              process.stdout.write(event.delta.text || '');
            } else if (event?.type === 'content_block_start' && event.content_block?.type === 'tool_use') {
              // Show tool being called
              console.log(chalk.cyan(\`\\n🔧 Using tool: \${event.content_block.name}\`));
            }
          } else if (message.type === 'tool_result') {
            // Show tool result summary
            const result = (message as any).content;
            if (verbose && result) {
              console.log(chalk.gray(\`   ↳ Tool completed\`));
            }
          } else if (message.type === 'result') {
            // Display statistics (verbose mode only)
            if (verbose) {
              const stats = (message as any).content || message;
              if (stats.durationMs) {
                console.log(chalk.gray('\\n--- Statistics ---'));
                console.log(chalk.gray(\`Duration: \${stats.durationMs}ms\`));
                console.log(chalk.gray(\`Input tokens: \${stats.inputTokens}\`));
                console.log(chalk.gray(\`Output tokens: \${stats.outputTokens}\`));
                if (stats.cacheReadTokens) console.log(chalk.gray(\`Cache read: \${stats.cacheReadTokens}\`));
              }
            }
          } else if (message.type === 'system') {
            // System messages (verbose mode only)
            if (verbose) console.log(chalk.blue(\`[system] \${(message as any).content || (message as any).subtype || ''}\`));
          }
        }

        console.log('\\n');
      } catch (error) {
        spinner.fail('Failed to process query');
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('User force closed')) {
        console.log(chalk.yellow('\\n\\n👋 Goodbye!'));
        break;
      }
      console.error(chalk.red('Unexpected error:'), error);
    }
  }
}

// MCP Server management functions
async function handleMcpList() {
  const mcpConfig = new MCPConfigManager();
  await mcpConfig.load();

  console.log(chalk.cyan.bold('\\n📦 MCP Servers\\n'));
  console.log(mcpConfig.formatServerList());
  console.log(chalk.gray(\`\\nConfig: \${process.cwd()}/.mcp.json\\n\`));
}

async function handleMcpAdd() {
  const mcpConfig = new MCPConfigManager();
  await mcpConfig.load();

  console.log(chalk.cyan.bold('\\n📦 Add MCP Server\\n'));

  // Step 1: Server name
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Server name (lowercase, alphanumeric, hyphens):',
      validate: (input: string) => {
        if (!input.trim()) return 'Name is required';
        if (!/^[a-z][a-z0-9-]*$/.test(input)) {
          return 'Name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens';
        }
        if (mcpConfig.getServers()[input]) {
          return 'A server with this name already exists';
        }
        return true;
      }
    }
  ]);

  // Step 2: Transport type
  const { transportType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'transportType',
      message: 'Transport type:',
      choices: [
        { name: 'Stdio (local command)', value: 'stdio' },
        { name: 'HTTP (REST endpoint)', value: 'http' },
        { name: 'SSE (Server-Sent Events)', value: 'sse' },
        { name: 'SDK (in-process module)', value: 'sdk' }
      ]
    }
  ]);

  let serverConfig: MCPServerConfig;

  if (transportType === 'stdio') {
    const { command, args } = await inquirer.prompt([
      {
        type: 'input',
        name: 'command',
        message: 'Command to run:',
        default: 'npx',
        validate: (input: string) => input.trim() ? true : 'Command is required'
      },
      {
        type: 'input',
        name: 'args',
        message: 'Arguments (space-separated):',
        default: '-y @modelcontextprotocol/server-filesystem'
      }
    ]);

    serverConfig = {
      type: 'stdio',
      command: command.trim(),
      args: args.trim() ? args.trim().split(/\\s+/) : [],
      enabled: true
    };
  } else if (transportType === 'http' || transportType === 'sse') {
    const { url } = await inquirer.prompt([
      {
        type: 'input',
        name: 'url',
        message: 'Server URL:',
        validate: (input: string) => {
          if (!input.trim()) return 'URL is required';
          try {
            const testUrl = input.replace(/\\$\\{[^}]+\\}/g, 'placeholder');
            new URL(testUrl);
            return true;
          } catch {
            return 'Invalid URL format';
          }
        }
      }
    ]);

    serverConfig = {
      type: transportType,
      url: url.trim(),
      enabled: true
    } as MCPServerConfig;
  } else {
    const { serverModule } = await inquirer.prompt([
      {
        type: 'input',
        name: 'serverModule',
        message: 'Module path:',
        default: './custom-mcp-server.js',
        validate: (input: string) => input.trim() ? true : 'Module path is required'
      }
    ]);

    serverConfig = {
      type: 'sdk',
      serverModule: serverModule.trim(),
      enabled: true
    };
  }

  // Step 3: Optional description
  const { description } = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Description (optional):'
    }
  ]);

  if (description.trim()) {
    serverConfig.description = description.trim();
  }

  await mcpConfig.addServer(name, serverConfig);
  console.log(chalk.green(\`\\n✓ Server '\${name}' added successfully!\\n\`));
  console.log(chalk.yellow('Note: Restart the agent to load the new server.\\n'));
}

async function handleMcpRemove(name?: string) {
  const mcpConfig = new MCPConfigManager();
  await mcpConfig.load();

  const servers = Object.keys(mcpConfig.getServers());

  if (servers.length === 0) {
    console.log(chalk.yellow('\\nNo MCP servers configured.\\n'));
    return;
  }

  let serverName = name?.trim();

  if (!serverName) {
    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: 'Select server to remove:',
        choices: servers
      }
    ]);
    serverName = selected;
  }

  if (!servers.includes(serverName!)) {
    console.log(chalk.red(\`\\nServer '\${serverName}' not found.\\n\`));
    return;
  }

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: \`Remove server '\${serverName}'?\`,
      default: false
    }
  ]);

  if (confirm) {
    await mcpConfig.removeServer(serverName!);
    console.log(chalk.green(\`\\n✓ Server '\${serverName}' removed.\\n\`));
  } else {
    console.log(chalk.gray('\\nCancelled.\\n'));
  }
}

async function handleMcpToggle(name?: string) {
  const mcpConfig = new MCPConfigManager();
  await mcpConfig.load();

  const servers = mcpConfig.getServers();
  const serverNames = Object.keys(servers);

  if (serverNames.length === 0) {
    console.log(chalk.yellow('\\nNo MCP servers configured.\\n'));
    return;
  }

  let serverName = name?.trim();

  if (!serverName) {
    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: 'Select server to toggle:',
        choices: serverNames.map(n => ({
          name: \`\${n} (\${servers[n].enabled !== false ? 'enabled' : 'disabled'})\`,
          value: n
        }))
      }
    ]);
    serverName = selected;
  }

  if (!serverNames.includes(serverName!)) {
    console.log(chalk.red(\`\\nServer '\${serverName}' not found.\\n\`));
    return;
  }

  const wasEnabled = servers[serverName!].enabled !== false;
  await mcpConfig.toggleServer(serverName!);
  console.log(chalk.green(\`\\n✓ Server '\${serverName}' \${wasEnabled ? 'disabled' : 'enabled'}.\\n\`));
  console.log(chalk.yellow('Note: Restart the agent to apply changes.\\n'));
}

// Custom command creation handler
async function handleCommandAdd() {
  console.log(chalk.cyan.bold('\\n✨ Create New Slash Command\\n'));

  const { name, description, template } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Command name (without /):',
      validate: (input: string) => {
        if (!input.trim()) return 'Name is required';
        if (!/^[a-z][a-z0-9-]*$/.test(input)) {
          return 'Name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description:',
      validate: (input: string) => input.trim() ? true : 'Description is required'
    },
    {
      type: 'editor',
      name: 'template',
      message: 'Command template (use $ARGUMENTS for all args, $1, $2 for positional):',
      default: 'Perform the following task:\\n\\n$ARGUMENTS'
    }
  ]);

  // Create .claude/commands directory if it doesn't exist
  const commandsDir = path.join(workingDir, '.claude', 'commands');
  if (!fs.existsSync(commandsDir)) {
    fs.mkdirSync(commandsDir, { recursive: true });
  }

  // Create the command file
  const content = \`---
description: \${description}
---

\${template}
\`;

  const filePath = path.join(commandsDir, \`\${name}.md\`);
  fs.writeFileSync(filePath, content);

  console.log(chalk.green(\`\\n✓ Created command /\${name}\`));
  console.log(chalk.gray(\`  File: \${filePath}\`));
  console.log(chalk.yellow('\\nRestart the agent to use the new command.\\n'));

  // Reload the config to pick up the new command
  Object.assign(claudeConfig, loadClaudeConfig(workingDir));
}

function handleCommandList() {
  console.log(chalk.cyan.bold('\\n📋 Custom Slash Commands\\n'));

  if (claudeConfig.commands.length === 0) {
    console.log(chalk.gray('No custom commands defined.'));
    console.log(chalk.gray('Use /command-add to create one.\\n'));
    return;
  }

  claudeConfig.commands.forEach(cmd => {
    console.log(chalk.white(\`  /\${cmd.name}\`));
    console.log(chalk.gray(\`    \${cmd.description || 'No description'}\`));
    console.log(chalk.gray(\`    File: \${cmd.filePath}\\n\`));
  });
}

// Custom skill creation handler
async function handleSkillAdd() {
  console.log(chalk.cyan.bold('\\n🎯 Create New Skill\\n'));

  const { name, description, tools, instructions } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Skill name:',
      validate: (input: string) => {
        if (!input.trim()) return 'Name is required';
        if (!/^[a-z][a-z0-9-]*$/.test(input)) {
          return 'Name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description:',
      validate: (input: string) => input.trim() ? true : 'Description is required'
    },
    {
      type: 'checkbox',
      name: 'tools',
      message: 'Select tools this skill can use:',
      choices: [
        { name: 'Read files', value: 'Read' },
        { name: 'Write files', value: 'Write' },
        { name: 'Run commands', value: 'Bash' },
        { name: 'Web search', value: 'WebSearch' },
        { name: 'Web fetch', value: 'WebFetch' }
      ],
      default: ['Read']
    },
    {
      type: 'editor',
      name: 'instructions',
      message: 'Skill instructions (what should the agent do when this skill is invoked?):',
      default: '# Skill Instructions\\n\\nWhen this skill is invoked:\\n\\n1. First, understand the user\\'s request\\n2. Apply your expertise to solve the problem\\n3. Provide a clear, actionable response'
    }
  ]);

  // Create .claude/skills/<name> directory
  const skillDir = path.join(workingDir, '.claude', 'skills', name);
  if (!fs.existsSync(skillDir)) {
    fs.mkdirSync(skillDir, { recursive: true });
  }

  // Create the SKILL.md file
  const content = \`---
description: \${description}
tools: \${tools.join(', ')}
---

\${instructions}
\`;

  const filePath = path.join(skillDir, 'SKILL.md');
  fs.writeFileSync(filePath, content);

  console.log(chalk.green(\`\\n✓ Created skill: \${name}\`));
  console.log(chalk.gray(\`  File: \${filePath}\`));
  console.log(chalk.yellow('\\nRestart the agent to use the new skill.'));
  console.log(chalk.gray('Invoke it by saying "use ' + name + '" or "run the ' + name + ' skill"\\n'));

  // Reload the config to pick up the new skill
  Object.assign(claudeConfig, loadClaudeConfig(workingDir));
}

function handleSkillList() {
  console.log(chalk.cyan.bold('\\n🎯 Available Skills\\n'));

  if (claudeConfig.skills.length === 0) {
    console.log(chalk.gray('No skills defined.'));
    console.log(chalk.gray('Use /skill-add to create one.\\n'));
    return;
  }

  claudeConfig.skills.forEach(skill => {
    console.log(chalk.white(\`  \${skill.name}\`));
    console.log(chalk.gray(\`    \${skill.description}\`));
    console.log(chalk.gray(\`    Tools: \${skill.tools.join(', ') || 'none'}\`));
    console.log(chalk.gray(\`    File: \${skill.filePath}\\n\`));
  });
}
${isDARE ? `

// DARE command handler
type DAREPhase = 'discover' | 'assess' | 'roadmap' | 'execute';
let dareOrchestrator: DAREOrchestrator | null = null;

function getOrchestrator(projectId: string = 'default', verbose: boolean = false): DAREOrchestrator {
  if (!dareOrchestrator || dareOrchestrator.getStore().getProject().projectId !== projectId) {
    dareOrchestrator = new DAREOrchestrator(projectId, verbose);
  }
  return dareOrchestrator;
}

async function handleDareCommand(
  command: string,
  args: Record<string, any>,
  agent: any,
  verbose: boolean
): Promise<boolean> {
  const projectId = args.project || 'default';
  const orchestrator = getOrchestrator(projectId, verbose);

  switch (command) {
    case 'dare-status': {
      const status = orchestrator.getStatus();
      console.log(chalk.cyan.bold('\\n📊 DARE Project Status\\n'));
      console.log(chalk.white('Current Phase:'), chalk.yellow(status.currentPhase.toUpperCase()));
      console.log(chalk.white('Completed:'), status.completedPhases.map((p: string) => chalk.green(p)).join(', ') || 'none');
      console.log(chalk.white('Pending:'), status.pendingPhases.map((p: string) => chalk.gray(p)).join(', ') || 'none');
      console.log(chalk.gray('\\n' + status.summary));
      return true;
    }

    case 'dare-discover':
    case 'dare-assess':
    case 'dare-roadmap':
    case 'dare-execute': {
      const phase = command.replace('dare-', '') as DAREPhase;
      const result = await orchestrator.startPhase(phase);

      if (!result.canStart) {
        console.log(chalk.red(\`\\n❌ \${result.reason}\`));
        return true;
      }

      // Set target if provided (for discover phase)
      if (args.target) {
        orchestrator.getStore().setTarget(args.target);
      }

      console.log(chalk.cyan(\`\\n🔍 Starting \${phase.toUpperCase()} phase...\\n\`));

      // Build enhanced prompt with focus/strategy if provided
      let prompt = result.prompt;
      if (args.focus) {
        prompt += \`\\n\\nFocus area: \${args.focus}\`;
      }
      if (args.strategy) {
        prompt += \`\\n\\nPreferred strategy: \${args.strategy}\`;
      }
      if (args.workItem) {
        prompt += \`\\n\\nExecute work item: \${args.workItem}\`;
      }

      // Run agent with phase prompt
      const spinner = ora('Processing...').start();
      try {
        const response = agent.query(prompt);
        spinner.stop();

        for await (const message of response) {
          if (message.type === 'stream_event') {
            const event = (message as any).event;
            if (event?.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              process.stdout.write(event.delta.text || '');
            }
          }
        }

        // Mark phase complete (unless execute which is ongoing)
        if (phase !== 'execute') {
          const nextPhase = orchestrator.completePhase(phase);
          if (nextPhase) {
            console.log(chalk.green(\`\\n\\n✅ \${phase.toUpperCase()} complete. Next: \${nextPhase.toUpperCase()}\`));
          } else {
            console.log(chalk.green(\`\\n\\n✅ \${phase.toUpperCase()} complete.\`));
          }
        }
      } catch (error) {
        spinner.fail('Phase execution failed');
        throw error;
      }

      return true;
    }

    case 'dare-citations': {
      const citations = orchestrator.exportCitations();
      const outputPath = args.output || 'CITATIONS.md';

      const fs = await import('fs');
      fs.writeFileSync(outputPath, citations);
      console.log(chalk.green(\`\\n✅ Citations exported to \${outputPath}\`));
      return true;
    }

    case 'dare-reset': {
      orchestrator.reset();
      console.log(chalk.yellow('\\n🔄 DARE project reset'));
      return true;
    }

    default:
      return false;
  }
}` : ''}

// Planning mode helper functions
async function handlePlanningMode(agent: any, query: string, pm: PermissionManager) {
  const planManager = new PlanManager();

  console.log(chalk.cyan('\\n📋 Planning Mode'));
  console.log(chalk.gray('Analyzing: ' + query + '\\n'));

  const spinner = ora('Creating plan...').start();

  try {
    // Query the agent in planning mode to analyze and create a plan
    const planPrompt = \`You are in PLANNING MODE. Analyze this request and create a structured plan.

REQUEST: \${query}

Create a plan with the following format:
1. A brief summary (1 sentence)
2. Your analysis of what needs to be done
3. Step-by-step actions with risk assessment
4. Rollback strategy if something goes wrong

Output your plan in this exact format:

SUMMARY: [one sentence describing what will be accomplished]

ANALYSIS:
[what you discovered and your approach]

STEPS:
1. [Step Name] | Action: [read/write/edit/command/query] | Target: [file or command] | Purpose: [why] | Risk: [low/medium/high]
2. [Next step...]

ROLLBACK:
- [How to undo if needed]
- [Additional recovery steps]\`;

    let planText = '';
    const response = agent.query(planPrompt);

    for await (const message of response) {
      if (message.type === 'stream_event') {
        const event = (message as any).event;
        if (event?.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          planText += event.delta.text || '';
        }
      }
    }

    spinner.stop();

    // Parse the plan response
    const plan = parsePlanResponse(planText, query, planManager);

    // Display plan
    displayPlan(plan);

    // Save plan
    const planPath = await planManager.savePlan(plan);
    console.log(chalk.gray('\\nPlan saved: ' + planPath));

    // Prompt for action
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Execute now', value: 'execute' },
        { name: 'Edit plan first (opens in editor)', value: 'edit' },
        { name: 'Save for later', value: 'save' },
        { name: 'Discard', value: 'discard' }
      ]
    }]);

    if (action === 'execute') {
      await executePlan(plan, agent, pm, planManager);
    } else if (action === 'edit') {
      console.log(chalk.yellow('\\nEdit: ' + planPath));
      console.log(chalk.gray('Then run: /execute ' + planPath));
    } else if (action === 'save') {
      const pending = (await planManager.listPlans()).filter(p => p.plan.status === 'pending').length;
      console.log(chalk.green(\`\\n✅ Plan saved. You now have \${pending} pending plan(s).\`));
      console.log(chalk.cyan('\\nTo return to this plan later:'));
      console.log(chalk.gray('  /plans          - List all pending plans'));
      console.log(chalk.gray('  /execute 1      - Execute plan #1'));
      console.log(chalk.gray('  1               - Shortcut: just type the number'));
    } else if (action === 'discard') {
      await planManager.deletePlan(plan.id);
      console.log(chalk.yellow('Plan discarded.'));
    }
  } catch (error) {
    spinner.fail('Failed to create plan');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
  }
}

function parsePlanResponse(text: string, query: string, planManager: PlanManager): Plan {
  const summaryMatch = text.match(/SUMMARY:\\s*(.+?)(?=\\n|ANALYSIS:)/s);
  const analysisMatch = text.match(/ANALYSIS:\\s*([\\s\\S]+?)(?=STEPS:|$)/);
  const stepsMatch = text.match(/STEPS:\\s*([\\s\\S]+?)(?=ROLLBACK:|$)/);
  const rollbackMatch = text.match(/ROLLBACK:\\s*([\\s\\S]+?)$/);

  const steps: PlanStep[] = [];
  if (stepsMatch) {
    const stepLines = stepsMatch[1].trim().split('\\n').filter(l => l.trim());
    let stepNum = 1;
    for (const line of stepLines) {
      const match = line.match(/\\d+\\.\\s*(.+?)\\s*\\|\\s*Action:\\s*(\\w+)\\s*\\|\\s*Target:\\s*(.+?)\\s*\\|\\s*Purpose:\\s*(.+?)\\s*\\|\\s*Risk:\\s*(\\w+)/i);
      if (match) {
        steps.push({
          id: \`step-\${stepNum++}\`,
          name: match[1].trim(),
          action: match[2].toLowerCase() as PlanStep['action'],
          target: match[3].trim(),
          purpose: match[4].trim(),
          risk: match[5].toLowerCase() as PlanStep['risk'],
          status: 'pending'
        });
      }
    }
  }

  const rollbackStrategy: string[] = [];
  if (rollbackMatch) {
    const rollbackLines = rollbackMatch[1].trim().split('\\n');
    for (const line of rollbackLines) {
      const clean = line.replace(/^-\\s*/, '').trim();
      if (clean) rollbackStrategy.push(clean);
    }
  }

  const now = new Date();
  const date = now.toISOString().split('T')[0].replace(/-/g, '');
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '').slice(0, 6);

  return {
    id: \`plan-\${date}-\${time}\`,
    created: now,
    status: 'pending',
    query,
    summary: summaryMatch?.[1]?.trim() || 'Plan for: ' + query.slice(0, 50),
    analysis: analysisMatch?.[1]?.trim() || '',
    steps,
    rollbackStrategy
  };
}

function displayPlan(plan: Plan) {
  console.log(chalk.cyan.bold('\\n📋 Plan Created'));
  console.log(chalk.white('\\nSummary: ') + plan.summary);

  if (plan.analysis) {
    console.log(chalk.white('\\nAnalysis:'));
    console.log(chalk.gray(plan.analysis));
  }

  console.log(chalk.white('\\nSteps:'));
  plan.steps.forEach((step, i) => {
    const riskColor = step.risk === 'high' ? chalk.red : step.risk === 'medium' ? chalk.yellow : chalk.green;
    console.log(chalk.white(\`  \${i + 1}. \${step.name}\`));
    console.log(chalk.gray(\`     Action: \${step.action}\`) + (step.target ? chalk.gray(\` → \${step.target}\`) : ''));
    console.log(chalk.gray(\`     Purpose: \${step.purpose}\`));
    console.log(\`     Risk: \` + riskColor(step.risk));
  });

  if (plan.rollbackStrategy.length > 0) {
    console.log(chalk.white('\\nRollback Strategy:'));
    plan.rollbackStrategy.forEach(s => console.log(chalk.gray(\`  - \${s}\`)));
  }
}

async function executePlan(plan: Plan, agent: any, pm: PermissionManager, planManager: PlanManager) {
  console.log(chalk.cyan('\\n⚡ Executing plan: ' + plan.summary));

  await planManager.updateStatus(plan.id, 'executing');

  for (const step of plan.steps) {
    console.log(chalk.white(\`\\n→ Step \${step.id.replace('step-', '')}: \${step.name}\`));

    const spinner = ora(\`Executing: \${step.action}\`).start();

    try {
      // Execute based on action type
      const stepPrompt = \`Execute this step of the plan:
Step: \${step.name}
Action: \${step.action}
Target: \${step.target || 'N/A'}
Purpose: \${step.purpose}

Please execute this step now.\`;

      const response = agent.query(stepPrompt);
      spinner.stop();

      for await (const message of response) {
        if (message.type === 'stream_event') {
          const event = (message as any).event;
          if (event?.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            process.stdout.write(event.delta.text || '');
          }
        }
      }

      await planManager.updateStepStatus(plan.id, step.id, 'completed');
      console.log(chalk.green(\`\\n✓ Step \${step.id.replace('step-', '')} completed\`));
    } catch (error) {
      spinner.fail(\`Step \${step.id.replace('step-', '')} failed\`);
      await planManager.updateStepStatus(plan.id, step.id, 'failed');
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));

      const { cont } = await inquirer.prompt([{
        type: 'confirm',
        name: 'cont',
        message: 'Continue with remaining steps?',
        default: false
      }]);

      if (!cont) {
        await planManager.updateStatus(plan.id, 'failed');
        return;
      }
    }
  }

  await planManager.updateStatus(plan.id, 'completed');
  console.log(chalk.green('\\n✅ Plan completed successfully!'));
  console.log(chalk.gray('Plan archived. Run /plan-delete all-completed to clean up.'));
}

async function listPlans(planManager: PlanManager) {
  const plans = await planManager.listPlans();

  const pending = plans.filter(p => p.plan.status === 'pending');
  const completed = plans.filter(p => p.plan.status === 'completed');

  if (pending.length === 0 && completed.length === 0) {
    console.log(chalk.gray('\\nNo plans found. Use /plan <query> to create one.'));
    return;
  }

  if (pending.length > 0) {
    console.log(chalk.cyan('\\n📋 Pending Plans:'));
    pending.forEach((p, i) => {
      const age = formatAge(p.plan.created);
      console.log(chalk.white(\`  \${i + 1}. \${p.plan.summary}\`));
      console.log(chalk.gray(\`     Created \${age} • \${p.plan.steps.length} steps\`));
    });
    console.log(chalk.gray('\\n  Type a number to execute, or /execute <num>'));
  }

  if (completed.length > 0) {
    console.log(chalk.gray(\`\\n✅ \${completed.length} completed plan(s) - run /plan-delete all-completed to clean up\`));
  }
}

async function executePlanByRef(ref: string, agent: any, pm: PermissionManager, planManager: PlanManager) {
  if (/^\\d+$/.test(ref)) {
    await executePlanByNumber(parseInt(ref), agent, pm, planManager);
    return;
  }

  // Assume it's a path
  try {
    const plan = await planManager.loadPlan(ref);
    await executePlan(plan, agent, pm, planManager);
  } catch (error) {
    console.log(chalk.red(\`Error loading plan: \${ref}\`));
  }
}

async function executePlanByNumber(num: number, agent: any, pm: PermissionManager, planManager: PlanManager) {
  const plans = await planManager.listPlans();
  const pending = plans.filter(p => p.plan.status === 'pending');

  if (num < 1 || num > pending.length) {
    console.log(chalk.red(\`Invalid plan number. You have \${pending.length} pending plan(s).\`));
    return;
  }

  const planEntry = pending[num - 1];
  await executePlan(planEntry.plan, agent, pm, planManager);
}

async function deletePlanByRef(ref: string, planManager: PlanManager) {
  if (ref === 'all-completed') {
    const deleted = await planManager.deleteCompleted();
    console.log(chalk.green(\`\\n✅ Deleted \${deleted} completed plan(s).\`));
    return;
  }

  if (ref === 'all') {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'Delete ALL plans (pending and completed)?',
      default: false
    }]);
    if (confirm) {
      const deleted = await planManager.deleteAll();
      console.log(chalk.green(\`\\n✅ Deleted \${deleted} plan(s).\`));
    }
    return;
  }

  // Delete by number
  if (/^\\d+$/.test(ref)) {
    const plans = await planManager.listPlans();
    const pending = plans.filter(p => p.plan.status === 'pending');
    const num = parseInt(ref);
    if (num >= 1 && num <= pending.length) {
      await planManager.deletePlan(pending[num - 1].plan.id);
      console.log(chalk.green('\\n✅ Plan deleted.'));
      return;
    }
  }

  // Try as plan ID
  await planManager.deletePlan(ref);
  console.log(chalk.green('\\n✅ Plan deleted.'));
}

process.on('SIGINT', () => {
  console.log(chalk.yellow('\\n\\n👋 Goodbye!'));
  process.exit(0);
});

// Read stdin history before parsing commander args (synchronous)
initStdinHistory();
program.parse();`
}

function generateAgent(config: AgentConfig, enabledTools: AgentConfig['tools'], template: any): string {
  const className = sanitizeClassName(config.name)
  const hasFileOps = enabledTools.some(t => t.category === 'file')
  const hasCommands = enabledTools.some(t => t.category === 'command')
  const hasWeb = enabledTools.some(t => t.category === 'web')
  const hasKnowledge = enabledTools.some(t => KNOWLEDGE_TOOL_IDS.includes(t.id))
  
  let imports: string[] = []
  
  // Add SDK-specific imports
  switch (config.sdkProvider) {
    case 'claude':
      imports.push(`import { query, tool, createSdkMcpServer, type Query } from '@anthropic-ai/claude-agent-sdk';`)
      imports.push(`import { z } from 'zod';`)
      break
    case 'openai':
      imports.push(`import { Agent, run, tool } from '@openai/agents';`)
      break
  }
  
  if (hasFileOps) {
    imports.push(`import { FileOperations } from './tools/file-operations.js';`)
  }
  if (hasCommands) {
    imports.push(`import { CommandRunner } from './tools/command-runner.js';`)
  }
  // WebTools only needed for non-Claude providers (Claude uses SDK built-in WebSearch/WebFetch)
  if (hasWeb && config.sdkProvider !== 'claude') {
    imports.push(`import { WebTools } from './tools/web-tools.js';`)
  }
  if (hasKnowledge) {
    imports.push(`import { KnowledgeTools } from './tools/knowledge-tools.js';`)
  }

  // Generate the agent class based on SDK provider
  switch (config.sdkProvider) {
    case 'claude':
      return generateClaudeAgent(imports, className, config, enabledTools, template, hasFileOps, hasCommands, hasWeb, hasKnowledge)
    case 'openai':
      return generateOpenAIAgent(imports, className, config, enabledTools, template, hasFileOps, hasCommands, hasWeb, hasKnowledge)
    case 'huggingface':
      return generateHuggingFaceAgent(imports, className, config, enabledTools, template, hasFileOps, hasCommands, hasWeb, hasKnowledge)
    default:
      throw new Error(`Unsupported SDK provider: ${config.sdkProvider}`)
  }
}

function generateClaudeAgent(imports: string[], className: string, config: AgentConfig, enabledTools: AgentConfig['tools'], template: any, hasFileOps: boolean, hasCommands: boolean, hasWeb: boolean, hasKnowledge: boolean): string {
  return `${imports.join('\n')}
import { PermissionManager, type PermissionPolicy } from './permissions.js';
import { MCPConfigManager } from './mcp-config.js';
import { loadClaudeConfig, formatSkillsForPrompt, type ClaudeConfig } from './claude-config.js';

export interface ${className}AgentConfig {
  verbose?: boolean;
  apiKey?: string;
  permissionManager?: PermissionManager;
  permissions?: PermissionPolicy;
  auditPath?: string;
  workingDir?: string;
}

export class ${className}Agent {
  private config: ${className}AgentConfig;
  private permissionManager: PermissionManager;${hasFileOps ? `
  private fileOps: FileOperations;` : ''}${hasCommands ? `
  private commandRunner: CommandRunner;` : ''}${hasKnowledge ? `
  private knowledgeTools: KnowledgeTools;` : ''}
  private customServer: ReturnType<typeof createSdkMcpServer>;
  private mcpConfigManager: MCPConfigManager;
  private claudeConfig: ClaudeConfig;
  private sessionId?: string;

  constructor(config: ${className}AgentConfig = {}) {
    this.config = config;

    if (config.apiKey) {
      process.env.ANTHROPIC_API_KEY = config.apiKey;
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key is required. Set it via config.apiKey or ANTHROPIC_API_KEY environment variable.');
    }

    this.permissionManager = config.permissionManager || new PermissionManager({ policy: config.permissions, auditPath: config.auditPath });${hasFileOps ? `
    this.fileOps = new FileOperations(this.permissionManager);` : ''}${hasCommands ? `
    this.commandRunner = new CommandRunner(this.permissionManager);` : ''}${hasKnowledge ? `
    this.knowledgeTools = new KnowledgeTools(this.permissionManager);` : ''}

    // Create SDK MCP server with custom tools
    this.customServer = this.createToolServer();

    // Initialize MCP config manager
    this.mcpConfigManager = new MCPConfigManager();

    // Load Claude Code configuration (CLAUDE.md, skills, commands)
    this.claudeConfig = loadClaudeConfig(config.workingDir || process.cwd());
  }

  /**
   * Get loaded Claude Code configuration
   */
  getClaudeConfig(): ClaudeConfig {
    return this.claudeConfig;
  }

  private async loadExternalMcpServers(): Promise<Record<string, any>> {
    await this.mcpConfigManager.load();
    const servers: Record<string, any> = {};

    for (const [name, config] of Object.entries(this.mcpConfigManager.getEnabledServers())) {
      const resolved = this.mcpConfigManager.resolveEnvVariables(config);

      switch (resolved.type) {
        case 'stdio':
          servers[name] = {
            command: resolved.command,
            args: resolved.args || [],
            env: resolved.env || {}
          };
          break;
        case 'sse':
          servers[name] = {
            url: resolved.url,
            transport: 'sse',
            headers: resolved.headers || {}
          };
          break;
        case 'http':
          servers[name] = {
            url: resolved.url,
            transport: 'http',
            headers: resolved.headers || {}
          };
          break;
        case 'sdk':
          try {
            const mod = await import(resolved.serverModule);
            servers[name] = mod.default || mod;
          } catch (err) {
            console.warn(\`Warning: Could not load SDK MCP server '\${name}': \${err}\`);
          }
          break;
      }
    }

    return servers;
  }

  async *query(userQuery: string, history: Array<{role: string, content: string}> = []) {
    const systemPrompt = this.buildSystemPrompt();

    // Load external MCP servers from .mcp.json
    const externalMcpServers = await this.loadExternalMcpServers();

    const options: any = {
      model: '${config.model || 'claude-sonnet-4-5-20250929'}',
      cwd: process.cwd(),
      systemPrompt,
      mcpServers: {
        'custom-tools': this.customServer,
        ...externalMcpServers
      },${hasWeb ? `
      // Enable built-in web search and fetch tools from Claude Agent SDK
      allowedTools: ['WebSearch', 'WebFetch'],` : ''}
      permissionMode: 'default',
      includePartialMessages: true,
      canUseTool: async (toolName: string, input: any) => {
        // Permission check happens in tool execution
        return { behavior: 'allow', updatedInput: input };
      }
    };

    // Resume previous session if we have one
    if (this.sessionId) {
      options.resume = this.sessionId;
    }

    // If history provided and no active session, prepend conversation context to prompt
    let effectivePrompt = userQuery;
    if (history.length > 0 && !this.sessionId) {
      const contextLines = history.map(h =>
        \`\${h.role === 'user' ? 'User' : 'Assistant'}: \${h.content}\`
      ).join('\\n\\n');
      effectivePrompt = \`Previous conversation:\\n\${contextLines}\\n\\nUser: \${userQuery}\`;
    }

    const queryResult = query({
      prompt: effectivePrompt,
      options
    });

    // Stream messages and capture session ID
    for await (const message of queryResult) {
      // Capture session ID from system init message for future queries
      if (message.type === 'system' && (message as any).subtype === 'init') {
        this.sessionId = (message as any).session_id;
      }

      yield message;
    }
  }

  private createToolServer() {
    const tools: any[] = [];${hasFileOps ? `

    // File operation tools
    tools.push(
      tool(
        'read_file',
        'Read the contents of a file',
        {
          filePath: z.string().describe('Path to the file to read')
        },
        async (args) => {
          const content = await this.fileOps.readFile(args.filePath);
          return {
            content: [{
              type: 'text',
              text: content
            }]
          };
        }
      )
    );

    tools.push(
      tool(
        'write_file',
        'Write content to a file (creates or overwrites)',
        {
          filePath: z.string().describe('Path to the file to write'),
          content: z.string().describe('Content to write to the file')
        },
        async (args) => {
          await this.fileOps.writeFile(args.filePath, args.content);
          return {
            content: [{
              type: 'text',
              text: \`Successfully wrote to \${args.filePath}\`
            }]
          };
        }
      )
    );

    tools.push(
      tool(
        'find_files',
        'Find files matching a glob pattern',
        {
          pattern: z.string().describe('Glob pattern to match files (e.g., "**/*.ts")')
        },
        async (args) => {
          const files = await this.fileOps.findFiles(args.pattern);
          return {
            content: [{
              type: 'text',
              text: files.join('\\n')
            }]
          };
        }
      )
    );` : ''}${hasCommands ? `

    // Command execution tools
    tools.push(
      tool(
        'run_command',
        'Execute a shell command',
        {
          command: z.string().describe('Command to execute')
        },
        async (args) => {
          const result = await this.commandRunner.execute(args.command);
          return {
            content: [{
              type: 'text',
              text: this.commandRunner.formatResult(result)
            }]
          };
        }
      )
    );` : ''}${hasKnowledge ? `

    const knowledgeToolsEnabled = new Set(${JSON.stringify(enabledTools.filter(t => KNOWLEDGE_TOOL_IDS.includes(t.id)).map(t => t.id))});

    if (knowledgeToolsEnabled.has('doc-ingest')) {
      tools.push(
        tool(
          'doc_ingest',
          'Extract text from documents (pdf, docx, txt)',
          {
            filePath: z.string().describe('Path to the document'),
            captureSources: z.boolean().default(true).describe('Whether to capture source metadata')
          },
          async (args) => {
            const result = await this.knowledgeTools.extractText(args.filePath, args.captureSources);
            return { content: [{ type: 'text', text: result.text }] };
          }
        )
      );
    }

    if (knowledgeToolsEnabled.has('table-extract')) {
      tools.push(
        tool(
          'table_extract',
          'Extract tables from documents into CSV/JSON',
          {
            filePath: z.string().describe('Path to the document'),
          },
          async (args) => {
            const result = await this.knowledgeTools.extractTables(args.filePath);
            const summary = result.tables.length === 0
              ? 'No tables found in document.'
              : result.tables.map((t, i) =>
                  \`Table \${i + 1} (\${t.format}):\\n\${t.rows.slice(0, 5).map(r => r.join(' | ')).join('\\n')}\${t.rows.length > 5 ? \`\\n... and \${t.rows.length - 5} more rows\` : ''}\`
                ).join('\\n\\n');
            return { content: [{ type: 'text', text: \`Source: \${result.source}\\n\\n\${summary}\` }] };
          }
        )
      );
    }

    if (knowledgeToolsEnabled.has('source-notes')) {
      tools.push(
        tool(
          'source_notes',
          'Append a note with source + citation to the local notebook',
          {
            title: z.string().describe('Title for the note'),
            source: z.string().describe('Source URL or path'),
            content: z.string().describe('Summary or quote')
          },
          async (args) => {
            const saved = await this.knowledgeTools.saveNote(args.title, args.source, args.content);
            return { content: [{ type: 'text', text: saved }] };
          }
        )
      );
    }

    if (knowledgeToolsEnabled.has('local-rag')) {
      tools.push(
        tool(
          'local_retrieval',
          'Search local notes/corpus for grounded snippets',
          {
            query: z.string().describe('Search query'),
            limit: z.number().optional().describe('Max results')
          },
          async (args) => {
            const result = await this.knowledgeTools.searchLocal(args.query, args.limit || 5);
            return { content: [{ type: 'text', text: result }] };
          }
        )
      );
    }` : ''}

    return createSdkMcpServer({
      name: 'custom-tools',
      version: '1.0.0',
      tools
    });
  }

  private buildSystemPrompt(): string {
    // Build memory section from CLAUDE.md if available
    const memorySection = this.claudeConfig.memory
      ? \`## Project Context (from CLAUDE.md):\n\${this.claudeConfig.memory}\n\n\`
      : '';

    // Build skills section if any skills are loaded
    const skillsSection = this.claudeConfig.skills.length > 0
      ? \`## Available Skills:\n\${formatSkillsForPrompt(this.claudeConfig.skills)}\n\nWhen the user asks you to use a skill (e.g., "run the api-design skill" or "use code-review"), apply the skill's instructions to the current context. Skills provide specialized expertise and workflows.\n\n\`
      : '';

    // Build subagents section if any are loaded
    const subagentsSection = this.claudeConfig.subagents.length > 0
      ? '## Available Subagents:\\n' + this.claudeConfig.subagents.map(a => '- **' + a.name + '**: ' + a.description).join('\\n') + '\\n\\nYou can delegate specialized tasks to these subagents when appropriate.\\n\\n'
      : '';

    // Build commands info if any are loaded
    const commandsSection = this.claudeConfig.commands.length > 0
      ? '## Slash Commands:\\nThe user can invoke these commands with /command-name:\\n' + this.claudeConfig.commands.map(c => '- **/' + c.name + '**: ' + (c.description || 'No description')).join('\\n') + '\\n\\n'
      : '';

    return \`You are ${config.name}, a specialized AI assistant for ${config.domain}.

\${memorySection}${config.customInstructions || template?.documentation || ''}

## Your Capabilities:
${enabledTools.map(tool => `- **${tool.name}**: ${tool.description}`).join('\n')}

\${skillsSection}\${subagentsSection}\${commandsSection}## Instructions:
${config.customInstructions || '- Provide helpful, accurate, and actionable assistance\n- Use your available tools when appropriate\n- Be thorough and explain your reasoning'}${hasKnowledge ? '\n- Track and cite sources when summarizing. Keep responses grounded in retrieved text.' : ''}

Always be helpful, accurate, and focused on ${config.domain} tasks.\`;
  }${hasFileOps ? `

  // File operation helpers
  async readFile(filePath: string): Promise<string> {
    return this.fileOps.readFile(filePath);
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    return this.fileOps.writeFile(filePath, content);
  }

  async findFiles(pattern: string): Promise<string[]> {
    return this.fileOps.findFiles(pattern);
  }` : ''}${hasCommands ? `

  // Command execution helpers
  async runCommand(command: string): Promise<void> {
    const result = await this.commandRunner.execute(command);
    console.log(this.commandRunner.formatResult(result));
  }` : ''}${hasKnowledge ? `

  // Knowledge helpers
  async extractDocument(filePath: string): Promise<string> {
    const result = await this.knowledgeTools.extractText(filePath, true);
    return result.text;
  }

  async retrieveLocal(query: string, limit = 5): Promise<string> {
    return this.knowledgeTools.searchLocal(query, limit);
  }` : ''}
}`
}

function generateOpenAIAgent(imports: string[], className: string, config: AgentConfig, enabledTools: AgentConfig['tools'], template: any, hasFileOps: boolean, hasCommands: boolean, hasWeb: boolean, hasKnowledge: boolean): string {
  return `${imports.join('\n')}
import { z } from 'zod';
import { PermissionManager, type PermissionPolicy } from './permissions.js';

export interface ${className}AgentConfig {
  verbose?: boolean;
  apiKey?: string;
  model?: string;
  permissionManager?: PermissionManager;
  permissions?: PermissionPolicy;
  auditPath?: string;
}

export class ${className}Agent {
  private config: ${className}AgentConfig;
  private agent: Agent;
  private permissionManager: PermissionManager;${hasFileOps ? `
  private fileOps: FileOperations;` : ''}${hasCommands ? `
  private commandRunner: CommandRunner;` : ''}${hasWeb ? `
  private webTools: WebTools;` : ''}${hasKnowledge ? `
  private knowledgeTools: KnowledgeTools;` : ''}

  constructor(config: ${className}AgentConfig = {}) {
    this.config = config;
    this.permissionManager = config.permissionManager || new PermissionManager({ policy: config.permissions, auditPath: config.auditPath });

    if (!config.apiKey && !process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required. Set it via config.apiKey or OPENAI_API_KEY environment variable.');
    }

    // Set API key in environment for OpenAI SDK
    if (config.apiKey) {
      process.env.OPENAI_API_KEY = config.apiKey;
    }${hasFileOps ? `
    this.fileOps = new FileOperations(this.permissionManager);` : ''}${hasCommands ? `
    this.commandRunner = new CommandRunner(this.permissionManager);` : ''}${hasWeb ? `
    this.webTools = new WebTools(this.permissionManager);` : ''}${hasKnowledge ? `
    this.knowledgeTools = new KnowledgeTools(this.permissionManager);` : ''}

    // Create OpenAI agent with tools
    this.agent = new Agent({
      name: '${config.name}',
      instructions: this.buildInstructions(),
      tools: this.createTools()
    });
  }

  async *query(userQuery: string, history: Array<{role: string, content: string}> = []) {
    try {
      // Build input: if history provided, pass as array; otherwise just the string
      const input = history.length > 0
        ? [...history, { role: 'user', content: userQuery }]
        : userQuery;

      // Run the OpenAI agent with the input (string or messages array)
      const result = await run(this.agent, input as any);
      const output = result.finalOutput || 'No response generated.';

      // Yield the response as a stream event so CLI displays it
      yield {
        type: 'stream_event',
        event: {
          type: 'content_block_delta',
          delta: {
            type: 'text_delta',
            text: output
          }
        }
      };

      // Also yield as result for programmatic access
      yield {
        type: 'result',
        subtype: 'success',
        result: output
      };
    } catch (error) {
      console.error('OpenAI Agents API error:', error);
      throw new Error(\`Failed to generate response: \${error instanceof Error ? error.message : String(error)}\`);
    }
  }

  private createTools(): any[] {
    const tools: any[] = [];
    
    ${hasFileOps ? `
    // File operations tools
    const readFileTool = tool({
      name: 'read_file',
      description: 'Read contents of a file',
      parameters: z.object({
        filePath: z.string().describe('Path to the file to read')
      }),
      execute: async ({ filePath }: { filePath: string }) => {
        return await this.fileOps.readFile(filePath);
      }
    });
    tools.push(readFileTool);
    
    const writeFileTool = tool({
      name: 'write_file', 
      description: 'Write content to a file',
      parameters: z.object({
        filePath: z.string().describe('Path to the file to write'),
        content: z.string().describe('Content to write to the file')
      }),
      execute: async ({ filePath, content }: { filePath: string; content: string }) => {
        await this.fileOps.writeFile(filePath, content);
        return \`File written successfully: \${filePath}\`;
      }
    });
    tools.push(writeFileTool);

    const findFilesTool = tool({
      name: 'find_files',
      description: 'Find files matching a pattern',
      parameters: z.object({
        pattern: z.string().describe('Glob pattern to match files')
      }),
      execute: async ({ pattern }: { pattern: string }) => {
        const files = await this.fileOps.findFiles(pattern);
        return files.join(', ');
      }
    });
    tools.push(findFilesTool);` : ''}
    
    ${hasCommands ? `
    // Command execution tool
    const runCommandTool = tool({
      name: 'run_command',
      description: 'Execute a system command',
      parameters: z.object({
        command: z.string().describe('Command to execute')
      }),
      execute: async ({ command }: { command: string }) => {
        const result = await this.commandRunner.execute(command);
        return this.commandRunner.formatResult(result);
      }
    });
    tools.push(runCommandTool);` : ''}
    
    ${hasWeb ? `
    // Web tools
    const fetchUrlTool = tool({
      name: 'fetch_url',
      description: 'Fetch content from a URL',
      parameters: z.object({
        url: z.string().describe('URL to fetch')
      }),
      execute: async ({ url }: { url: string }) => {
        return await this.webTools.fetch(url);
      }
    });
    tools.push(fetchUrlTool);

    const fetchTextTool = tool({
      name: 'fetch_text',
      description: 'Fetch and extract text content from a URL',
      parameters: z.object({
        url: z.string().describe('URL to fetch and extract text from')
      }),
      execute: async ({ url }: { url: string }) => {
        return await this.webTools.fetchText(url);
      }
    });
    tools.push(fetchTextTool);` : ''}
    
    ${hasKnowledge ? `
    const knowledgeToolsEnabled = new Set(${JSON.stringify(enabledTools.filter(t => KNOWLEDGE_TOOL_IDS.includes(t.id)).map(t => t.id))});

    if (knowledgeToolsEnabled.has('doc-ingest')) {
      tools.push(
        tool({
          name: 'doc_ingest',
          description: 'Extract text from documents (pdf, docx, txt)',
          parameters: z.object({
            filePath: z.string(),
            captureSources: z.boolean().default(true)
          }),
          execute: async ({ filePath, captureSources }: { filePath: string; captureSources: boolean }) => {
            const result = await this.knowledgeTools.extractText(filePath, captureSources);
            return result.text;
          }
        })
      );
    }

    if (knowledgeToolsEnabled.has('table-extract')) {
      tools.push(
        tool({
          name: 'table_extract',
          description: 'Extract tables from documents into CSV/JSON',
          parameters: z.object({
            filePath: z.string()
          }),
          execute: async ({ filePath }: { filePath: string }) => {
            const result = await this.knowledgeTools.extractTables(filePath);
            if (result.tables.length === 0) return 'No tables found in document.';
            return result.tables.map((t, i) =>
              \`Table \${i + 1} (\${t.format}):\\n\${t.rows.slice(0, 5).map(r => r.join(' | ')).join('\\n')}\${t.rows.length > 5 ? \`\\n... and \${t.rows.length - 5} more rows\` : ''}\`
            ).join('\\n\\n');
          }
        })
      );
    }

    if (knowledgeToolsEnabled.has('source-notes')) {
      tools.push(
        tool({
          name: 'source_notes',
          description: 'Append a note with source + citation to the local notebook',
          parameters: z.object({
            title: z.string(),
            source: z.string(),
            content: z.string()
          }),
          execute: async ({ title, source, content }: { title: string; source: string; content: string }) => {
            return await this.knowledgeTools.saveNote(title, source, content);
          }
        })
      );
    }

    if (knowledgeToolsEnabled.has('local-rag')) {
      tools.push(
        tool({
          name: 'local_retrieval',
          description: 'Search local notes/corpus for grounded snippets',
          parameters: z.object({
            query: z.string(),
            limit: z.number().default(5)
          }),
          execute: async ({ query, limit }: { query: string; limit: number }) => {
            return await this.knowledgeTools.searchLocal(query, limit);
          }
        })
      );
    }` : ''}
    
    return tools;
  }

  private buildInstructions(): string {
    return \`You are ${config.name}, a specialized AI assistant for ${config.domain}.

${config.customInstructions || template?.documentation || ''}

## Your Capabilities:
${enabledTools.map(tool => `- **${tool.name}**: ${tool.description}`).join('\n')}

## Instructions:
${config.customInstructions || '- Provide helpful, accurate, and actionable assistance\n- Use your available tools when appropriate\n- Be thorough and explain your reasoning'}${hasKnowledge ? '\n- Track and cite sources when summarizing. Keep responses grounded in retrieved text.' : ''}

Always be helpful, accurate, and focused on ${config.domain} tasks. Use the provided tools when needed to accomplish tasks effectively.\`;
  }${hasFileOps ? `

  // File operation helpers
  async readFile(filePath: string): Promise<string> {
    return this.fileOps.readFile(filePath);
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    return this.fileOps.writeFile(filePath, content);
  }

  async findFiles(pattern: string): Promise<string[]> {
    return this.fileOps.findFiles(pattern);
  }` : ''}${hasCommands ? `

  // Command execution helpers
  async runCommand(command: string): Promise<void> {
    const result = await this.commandRunner.execute(command);
    console.log(this.commandRunner.formatResult(result));
  }` : ''}${hasWeb ? `

  // Web tools helpers  
  async searchWeb(query: string): Promise<string[]> {
    return this.webTools.search(query);
  }

  async fetchUrl(url: string): Promise<string> {
    return this.webTools.fetch(url);
  }` : ''}${hasKnowledge ? `

  // Knowledge helpers
  async extractDocument(filePath: string): Promise<string> {
    const result = await this.knowledgeTools.extractText(filePath, true);
    return result.text;
  }

  async retrieveLocal(query: string, limit = 5): Promise<string> {
    return this.knowledgeTools.searchLocal(query, limit);
  }` : ''}
}`
}

function generateHuggingFaceAgent(imports: string[], className: string, config: AgentConfig, enabledTools: AgentConfig['tools'], template: any, hasFileOps: boolean, hasCommands: boolean, hasWeb: boolean, hasKnowledge: boolean): string {
  // HuggingFace tiny-agents uses a different import structure
  const hfImports = [
    `import { Agent } from '@huggingface/tiny-agents';`,
    `import { MCPClient } from '@huggingface/mcp-client';`
  ]

  if (hasFileOps) {
    hfImports.push(`import { FileOperations } from './tools/file-operations.js';`)
  }
  if (hasCommands) {
    hfImports.push(`import { CommandRunner } from './tools/command-runner.js';`)
  }
  if (hasWeb) {
    hfImports.push(`import { WebTools } from './tools/web-tools.js';`)
  }
  if (hasKnowledge) {
    hfImports.push(`import { KnowledgeTools } from './tools/knowledge-tools.js';`)
  }

  return `${hfImports.join('\n')}
import { PermissionManager, type PermissionPolicy } from './permissions.js';
import { MCPConfigManager } from './mcp-config.js';
import { loadClaudeConfig, formatSkillsForPrompt, type ClaudeConfig } from './claude-config.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

export interface ${className}AgentConfig {
  verbose?: boolean;
  apiKey?: string;
  provider?: string;
  endpointUrl?: string;
  permissionManager?: PermissionManager;
  permissions?: PermissionPolicy;
  auditPath?: string;
  workingDir?: string;
}

export class ${className}Agent {
  private config: ${className}AgentConfig;
  private agent: Agent | null = null;
  private permissionManager: PermissionManager;${hasFileOps ? `
  private fileOps: FileOperations;` : ''}${hasCommands ? `
  private commandRunner: CommandRunner;` : ''}${hasWeb ? `
  private webTools: WebTools;` : ''}${hasKnowledge ? `
  private knowledgeTools: KnowledgeTools;` : ''}
  private mcpConfigManager: MCPConfigManager;
  private claudeConfig: ClaudeConfig;
  private mcpServers: Array<{ type: string; command?: string; args?: string[]; url?: string }> = [];

  constructor(config: ${className}AgentConfig = {}) {
    this.config = config;
    this.permissionManager = config.permissionManager || new PermissionManager({ policy: config.permissions, auditPath: config.auditPath });${hasFileOps ? `
    this.fileOps = new FileOperations(this.permissionManager);` : ''}${hasCommands ? `
    this.commandRunner = new CommandRunner(this.permissionManager);` : ''}${hasWeb ? `
    this.webTools = new WebTools(this.permissionManager);` : ''}${hasKnowledge ? `
    this.knowledgeTools = new KnowledgeTools(this.permissionManager);` : ''}

    // Initialize MCP config manager
    this.mcpConfigManager = new MCPConfigManager();

    // Load Claude Code configuration (CLAUDE.md, skills, commands)
    this.claudeConfig = loadClaudeConfig(config.workingDir || process.cwd());

    // Build MCP servers from configuration
    this.buildMcpServers();
  }

  private buildMcpServers(): void {
    // Load any configured MCP servers from .mcp.json
    try {
      const mcpJsonPath = path.join(this.config.workingDir || process.cwd(), '.mcp.json');
      if (fs.existsSync(mcpJsonPath)) {
        const mcpConfig = JSON.parse(fs.readFileSync(mcpJsonPath, 'utf-8'));
        for (const [name, serverConfig] of Object.entries(mcpConfig.servers || {})) {
          const server = serverConfig as any;
          if (server.type === 'stdio') {
            this.mcpServers.push({
              type: 'stdio',
              command: server.command,
              args: server.args || []
            });
          } else if (server.type === 'sse' || server.type === 'http') {
            this.mcpServers.push({
              type: server.type,
              url: server.url
            });
          }
        }
      }
    } catch (err) {
      // Errors reading/parsing optional MCP config are non-fatal; proceed without MCP servers.
      // Log details only in verbose/debug modes to aid diagnosing configuration issues.
      if (process.env.DEBUG || process.env.VERBOSE) {
        console.error('Failed to load MCP configuration from .mcp.json:', err);
      }
    }
  }

  /**
   * Get loaded agent configuration.
   */
  getAgentConfig(): ClaudeConfig {
    return this.claudeConfig;
  }

  /**
   * @deprecated Use getAgentConfig() instead.
   * Get loaded agent configuration.
   */
  getClaudeConfig(): ClaudeConfig {
    return this.getAgentConfig();
  }
  private async initializeAgent(): Promise<void> {
    if (this.agent) return;

    // Get API key
    const apiKey = this.config.apiKey || process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN;
    if (!apiKey) {
      throw new Error('HuggingFace API token is required. Set it via config.apiKey, HF_TOKEN, or HUGGINGFACE_TOKEN environment variable.');
    }

    // Build agent configuration matching tiny-agents agent.json format
    const agentConfig: any = {
      model: '${config.model || 'Qwen/Qwen2.5-72B-Instruct'}',
      provider: this.config.provider || 'nebius',
      apiKey,
      servers: this.mcpServers
    };

    // If custom endpoint URL is provided, use it instead of provider
    if (this.config.endpointUrl) {
      delete agentConfig.provider;
      agentConfig.endpointUrl = this.config.endpointUrl;
    }

    this.agent = new Agent(agentConfig);
    await this.agent.loadTools();
  }

  async *query(userQuery: string, history: Array<{role: string, content: string}> = []) {
    await this.initializeAgent();

    const systemPrompt = this.buildSystemPrompt();

    // Build the full prompt with history context
    let fullPrompt = userQuery;
    if (history.length > 0) {
      const contextLines = history.map(h =>
        \`\${h.role === 'user' ? 'User' : 'Assistant'}: \${h.content}\`
      ).join('\\n\\n');
      fullPrompt = \`\${systemPrompt}\\n\\nPrevious conversation:\\n\${contextLines}\\n\\nUser: \${userQuery}\`;
    } else {
      fullPrompt = \`\${systemPrompt}\\n\\nUser: \${userQuery}\`;
    }

    try {
      let fullResponse = '';

      // Use the tiny-agents run method which returns an async iterator
      for await (const chunk of this.agent!.run(fullPrompt)) {
        // Handle different chunk types from tiny-agents
        if ('choices' in chunk) {
          const choice = chunk.choices[0];
          if (choice?.delta?.content) {
            fullResponse += choice.delta.content;
            yield {
              type: 'stream_event',
              event: {
                type: 'content_block_delta',
                delta: {
                  type: 'text_delta',
                  text: choice.delta.content
                }
              }
            };
          }
          // Handle tool calls from the response
          if (choice?.delta?.tool_calls) {
            for (const toolCall of choice.delta.tool_calls) {
              yield {
                type: 'stream_event',
                event: {
                  type: 'content_block_start',
                  content_block: {
                    type: 'tool_use',
                    name: toolCall.function?.name || 'unknown'
                  }
                }
              };
            }
          }
        }
      }

      // Yield final result
      yield {
        type: 'result',
        subtype: 'success',
        result: fullResponse
      };
    } catch (error) {
      console.error('HuggingFace tiny-agents error:', error);
      throw new Error(\`Failed to generate response: \${error instanceof Error ? error.message : String(error)}\`);
    }
  }

  private buildSystemPrompt(): string {
    // Build memory section from CLAUDE.md if available
    const memorySection = this.claudeConfig.memory
      ? \`## Project Context:\\n\${this.claudeConfig.memory}\\n\\n\`
      : '';

    // Build skills section if any skills are loaded
    const skillsSection = this.claudeConfig.skills.length > 0
      ? \`## Available Skills:\\n\${formatSkillsForPrompt(this.claudeConfig.skills)}\\n\\nWhen the user asks you to use a skill, apply the skill's instructions to the current context.\\n\\n\`
      : '';

    // Build commands info if any are loaded
    const commandsSection = this.claudeConfig.commands.length > 0
      ? '## Slash Commands:\\nThe user can invoke these commands with /command-name:\\n' + this.claudeConfig.commands.map(c => '- **/' + c.name + '**: ' + (c.description || 'No description')).join('\\n') + '\\n\\n'
      : '';

    return \`You are ${config.name}, a specialized AI assistant for ${config.domain}.

\${memorySection}${config.customInstructions || template?.documentation || ''}

## Your Capabilities:
${enabledTools.map(tool => `- **${tool.name}**: ${tool.description}`).join('\n')}

\${skillsSection}\${commandsSection}## Instructions:
${config.customInstructions || '- Provide helpful, accurate, and actionable assistance\n- Use your available tools when appropriate\n- Be thorough and explain your reasoning'}${hasKnowledge ? '\n- Track and cite sources when summarizing. Keep responses grounded in retrieved text.' : ''}

Always be helpful, accurate, and focused on ${config.domain} tasks.\`;
  }${hasFileOps ? `

  // File operation helpers
  async readFile(filePath: string): Promise<string> {
    return this.fileOps.readFile(filePath);
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    return this.fileOps.writeFile(filePath, content);
  }

  async findFiles(pattern: string): Promise<string[]> {
    return this.fileOps.findFiles(pattern);
  }` : ''}${hasCommands ? `

  // Command execution helpers
  async runCommand(command: string): Promise<void> {
    const result = await this.commandRunner.execute(command);
    console.log(this.commandRunner.formatResult(result));
  }` : ''}${hasWeb ? `

  // Web tools helpers
  async searchWeb(query: string): Promise<string[]> {
    return this.webTools.search(query);
  }

  async fetchUrl(url: string): Promise<string> {
    return this.webTools.fetch(url);
  }` : ''}${hasKnowledge ? `

  // Knowledge helpers
  async extractDocument(filePath: string): Promise<string> {
    const result = await this.knowledgeTools.extractText(filePath, true);
    return result.text;
  }

  async retrieveLocal(query: string, limit = 5): Promise<string> {
    return this.knowledgeTools.searchLocal(query, limit);
  }` : ''}
}`
}

function generateConfig(config: AgentConfig): string {
  return `import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';

export interface Config {
  apiKey?: string;
  verbose?: boolean;
}

const CONFIG_DIR = join(homedir(), '.${config.projectName}');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export class ConfigManager {
  private config: Config = {};

  async load(): Promise<Config> {
    try {
      const configData = await readFile(CONFIG_FILE, 'utf-8');
      this.config = JSON.parse(configData);
    } catch (error) {
      this.config = {};
    }

    // Override with environment variables
    if (process.env.${getApiKeyEnvVar(config.sdkProvider)}) {
      this.config.apiKey = process.env.${getApiKeyEnvVar(config.sdkProvider)};
    }

    return this.config;
  }

  async save(config: Partial<Config>): Promise<void> {
    this.config = { ...this.config, ...config };
    
    try {
      await mkdir(CONFIG_DIR, { recursive: true });
      await writeFile(CONFIG_FILE, JSON.stringify(this.config, null, 2));
    } catch (error) {
      throw new Error(\`Failed to save configuration: \${error instanceof Error ? error.message : String(error)}\`);
    }
  }

  get(): Config {
    return { ...this.config };
  }

  getApiKey(): string | undefined {
    return this.config.apiKey;
  }

  hasApiKey(): boolean {
    return !!this.config.apiKey;
  }
}`
}

function generatePlanManager(config: AgentConfig): string {
  return `import { readFile, writeFile, readdir, unlink, mkdir } from 'fs/promises';
import { join, basename } from 'path';
import { existsSync } from 'fs';

export interface PlanStep {
  id: string;
  name: string;
  action: 'read' | 'write' | 'edit' | 'command' | 'query';
  target?: string;
  purpose: string;
  risk: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'failed' | 'skipped';
}

export interface Plan {
  id: string;
  created: Date;
  status: 'pending' | 'approved' | 'executing' | 'completed' | 'failed';
  query: string;
  summary: string;
  analysis: string;
  steps: PlanStep[];
  rollbackStrategy: string[];
}

export class PlanManager {
  private plansDir: string;

  constructor(baseDir: string = process.cwd()) {
    this.plansDir = join(baseDir, '.plans');
  }

  async ensureDir(): Promise<void> {
    if (!existsSync(this.plansDir)) {
      await mkdir(this.plansDir, { recursive: true });
    }
  }

  async createPlan(query: string, summary: string, analysis: string, steps: PlanStep[], rollbackStrategy: string[]): Promise<Plan> {
    const plan: Plan = {
      id: this.generatePlanId(),
      created: new Date(),
      status: 'pending',
      query,
      summary,
      analysis,
      steps,
      rollbackStrategy
    };
    return plan;
  }

  async savePlan(plan: Plan): Promise<string> {
    await this.ensureDir();
    const slug = this.slugify(plan.summary);
    const filename = \`\${plan.id}-\${slug}.plan.md\`;
    const filepath = join(this.plansDir, filename);
    const content = this.serializePlanMarkdown(plan);
    await writeFile(filepath, content, 'utf-8');
    return filepath;
  }

  async loadPlan(planPath: string): Promise<Plan> {
    const content = await readFile(planPath, 'utf-8');
    return this.parsePlanMarkdown(content);
  }

  async listPlans(): Promise<{ path: string; plan: Plan }[]> {
    await this.ensureDir();
    const files = await readdir(this.plansDir);
    const planFiles = files.filter(f => f.endsWith('.plan.md'));

    const plans: { path: string; plan: Plan }[] = [];
    for (const file of planFiles) {
      const filepath = join(this.plansDir, file);
      try {
        const plan = await this.loadPlan(filepath);
        plans.push({ path: filepath, plan });
      } catch (e) {
        // Skip invalid plan files
      }
    }

    // Sort by creation date, newest first
    plans.sort((a, b) => new Date(b.plan.created).getTime() - new Date(a.plan.created).getTime());
    return plans;
  }

  async deletePlan(planId: string): Promise<void> {
    const plans = await this.listPlans();
    const plan = plans.find(p => p.plan.id === planId);
    if (plan) {
      await unlink(plan.path);
    }
  }

  async deleteCompleted(): Promise<number> {
    const plans = await this.listPlans();
    const completed = plans.filter(p => p.plan.status === 'completed');
    for (const p of completed) {
      await unlink(p.path);
    }
    return completed.length;
  }

  async deleteAll(): Promise<number> {
    const plans = await this.listPlans();
    for (const p of plans) {
      await unlink(p.path);
    }
    return plans.length;
  }

  async updateStatus(planId: string, status: Plan['status']): Promise<void> {
    const plans = await this.listPlans();
    const planEntry = plans.find(p => p.plan.id === planId);
    if (planEntry) {
      planEntry.plan.status = status;
      const content = this.serializePlanMarkdown(planEntry.plan);
      await writeFile(planEntry.path, content, 'utf-8');
    }
  }

  async updateStepStatus(planId: string, stepId: string, status: PlanStep['status']): Promise<void> {
    const plans = await this.listPlans();
    const planEntry = plans.find(p => p.plan.id === planId);
    if (planEntry) {
      const step = planEntry.plan.steps.find(s => s.id === stepId);
      if (step) {
        step.status = status;
        const content = this.serializePlanMarkdown(planEntry.plan);
        await writeFile(planEntry.path, content, 'utf-8');
      }
    }
  }

  private generatePlanId(): string {
    const now = new Date();
    const date = now.toISOString().split('T')[0].replace(/-/g, '');
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '').slice(0, 6);
    return \`plan-\${date}-\${time}\`;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\\s-]/g, '')
      .replace(/\\s+/g, '-')
      .slice(0, 30)
      .replace(/-+$/, '');
  }

  private parsePlanMarkdown(content: string): Plan {
    const lines = content.split('\\n');
    const frontmatterEnd = lines.findIndex((l, i) => i > 0 && l === '---');

    // Parse frontmatter
    const frontmatter: Record<string, string> = {};
    for (let i = 1; i < frontmatterEnd; i++) {
      const match = lines[i].match(/^(\\w+):\\s*(.+)$/);
      if (match) {
        frontmatter[match[1]] = match[2].replace(/^"(.+)"$/, '$1');
      }
    }

    // Parse body
    const body = lines.slice(frontmatterEnd + 1).join('\\n');

    // Extract sections
    const summaryMatch = body.match(/## Summary\\n([\\s\\S]*?)(?=##|$)/);
    const analysisMatch = body.match(/## Analysis\\n([\\s\\S]*?)(?=##|$)/);
    const stepsMatch = body.match(/## Steps\\n([\\s\\S]*?)(?=##|$)/);
    const rollbackMatch = body.match(/## Rollback Strategy\\n([\\s\\S]*?)(?=##|$)/);

    // Parse steps
    const steps: PlanStep[] = [];
    if (stepsMatch) {
      const stepRegex = /\\d+\\.\\s+\\*\\*(.+?)\\*\\*\\n([\\s\\S]*?)(?=\\d+\\.|$)/g;
      let match;
      let stepNum = 1;
      while ((match = stepRegex.exec(stepsMatch[1])) !== null) {
        const stepName = match[1];
        const stepBody = match[2];

        const actionMatch = stepBody.match(/Action:\\s*(\\w+)/);
        const targetMatch = stepBody.match(/Target:\\s*(.+)/);
        const purposeMatch = stepBody.match(/Purpose:\\s*(.+)/);
        const riskMatch = stepBody.match(/Risk:\\s*(\\w+)/);
        const statusMatch = stepBody.match(/Status:\\s*(\\w+)/);

        steps.push({
          id: \`step-\${stepNum++}\`,
          name: stepName.trim(),
          action: (actionMatch?.[1] || 'query') as PlanStep['action'],
          target: targetMatch?.[1]?.trim(),
          purpose: purposeMatch?.[1]?.trim() || '',
          risk: (riskMatch?.[1] || 'low') as PlanStep['risk'],
          status: (statusMatch?.[1] || 'pending') as PlanStep['status']
        });
      }
    }

    // Parse rollback
    const rollbackStrategy: string[] = [];
    if (rollbackMatch) {
      const rollbackLines = rollbackMatch[1].trim().split('\\n');
      for (const line of rollbackLines) {
        const clean = line.replace(/^-\\s*/, '').trim();
        if (clean) rollbackStrategy.push(clean);
      }
    }

    return {
      id: frontmatter.id || this.generatePlanId(),
      created: new Date(frontmatter.created || Date.now()),
      status: (frontmatter.status || 'pending') as Plan['status'],
      query: frontmatter.query || '',
      summary: summaryMatch?.[1]?.trim() || '',
      analysis: analysisMatch?.[1]?.trim() || '',
      steps,
      rollbackStrategy
    };
  }

  private serializePlanMarkdown(plan: Plan): string {
    const lines: string[] = [];

    // Frontmatter
    lines.push('---');
    lines.push(\`id: \${plan.id}\`);
    lines.push(\`created: \${plan.created.toISOString()}\`);
    lines.push(\`status: \${plan.status}\`);
    lines.push(\`query: "\${plan.query.replace(/"/g, '\\\\"')}"\`);
    lines.push('---');
    lines.push('');

    // Summary
    lines.push('## Summary');
    lines.push(plan.summary);
    lines.push('');

    // Analysis
    lines.push('## Analysis');
    lines.push(plan.analysis);
    lines.push('');

    // Steps
    lines.push('## Steps');
    plan.steps.forEach((step, i) => {
      lines.push(\`\${i + 1}. **\${step.name}**\`);
      lines.push(\`   - Action: \${step.action}\`);
      if (step.target) lines.push(\`   - Target: \${step.target}\`);
      lines.push(\`   - Purpose: \${step.purpose}\`);
      lines.push(\`   - Risk: \${step.risk}\`);
      lines.push(\`   - Status: \${step.status}\`);
      lines.push('');
    });

    // Rollback Strategy
    lines.push('## Rollback Strategy');
    for (const strategy of plan.rollbackStrategy) {
      lines.push(\`- \${strategy}\`);
    }

    return lines.join('\\n');
  }
}

export function formatAge(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return \`\${diffMins} minute\${diffMins > 1 ? 's' : ''} ago\`;
  if (diffHours < 24) return \`\${diffHours} hour\${diffHours > 1 ? 's' : ''} ago\`;
  return \`\${diffDays} day\${diffDays > 1 ? 's' : ''} ago\`;
}
`
}

function generatePermissions(config: AgentConfig): string {
  return `import inquirer from 'inquirer';
import chalk from 'chalk';
import { appendFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { homedir } from 'os';

export type PermissionAction = 'read_file' | 'write_file' | 'run_command' | 'delete_file' | 'modify_file' | 'network_request';
export type PermissionPolicy = 'restrictive' | 'balanced' | 'permissive';

export interface PermissionRequest {
  action: PermissionAction;
  resource: string;
  details?: string;
}

export interface PermissionResponse {
  allowed: boolean;
  remember?: boolean;
}

export interface PermissionOptions {
  policy?: PermissionPolicy;
  auditPath?: string;
}

export class PermissionManager {
  private allowedActions: Set<string> = new Set();
  private deniedActions: Set<string> = new Set();
  private alwaysAllow: Set<PermissionAction> = new Set();
  private alwaysDeny: Set<PermissionAction> = new Set();
  private policy: PermissionPolicy;
  private auditPath: string;

  constructor(options: PermissionOptions = {}) {
    this.policy = options.policy || '${config.permissions || 'balanced'}';
    this.auditPath = options.auditPath || join(homedir(), '.${config.projectName}', 'audit.log');
  }

  async requestPermission(request: PermissionRequest): Promise<PermissionResponse> {
    const actionKey = \`\${request.action}:\${request.resource}\`;
    const policyDecision = this.applyPolicy(request.action);

    if (policyDecision !== 'ask') {
      const allowed = policyDecision === 'allow';
      const response = { allowed, remember: true };
      await this.audit(request, response, 'policy');
      return response;
    }

    if (this.allowedActions.has(actionKey)) {
      const response = { allowed: true, remember: true };
      await this.audit(request, response, 'cached');
      return response;
    }

    if (this.deniedActions.has(actionKey)) {
      const response = { allowed: false, remember: true };
      await this.audit(request, response, 'cached');
      return response;
    }

    if (this.alwaysAllow.has(request.action)) {
      const response = { allowed: true, remember: true };
      await this.audit(request, response, 'always');
      return response;
    }

    if (this.alwaysDeny.has(request.action)) {
      const response = { allowed: false, remember: true };
      await this.audit(request, response, 'always');
      return response;
    }

    const response = await this.promptUser(request, actionKey);
    await this.audit(request, response, 'prompt');
    return response;
  }

  private async promptUser(request: PermissionRequest, actionKey: string): Promise<PermissionResponse> {
    console.log(chalk.yellow('\\n⚠️  Permission Required'));
    console.log(chalk.white(\`Action: \${this.formatActionName(request.action)}\`));
    console.log(chalk.white(\`Resource: \${request.resource}\`));
    if (request.details) {
      console.log(chalk.gray(\`Details: \${request.details}\`));
    }

    const { decision } = await inquirer.prompt([
      {
        type: 'list',
        name: 'decision',
        message: 'Do you want to allow this action?',
        choices: [
          { name: 'Allow once', value: 'allow_once' },
          { name: 'Allow always for this resource', value: 'allow_resource' },
          { name: \`Always allow \${this.formatActionName(request.action)}\`, value: 'allow_action' },
          { name: 'Deny once', value: 'deny_once' },
          { name: 'Deny always for this resource', value: 'deny_resource' },
          { name: \`Always deny \${this.formatActionName(request.action)}\`, value: 'deny_action' },
        ],
        default: 'allow_once'
      }
    ]);

    switch (decision) {
      case 'allow_once':
        return { allowed: true, remember: false };
      case 'allow_resource':
        this.allowedActions.add(actionKey);
        return { allowed: true, remember: true };
      case 'allow_action':
        this.alwaysAllow.add(request.action);
        return { allowed: true, remember: true };
      case 'deny_once':
        return { allowed: false, remember: false };
      case 'deny_resource':
        this.deniedActions.add(actionKey);
        return { allowed: false, remember: true };
      case 'deny_action':
        this.alwaysDeny.add(request.action);
        return { allowed: false, remember: true };
      default:
        return { allowed: false, remember: false };
    }
  }

  private applyPolicy(action: PermissionAction): 'allow' | 'deny' | 'ask' {
    const highRisk: PermissionAction[] = ['run_command', 'delete_file'];
    const mediumRisk: PermissionAction[] = ['write_file', 'modify_file', 'network_request'];
    const lowRisk: PermissionAction[] = ['read_file'];

    if (this.policy === 'restrictive') {
      if (highRisk.includes(action)) return 'deny';
      if (mediumRisk.includes(action)) return 'ask';
      if (lowRisk.includes(action)) return 'allow';
    }

    if (this.policy === 'balanced') {
      if (highRisk.includes(action)) return 'ask';
      if (mediumRisk.includes(action)) return 'ask';
      return 'allow';
    }

    if (this.policy === 'permissive') {
      return 'allow';
    }

    return 'ask';
  }

  private async audit(request: PermissionRequest, response: PermissionResponse, source: 'policy' | 'prompt' | 'cached' | 'always') {
    try {
      await mkdir(dirname(this.auditPath), { recursive: true });
      const line = JSON.stringify({
        timestamp: new Date().toISOString(),
        action: request.action,
        resource: request.resource,
        details: request.details,
        allowed: response.allowed,
        remember: response.remember,
        mode: this.policy,
        source
      }) + '\\n';
      await appendFile(this.auditPath, line, { encoding: 'utf-8' });
    } catch (error) {
      console.warn('Failed to write audit log', error);
    }
  }

  private formatActionName(action: PermissionAction): string {
    switch (action) {
      case 'read_file':
        return 'file read';
      case 'write_file':
        return 'file writing';
      case 'run_command':
        return 'command execution';
      case 'delete_file':
        return 'file deletion';
      case 'modify_file':
        return 'file modification';
      case 'network_request':
        return 'network requests';
      default:
        return action;
    }
  }

  isHighRisk(action: PermissionAction): boolean {
    return ['run_command', 'delete_file'].includes(action);
  }

  reset(): void {
    this.allowedActions.clear();
    this.deniedActions.clear();
    this.alwaysAllow.clear();
    this.alwaysDeny.clear();
  }
}`
}

function generateToolImplementation(tool: any, config: AgentConfig): GeneratedFile | null {
  switch (tool.category) {
    case 'file':
      return {
        path: 'src/tools/file-operations.ts',
        content: generateFileOperationsImpl(),
        type: 'typescript',
        template: 'file-operations.ts'
      }
    case 'command':
      return {
        path: 'src/tools/command-runner.ts',
        content: generateCommandRunnerImpl(),
        type: 'typescript',
        template: 'command-runner.ts'
      }
    case 'web':
      return {
        path: 'src/tools/web-tools.ts',
        content: generateWebToolsImpl(),
        type: 'typescript',
        template: 'web-tools.ts'
      }
    default:
      return null
  }
}

function generateFileOperationsImpl(): string {
  return `import { readFile, writeFile, access, readdir, stat } from 'fs/promises'
import { join, resolve } from 'path'
import { glob } from 'glob'
import { PermissionManager } from '../permissions.js'

export class FileOperations {
  private permissionManager: PermissionManager;
  private baseDir: string;

  constructor(permissionManager: PermissionManager, baseDir: string = process.cwd()) {
    this.permissionManager = permissionManager;
    this.baseDir = resolve(baseDir);
  }

  /**
   * Validates that a path is within the allowed base directory.
   * Prevents directory traversal attacks and access outside sandbox.
   */
  private validatePath(filePath: string): string {
    const absolutePath = resolve(this.baseDir, filePath);
    // Ensure path is within baseDir (prevent directory traversal)
    if (!absolutePath.startsWith(this.baseDir + '/') && absolutePath !== this.baseDir) {
      throw new Error(\`Access denied: Path "\${filePath}" is outside the allowed directory "\${this.baseDir}"\`);
    }
    return absolutePath;
  }

  async readFile(filePath: string): Promise<string> {
    try {
      const safePath = this.validatePath(filePath);
      return await readFile(safePath, 'utf-8')
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Access denied:')) {
        throw error;
      }
      throw new Error(\`Failed to read file \${filePath}: \${error instanceof Error ? error.message : String(error)}\`)
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
    // Validate path first (before permission check)
    const safePath = this.validatePath(filePath);

    // Request permission before writing
    const permission = await this.permissionManager.requestPermission({
      action: 'write_file',
      resource: filePath,
      details: \`Writing \${content.length} characters\`
    });

    if (!permission.allowed) {
      throw new Error(\`Permission denied: Cannot write to \${filePath}\`);
    }

    try {
      await writeFile(safePath, content, 'utf-8')
    } catch (error) {
      throw new Error(\`Failed to write file \${filePath}: \${error instanceof Error ? error.message : String(error)}\`)
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      const safePath = this.validatePath(filePath);
      await access(safePath)
      return true
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Access denied:')) {
        throw error;
      }
      return false
    }
  }

  async listFiles(dirPath: string): Promise<string[]> {
    try {
      const safePath = this.validatePath(dirPath);
      const entries = await readdir(safePath, { withFileTypes: true })
      return entries
        .filter(entry => entry.isFile())
        .map(entry => entry.name)
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Access denied:')) {
        throw error;
      }
      throw new Error(\`Failed to list files in \${dirPath}: \${error instanceof Error ? error.message : String(error)}\`)
    }
  }

  async findFiles(pattern: string, cwd?: string): Promise<string[]> {
    // Block directory traversal patterns
    if (pattern.includes('..')) {
      throw new Error('Access denied: Path traversal patterns (..) not allowed');
    }

    // Always use baseDir as root, ignore cwd parameter for security
    try {
      const results = await glob(pattern, {
        cwd: this.baseDir,
        absolute: true,
        ignore: ['node_modules/**', '.git/**']
      });

      // Double-check all results are within baseDir
      return results.filter(p => p.startsWith(this.baseDir + '/') || p === this.baseDir);
    } catch (error) {
      throw new Error(\`Failed to find files matching \${pattern}: \${error instanceof Error ? error.message : String(error)}\`)
    }
  }

  async getFileStats(filePath: string): Promise<{ size: number; modified: Date; isDirectory: boolean }> {
    try {
      const safePath = this.validatePath(filePath);
      const stats = await stat(safePath)
      return {
        size: stats.size,
        modified: stats.mtime,
        isDirectory: stats.isDirectory()
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Access denied:')) {
        throw error;
      }
      throw new Error(\`Failed to get stats for \${filePath}: \${error instanceof Error ? error.message : String(error)}\`)
    }
  }
}`
}

function generateCommandRunnerImpl(): string {
  return `import { spawn } from 'child_process'
import { promisify } from 'util'
import { PermissionManager } from '../permissions.js'

export interface CommandResult {
  stdout: string
  stderr: string
  exitCode: number
  command: string
}

export class CommandRunner {
  private permissionManager: PermissionManager;

  constructor(permissionManager: PermissionManager) {
    this.permissionManager = permissionManager;
  }

  async execute(command: string, options?: { cwd?: string; timeout?: number }): Promise<CommandResult> {
    // Request permission before executing command (HIGH RISK)
    const permission = await this.permissionManager.requestPermission({
      action: 'run_command',
      resource: command,
      details: \`Executing command in \${options?.cwd || 'current directory'}\`
    });

    if (!permission.allowed) {
      throw new Error(\`Permission denied: Cannot execute command "\${command}"\`);
    }

    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ')
      const child = spawn(cmd, args, {
        cwd: options?.cwd || process.cwd(),
        stdio: 'pipe',
        shell: true
      })

      let stdout = ''
      let stderr = ''

      child.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      const timeout = options?.timeout || 30000
      const timer = setTimeout(() => {
        child.kill('SIGKILL')
        reject(new Error(\`Command timed out after \${timeout}ms: \${command}\`))
      }, timeout)

      child.on('close', (exitCode) => {
        clearTimeout(timer)
        resolve({
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          exitCode: exitCode || 0,
          command
        })
      })

      child.on('error', (error) => {
        clearTimeout(timer)
        reject(new Error(\`Failed to execute command \${command}: \${error.message}\`))
      })
    })
  }

  formatResult(result: CommandResult): string {
    let output = \`Command: \${result.command}\\n\`
    output += \`Exit Code: \${result.exitCode}\\n\`
    
    if (result.stdout) {
      output += \`\\nSTDOUT:\\n\${result.stdout}\\n\`
    }
    
    if (result.stderr) {
      output += \`\\nSTDERR:\\n\${result.stderr}\\n\`
    }
    
    return output
  }

  async executeShell(script: string, options?: { cwd?: string; timeout?: number }): Promise<CommandResult> {
    return this.execute(script, options)
  }
}`
}

function generateWebToolsImpl(): string {
  return `import axios from 'axios'
import * as cheerio from 'cheerio'
import { PermissionManager } from '../permissions.js'

export interface SearchResult {
  title: string
  url: string
  snippet: string
}

export class WebTools {
  private readonly userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  private permissionManager: PermissionManager;

  constructor(permissionManager: PermissionManager) {
    this.permissionManager = permissionManager;
  }

  async fetch(url: string): Promise<string> {
    // Request permission before making network request
    const permission = await this.permissionManager.requestPermission({
      action: 'network_request',
      resource: url,
      details: 'Fetching web page content'
    });

    if (!permission.allowed) {
      throw new Error(\`Permission denied: Cannot fetch \${url}\`);
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 10000
      })
      return response.data
    } catch (error) {
      throw new Error(\`Failed to fetch \${url}: \${error instanceof Error ? error.message : String(error)}\`)
    }
  }

  async fetchText(url: string): Promise<string> {
    try {
      const html = await this.fetch(url)
      const $ = cheerio.load(html)
      
      // Remove script and style elements
      $('script, style').remove()
      
      // Get text content
      return $('body').text().replace(/\\s+/g, ' ').trim()
    } catch (error) {
      throw new Error(\`Failed to extract text from \${url}: \${error instanceof Error ? error.message : String(error)}\`)
    }
  }

  async search(query: string, maxResults: number = 10): Promise<string[]> {
    try {
      // Use DuckDuckGo HTML search (no API key required)
      const searchUrl = \`https://html.duckduckgo.com/html/?q=\${encodeURIComponent(query)}\`

      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ResearchBot/1.0)'
        },
        timeout: 10000
      })

      const $ = cheerio.load(response.data)
      const results: string[] = []

      // Extract search results from DuckDuckGo HTML
      $('.result').each((index, element) => {
        if (index >= maxResults) return false

        const titleEl = $(element).find('.result__a')
        const snippetEl = $(element).find('.result__snippet')
        const url = titleEl.attr('href')
        const title = titleEl.text().trim()
        const snippet = snippetEl.text().trim()

        if (title && snippet) {
          results.push(\`**\${title}**\\n\${snippet}\\n\${url || ''}\`)
        }
      })

      if (results.length === 0) {
        return [\`No results found for: "\${query}"\`]
      }

      return results
    } catch (error) {
      console.error('Web search failed:', error instanceof Error ? error.message : String(error))
      return [\`Search failed: \${error instanceof Error ? error.message : 'Unknown error'}. Try using web_fetch with a specific URL instead.\`]
    }
  }

  extractLinks(html: string, baseUrl?: string): string[] {
    try {
      const $ = cheerio.load(html)
      const links: string[] = []
      
      $('a[href]').each((_, element) => {
        const href = $(element).attr('href')
        if (href) {
          if (baseUrl && href.startsWith('/')) {
            links.push(new URL(href, baseUrl).toString())
          } else if (href.startsWith('http')) {
            links.push(href)
          }
        }
      })
      
      return links
    } catch (error) {
      throw new Error(\`Failed to extract links: \${error instanceof Error ? error.message : String(error)}\`)
    }
  }

  extractMetadata(html: string): Record<string, string> {
    try {
      const $ = cheerio.load(html)
      const metadata: Record<string, string> = {}
      
      // Extract title
      metadata.title = $('title').text().trim()
      
      // Extract meta tags
      $('meta').each((_, element) => {
        const name = $(element).attr('name') || $(element).attr('property')
        const content = $(element).attr('content')
        
        if (name && content) {
          metadata[name] = content
        }
      })
      
      return metadata
    } catch (error) {
      throw new Error(\`Failed to extract metadata: \${error instanceof Error ? error.message : String(error)}\`)
    }
  }
}`
}

function generateKnowledgeToolsImpl(): GeneratedFile {
  return {
    path: 'src/tools/knowledge-tools.ts',
    template: 'knowledge-tools.ts',
    type: 'typescript',
    content: `import { readFile, writeFile, mkdir, stat } from 'fs/promises'
import { resolve, dirname, extname, basename } from 'path'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import { PermissionManager } from '../permissions.js'

export interface DocumentMetadata {
  title: string
  source: string
  format: string
  pageCount?: number
  wordCount: number
  charCount: number
  estimatedReadTime: string
  extractedAt: string
}

export interface ExtractResult {
  text: string
  source: string
  metadata: DocumentMetadata
}

export interface ChunkResult {
  chunks: string[]
  metadata: DocumentMetadata
}

export interface TableResult {
  tables: Array<{
    rows: string[][]
    format: 'csv' | 'tsv' | 'markdown' | 'unknown'
  }>
  source: string
}

export class KnowledgeTools {
  private permissionManager: PermissionManager
  private notesPath: string

  constructor(permissionManager: PermissionManager, notesPath = resolve(process.cwd(), 'data', 'notes.md')) {
    this.permissionManager = permissionManager
    this.notesPath = notesPath
  }

  /**
   * Extract text from various document formats
   * Supports: PDF, DOCX, TXT, MD, HTML, CSV, JSON
   */
  async extractText(filePath: string, captureSources = true): Promise<ExtractResult> {
    const absolutePath = resolve(filePath)
    await this.ensureReadable(absolutePath)
    const ext = extname(absolutePath).toLowerCase()
    const fileName = basename(absolutePath)

    let text = ''
    let pageCount: number | undefined

    try {
      switch (ext) {
        case '.pdf': {
          const buffer = await readFile(absolutePath)
          const data = await pdf(buffer)
          text = data.text
          pageCount = data.numpages
          break
        }
        case '.docx': {
          const result = await mammoth.extractRawText({ path: absolutePath })
          text = result.value
          if (result.messages.length > 0) {
            console.warn('DOCX warnings:', result.messages.map(m => m.message).join(', '))
          }
          break
        }
        case '.html':
        case '.htm': {
          const html = await readFile(absolutePath, 'utf-8')
          text = this.stripHtml(html)
          break
        }
        case '.json': {
          const json = await readFile(absolutePath, 'utf-8')
          text = JSON.stringify(JSON.parse(json), null, 2)
          break
        }
        case '.csv': {
          text = await readFile(absolutePath, 'utf-8')
          break
        }
        default:
          text = await readFile(absolutePath, 'utf-8')
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      throw new Error(\`Failed to extract text from \${fileName}: \${msg}\`)
    }

    // Clean up text
    text = this.cleanText(text)

    const metadata = this.computeMetadata(fileName, absolutePath, ext, text, pageCount)
    const source = captureSources ? absolutePath : ''

    return { text, source, metadata }
  }

  /**
   * Extract text in chunks for large documents (reduces token usage)
   * @param chunkSize - Target characters per chunk (default 4000 ~= 1000 tokens)
   * @param overlap - Characters to overlap between chunks (default 200)
   */
  async extractChunked(filePath: string, chunkSize = 4000, overlap = 200): Promise<ChunkResult> {
    const { text, metadata } = await this.extractText(filePath, true)

    const chunks: string[] = []
    let start = 0

    while (start < text.length) {
      let end = start + chunkSize

      // Try to break at paragraph or sentence boundary
      if (end < text.length) {
        const paragraphBreak = text.lastIndexOf('\\n\\n', end)
        const sentenceBreak = text.lastIndexOf('. ', end)

        if (paragraphBreak > start + chunkSize * 0.5) {
          end = paragraphBreak + 2
        } else if (sentenceBreak > start + chunkSize * 0.5) {
          end = sentenceBreak + 2
        }
      }

      chunks.push(text.slice(start, end).trim())
      start = end - overlap
    }

    return { chunks, metadata }
  }

  /**
   * Extract tables from documents with better detection
   */
  async extractTables(filePath: string): Promise<TableResult> {
    const { text, source } = await this.extractText(filePath, true)
    const tables: TableResult['tables'] = []

    // Detect CSV-style tables (comma-separated)
    const csvBlocks = this.detectTableBlocks(text, ',')
    for (const block of csvBlocks) {
      tables.push({ rows: block, format: 'csv' })
    }

    // Detect TSV-style tables (tab-separated)
    const tsvBlocks = this.detectTableBlocks(text, '\\t')
    for (const block of tsvBlocks) {
      tables.push({ rows: block, format: 'tsv' })
    }

    // Detect markdown tables
    const mdTables = this.detectMarkdownTables(text)
    for (const table of mdTables) {
      tables.push({ rows: table, format: 'markdown' })
    }

    return { tables, source }
  }

  /**
   * Get document summary without full extraction (faster for large docs)
   */
  async getDocumentInfo(filePath: string): Promise<DocumentMetadata> {
    const absolutePath = resolve(filePath)
    await this.ensureReadable(absolutePath)

    const ext = extname(absolutePath).toLowerCase()
    const fileName = basename(absolutePath)
    const stats = await stat(absolutePath)

    // For PDFs, we can get page count without full extraction
    if (ext === '.pdf') {
      try {
        const buffer = await readFile(absolutePath)
        const data = await pdf(buffer, { max: 1 }) // Only parse first page
        return {
          title: fileName,
          source: absolutePath,
          format: 'PDF',
          pageCount: data.numpages,
          wordCount: 0, // Unknown without full extraction
          charCount: stats.size,
          estimatedReadTime: \`~\${Math.ceil(data.numpages * 2)} min (based on page count)\`,
          extractedAt: new Date().toISOString()
        }
      } catch {
        // Fall through to basic info
      }
    }

    return {
      title: fileName,
      source: absolutePath,
      format: ext.slice(1).toUpperCase(),
      wordCount: 0,
      charCount: stats.size,
      estimatedReadTime: 'Unknown',
      extractedAt: new Date().toISOString()
    }
  }

  async saveNote(title: string, source: string, content: string): Promise<string> {
    await this.permissionManager.requestPermission({
      action: 'write_file',
      resource: this.notesPath,
      details: 'Appending to local notes'
    })
    await mkdir(dirname(this.notesPath), { recursive: true })

    const timestamp = new Date().toISOString().split('T')[0]
    const entry = [
      '',
      \`## \${title}\`,
      \`*Source: \${source}*\`,
      \`*Added: \${timestamp}*\`,
      '',
      content,
      '',
      '---'
    ].join('\\n')

    await writeFile(this.notesPath, entry, { flag: 'a' })
    return \`Saved note "\${title}" to \${this.notesPath}\`
  }

  async searchLocal(query: string, limit = 5): Promise<string> {
    try {
      const { text } = await this.extractText(this.notesPath, false)
      const lines = text.split('\\n').filter(Boolean)

      // Score lines by relevance (simple term frequency)
      const queryTerms = query.toLowerCase().split(/\\s+/)
      const scored = lines.map(line => {
        const lower = line.toLowerCase()
        const score = queryTerms.reduce((s, term) => s + (lower.includes(term) ? 1 : 0), 0)
        return { line, score }
      })

      const matches = scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(s => s.line)

      if (matches.length === 0) {
        return \`No matches found for "\${query}" in local notes.\`
      }

      return [\`Found \${matches.length} matches for "\${query}":\`, '', ...matches].join('\\n')
    } catch {
      return 'No notes found. Use saveNote to create notes first.'
    }
  }

  // ─── Private Helpers ─────────────────────────────────────────────

  private async ensureReadable(path: string) {
    await this.permissionManager.requestPermission({
      action: 'read_file',
      resource: path,
      details: 'Reading document for analysis'
    })
  }

  private cleanText(text: string): string {
    return text
      .replace(/\\r\\n/g, '\\n')           // Normalize line endings
      .replace(/\\n{3,}/g, '\\n\\n')        // Collapse multiple blank lines
      .replace(/[ \\t]+/g, ' ')           // Collapse whitespace
      .replace(/^\\s+|\\s+$/gm, '')        // Trim lines
      .trim()
  }

  private stripHtml(html: string): string {
    return html
      .replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, '')  // Remove scripts
      .replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi, '')    // Remove styles
      .replace(/<[^>]+>/g, ' ')                            // Remove tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
  }

  private computeMetadata(
    fileName: string,
    source: string,
    ext: string,
    text: string,
    pageCount?: number
  ): DocumentMetadata {
    const words = text.split(/\\s+/).filter(Boolean)
    const wordCount = words.length
    const charCount = text.length
    const readingSpeed = 200 // words per minute
    const minutes = Math.ceil(wordCount / readingSpeed)

    return {
      title: fileName,
      source,
      format: ext.slice(1).toUpperCase(),
      pageCount,
      wordCount,
      charCount,
      estimatedReadTime: minutes < 1 ? '< 1 min' : \`~\${minutes} min\`,
      extractedAt: new Date().toISOString()
    }
  }

  private detectTableBlocks(text: string, delimiter: string): string[][][] {
    const lines = text.split('\\n')
    const tables: string[][][] = []
    let currentTable: string[][] = []

    for (const line of lines) {
      const cells = line.split(delimiter)
      // Consider it a table row if it has 2+ cells and consistent structure
      if (cells.length >= 2 && cells.every(c => c.trim().length < 100)) {
        currentTable.push(cells.map(c => c.trim()))
      } else if (currentTable.length >= 2) {
        // End of table block (need at least 2 rows)
        tables.push(currentTable)
        currentTable = []
      } else {
        currentTable = []
      }
    }

    if (currentTable.length >= 2) {
      tables.push(currentTable)
    }

    return tables
  }

  private detectMarkdownTables(text: string): string[][][] {
    const tables: string[][][] = []
    const lines = text.split('\\n')

    let i = 0
    while (i < lines.length) {
      // Look for markdown table header separator (|---|---|)
      if (/^\\|?[\\s-:|]+\\|[\\s-:|]+\\|?$/.test(lines[i])) {
        const table: string[][] = []

        // Get header (previous line)
        if (i > 0 && lines[i - 1].includes('|')) {
          table.push(this.parseMarkdownRow(lines[i - 1]))
        }

        // Skip separator
        i++

        // Get body rows
        while (i < lines.length && lines[i].includes('|')) {
          table.push(this.parseMarkdownRow(lines[i]))
          i++
        }

        if (table.length >= 2) {
          tables.push(table)
        }
      } else {
        i++
      }
    }

    return tables
  }

  private parseMarkdownRow(line: string): string[] {
    return line
      .split('|')
      .map(cell => cell.trim())
      .filter(cell => cell.length > 0)
  }
}
`
  }
}

function generateReadme(config: AgentConfig, template: any, enabledTools: any[]): string {
  const hasHighRiskTools = enabledTools.some(t => ['run-command', 'write-file'].includes(t.id))

  return `# ${config.name}

${config.description}

## ⚠️ Security Warning

**IMPORTANT: This agent has the ability to execute code and perform actions on your system.**

${hasHighRiskTools ? `This agent is configured with HIGH-RISK tools that can:
- Execute system commands
- Modify files on your filesystem
- Make network requests

**Best Practices for Safe Usage:**
- ✅ **Run in a VM or sandbox environment** when testing
- ✅ **Review all permissions** before approving actions
- ✅ **Never run with elevated privileges** unless absolutely necessary
- ✅ **Limit file system access** to specific directories
- ✅ **Monitor network activity** when web tools are enabled
- ❌ **Do NOT run untested agents** on production systems
- ❌ **Do NOT grant blanket permissions** without understanding the implications

This agent includes a built-in **permission system** that will ask for approval before executing high-risk operations. Always review these prompts carefully.
` : `This agent has moderate-risk capabilities. Always review and approve operations before execution.`}

## Features

${enabledTools.map(tool => `- **${tool.name}**: ${tool.description}`).join('\n')}

### Safety & Audit
- Permission policy: ${config.permissions || 'balanced'}
- Audit log: stored locally at \`~/.${config.projectName}/audit.log\`
- **Workspace sandboxing**: All file operations are restricted to the current working directory

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- ${config.sdkProvider === 'claude' ? 'Anthropic API key' : config.sdkProvider === 'openai' ? 'OpenAI API key' : 'API key'}

## Installation

### Option 1: Install Globally (Recommended)

Install once, use from any directory:

\`\`\`bash
# Build and link globally
npm install
./scripts/publish.sh --link

# Or install globally from source
./scripts/publish.sh --global
\`\`\`

Then use from any project directory:
\`\`\`bash
cd /path/to/your/project
${config.projectName}
\`\`\`

### Option 2: Local Development

\`\`\`bash
npm install
npm run build
npm start
\`\`\`

## Configuration

Create a \`.env\` file in any directory where you want to use the agent:

\`\`\`bash
echo "${getApiKeyEnvVar(config.sdkProvider)}=your_api_key_here" > .env
\`\`\`

Or set the environment variable:
\`\`\`bash
export ${getApiKeyEnvVar(config.sdkProvider)}=your_api_key_here
\`\`\`

**Note:** When installed globally, the agent loads \`.env\` from your current working directory.

## Usage

### Interactive Mode
\`\`\`bash
cd /path/to/your/project  # Agent is sandboxed to this directory
${config.projectName}
\`\`\`

### Single Query
\`\`\`bash
${config.projectName} "Your question here"
\`\`\`

### Help
\`\`\`bash
${config.projectName} --help
\`\`\`

### Workspace Security

The agent is **sandboxed** to your current working directory:
- All file operations (read, write, list) are restricted to the current directory
- The agent cannot access files above the directory where you run it
- This allows safe usage across different projects

## Customization

### Modifying the System Prompt

The agent's behavior is controlled by the system prompt in \`src/agent.ts\`. To customize:

1. Open \`src/agent.ts\`
2. Find the \`buildSystemPrompt()\` method (or \`buildInstructions()\` for OpenAI)
3. Edit the template string to modify:
   - Agent personality and tone
   - Domain-specific knowledge
   - Task priorities and guidelines
   - Tool usage preferences

Example:
\`\`\`typescript
private buildSystemPrompt(): string {
  return \`You are ${config.name}, a specialized AI assistant.

  YOUR CUSTOM INSTRUCTIONS HERE

  Be helpful and thorough in your responses.\`;
}
\`\`\`

### Local Knowledge Workflow
- Drop PDFs/DOCX/TXT into \`./data/sources\`
- Use tools \`doc_ingest\`, \`table_extract\`, \`source_notes\`, \`local_retrieval\`
- See \`workflows/literature_review.md\` and \`data/sample-notes.md\` for examples

### Adding Custom Tools

To add new tools:

1. Create a new file in \`src/tools/my-custom-tool.ts\`
2. Implement your tool class with permission checks
3. Import and initialize it in \`src/agent.ts\`
4. Rebuild: \`npm run build\`

**Tip:** Claude Code is excellent at helping you customize your agent! Just ask it to help modify the prompts or add new capabilities.

### Adjusting Permission Settings

Edit \`src/permissions.ts\` to:
- Change default permission behaviors
- Add/remove permission types
- Customize permission prompt messages
- Implement persistent permission storage

## Publishing

### Quick Start
\`\`\`bash
chmod +x scripts/publish.sh
./scripts/publish.sh --help    # See all options
\`\`\`

### Publish Options

| Command | Description |
|---------|-------------|
| \`./scripts/publish.sh --link\` | Link globally for local development |
| \`./scripts/publish.sh --global\` | Install globally from source |
| \`./scripts/publish.sh --public\` | Publish to npmjs.com (public) |
| \`./scripts/publish.sh --private\` | Publish to private registry |
| \`./scripts/publish.sh --dry-run\` | Test publish without publishing |
| \`./scripts/publish.sh --pack\` | Create tarball for distribution |

### Publishing to a Private Registry

1. Copy the template: \`cp .npmrc.example .npmrc\`
2. Edit \`.npmrc\` with your registry URL and auth token
3. Run: \`./scripts/publish.sh --private\`

Supported registries:
- GitHub Packages
- GitLab Packages
- Artifactory
- Verdaccio (self-hosted)
- AWS CodeArtifact

### Scoped Packages

To publish under a scope (e.g., \`@mycompany/${config.projectName}\`):
1. Update \`package.json\` "name" field
2. Configure scope in \`.npmrc\`

## Development

\`\`\`bash
npm run dev    # Watch mode for development
npm run build  # Build TypeScript to JavaScript
npm run start  # Run the built CLI
npm test       # Show help (basic test)
\`\`\`

## Troubleshooting

### API Key Issues
- Verify your API key is correct
- Check that environment variables are set
- Run \`${config.projectName} config --show\` to verify configuration

### Permission Errors
- Review file/directory permissions
- Ensure the agent has access to required resources
- Check that you're approving permission requests

### Build Errors
- Clear dist folder: \`npm run clean\`
- Reinstall dependencies: \`rm -rf node_modules && npm install\`
- Check Node.js version: \`node --version\` (should be ≥18.0.0)

## Generated with Agent Workshop

This agent was generated using [Agent Workshop](https://agent-workshop.dev) - the fastest way to build specialized AI agents.

## License

${config.license || 'MIT'}
`
}

function generateEnvExample(config: AgentConfig): string {
  // Collect MCP server environment variables
  const mcpEnvVars: string[] = [];
  for (const server of config.mcpServers || []) {
    if (server.transportType === 'stdio' && (server as any).env) {
      for (const [key, value] of Object.entries((server as any).env)) {
        if (typeof value === 'string' && value.includes('${')) {
          // Extract variable name from ${VAR_NAME}
          const matches = value.match(/\$\{([^}]+)\}/g);
          if (matches) {
            for (const match of matches) {
              const varName = match.slice(2, -1).split(':-')[0];
              if (!mcpEnvVars.includes(varName)) {
                mcpEnvVars.push(varName);
              }
            }
          }
        }
      }
    }
  }

  const mcpEnvSection = mcpEnvVars.length > 0
    ? `\n# MCP Server Environment Variables\n${mcpEnvVars.map(v => `# ${v}=your_${v.toLowerCase()}_here`).join('\n')}\n`
    : '';

  return `# API Configuration
${getApiKeyEnvVar(config.sdkProvider)}=your_api_key_here

# Agent Settings
VERBOSE=false
LOG_LEVEL=info
${mcpEnvSection}
# Optional: Custom configuration
# CONFIG_PATH=/path/to/custom/config
`
}

function generateGitignore(config: AgentConfig): string {
  return `# Dependencies
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment and secrets
.env
.env.local
.env.*.local
*.pem

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Audit logs (may contain sensitive operation details)
audit.log

# Agent config directory (may contain cached API keys)
.${config.projectName}/

# npm
*.tgz
.npmrc

# Plans directory (contains local plan files)
.plans/
`
}

function generateNpmrcExample(config: AgentConfig): string {
  return `# npm Registry Configuration
# Copy this file to .npmrc and update with your settings

# ============================================
# Option 1: Public npm Registry (default)
# ============================================
# No configuration needed - publishes to npmjs.com
# Run: ./scripts/publish.sh --public

# ============================================
# Option 2: Private npm Registry
# ============================================
# Uncomment and configure for your private registry:

# GitHub Packages
# @your-org:registry=https://npm.pkg.github.com
# //npm.pkg.github.com/:_authToken=\${NPM_TOKEN}

# GitLab Packages
# @your-org:registry=https://gitlab.com/api/v4/projects/PROJECT_ID/packages/npm/
# //gitlab.com/api/v4/projects/PROJECT_ID/packages/npm/:_authToken=\${NPM_TOKEN}

# Artifactory
# registry=https://your-company.jfrog.io/artifactory/api/npm/npm-local/
# //your-company.jfrog.io/artifactory/api/npm/npm-local/:_authToken=\${NPM_TOKEN}

# Verdaccio (self-hosted)
# registry=http://localhost:4873/
# //localhost:4873/:_authToken=\${NPM_TOKEN}

# AWS CodeArtifact
# registry=https://your-domain-123456789.d.codeartifact.region.amazonaws.com/npm/your-repo/
# //your-domain-123456789.d.codeartifact.region.amazonaws.com/npm/your-repo/:_authToken=\${CODEARTIFACT_AUTH_TOKEN}

# ============================================
# Scoped Package Configuration
# ============================================
# To publish under a scope (e.g., @mycompany/${config.projectName}):
# 1. Update package.json "name" to "@mycompany/${config.projectName}"
# 2. Configure scope registry above

# ============================================
# Authentication
# ============================================
# Set NPM_TOKEN environment variable or use npm login:
#   export NPM_TOKEN=your-token-here
#   npm login --registry=https://your-registry.com
`
}

function generateLicense(config: AgentConfig): string {
  const year = new Date().getFullYear()
  const author = config.author || 'Author'

  if (config.license === 'Apache-2.0') {
    return `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright ${year} ${author}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
`
  }

  // Default to MIT
  return `MIT License

Copyright (c) ${year} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`
}

function generatePublishScript(config: AgentConfig): string {
  return `#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "\$SCRIPT_DIR")"
cd "\$PROJECT_DIR"

show_help() {
  echo "Usage: ./scripts/publish.sh [OPTION]"
  echo
  echo "Build and publish ${config.projectName}"
  echo
  echo "Options:"
  echo "  --link              Link globally for local development"
  echo "  --global            Install globally from source"
  echo "  --public            Publish to public npm registry"
  echo "  --private           Publish to private registry (requires .npmrc)"
  echo "  --dry-run           Test publish without actually publishing"
  echo "  --pack              Create tarball without publishing"
  echo "  -h, --help          Show this help message"
  echo
  echo "Examples:"
  echo "  ./scripts/publish.sh --link      # For local development"
  echo "  ./scripts/publish.sh --public    # Publish to npmjs.com"
  echo "  ./scripts/publish.sh --private   # Publish to private registry"
}

# Build first
echo "🔧 Building ${config.projectName}..."
npm install
npm run build

case "\${1:-}" in
  --link)
    echo "🔗 Linking globally (for local development)..."
    npm link
    echo
    echo "✅ Linked! You can now run '${config.projectName}' from any directory."
    echo "📁 The agent will use the current directory as its workspace."
    echo
    echo "To unlink later: npm unlink -g ${config.projectName}"
    ;;

  --global)
    echo "📦 Installing globally..."
    npm install -g .
    echo
    echo "✅ Installed! You can now run '${config.projectName}' from any directory."
    ;;

  --public)
    echo "📦 Publishing to public npm registry..."
    echo
    read -p "Publish ${config.projectName} to npmjs.com? (y/N) " confirm
    if [[ "\$confirm" =~ ^[Yy]\$ ]]; then
      npm publish --access public
      echo
      echo "✅ Published! Install with: npm install -g ${config.projectName}"
    else
      echo "Cancelled."
    fi
    ;;

  --private)
    if [[ ! -f .npmrc ]]; then
      echo "⚠️  No .npmrc file found!"
      echo "Copy .npmrc.example to .npmrc and configure your private registry:"
      echo "  cp .npmrc.example .npmrc"
      echo "  # Edit .npmrc with your registry URL and auth token"
      exit 1
    fi
    echo "📦 Publishing to private registry..."
    npm publish
    echo
    echo "✅ Published to private registry!"
    ;;

  --dry-run)
    echo "🧪 Dry run - testing publish..."
    npm publish --dry-run
    echo
    echo "✅ Dry run complete. Use --public or --private to actually publish."
    ;;

  --pack)
    echo "📦 Creating tarball..."
    npm pack
    echo
    echo "✅ Tarball created. You can distribute this .tgz file directly."
    ;;

  -h|--help)
    show_help
    ;;

  *)
    show_help
    ;;
esac
`
}

function generateWorkflowExecutor(config: AgentConfig): string {
  return `import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import chalk from 'chalk';
import ora from 'ora';
import type { PermissionManager } from './permissions.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

export interface WorkflowStep {
  name: string;
  tool?: string;
  prompt?: string;
  input?: any;
  forEach?: string;
  output?: string;
  retry?: {
    maxAttempts: number;
    backoff: 'linear' | 'exponential';
    retryOn?: string[];
  };
  onError?: 'stop' | 'continue' | 'skip';
}

export interface WorkflowDefinition {
  name: string;
  description: string;
  arguments: Array<{
    name: string;
    type: string;
    required?: boolean;
    default?: any;
    description: string;
  }>;
  workflow: {
    steps: WorkflowStep[];
  };
  permissions: string[];
  requiresApproval?: boolean;
}

export interface WorkflowContext {
  variables: Map<string, any>;
  agent: any;
  permissionManager: PermissionManager;
}

export class WorkflowExecutor {
  constructor(private permissionManager: PermissionManager) {}

  async execute(
    workflow: WorkflowDefinition,
    args: Record<string, any>,
    context: WorkflowContext
  ): Promise<any> {
    // Initialize context with arguments
    for (const [key, value] of Object.entries(args)) {
      context.variables.set(key, value);
    }

    // Add timestamp variable
    context.variables.set('timestamp', new Date().toISOString().replace(/[:.]/g, '-'));

    const spinner = ora({ text: \`Executing workflow: \${workflow.name}\`, spinner: 'dots' }).start();

    try {
      for (let i = 0; i < workflow.workflow.steps.length; i++) {
        const step = workflow.workflow.steps[i];
        spinner.text = \`Step \${i + 1}/\${workflow.workflow.steps.length}: \${step.name}\`;

        // Execute step
        const result = await this.executeStep(step, context);

        // Store result in context
        if (step.output) {
          const varName = this.extractVariableName(step.output);
          context.variables.set(varName, result);
        }
      }

      spinner.succeed('Workflow completed successfully');
      return context.variables.get('$result') || context.variables.get('$output');
    } catch (error) {
      spinner.fail(\`Workflow failed: \${error instanceof Error ? error.message : String(error)}\`);
      throw error;
    }
  }

  async executeStep(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    const maxAttempts = step.retry?.maxAttempts || 1;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.executeStepInternal(step, context);
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxAttempts && this.shouldRetry(error, step.retry)) {
          const delay = this.calculateBackoff(attempt, step.retry?.backoff);
          console.log(chalk.yellow(\`  Retrying in \${delay}ms (attempt \${attempt + 1}/\${maxAttempts})...\`));
          await this.sleep(delay);
          continue;
        }

        // Handle based on onError strategy
        if (step.onError === 'continue') {
          console.warn(chalk.yellow(\`  Step \${step.name} failed, continuing: \${lastError.message}\`));
          return null;
        } else if (step.onError === 'skip') {
          return undefined;
        }

        throw lastError;
      }
    }
  }

  async executeStepInternal(step: WorkflowStep, context: WorkflowContext): Promise<any> {
    // Resolve template variables in input
    const resolvedInput = this.resolveTemplates(step.input, context);

    if (step.forEach) {
      // Parallel execution for forEach
      const pattern = this.resolveTemplates(step.forEach, context);
      const items = await this.resolvePath(pattern, context);

      return await Promise.all(
        items.map(item => this.executeStepInternal({ ...step, input: item, forEach: undefined }, context))
      );
    } else if (step.tool) {
      // Call tool directly via agent
      return await this.callTool(step.tool, resolvedInput, context.agent);
    } else if (step.prompt) {
      // Query agent with prompt
      const prompt = this.resolveTemplates(step.prompt, context);
      return await this.queryAgent(prompt, context.agent);
    }

    throw new Error(\`Step \${step.name} has no executable action (tool or prompt)\`);
  }

  async callTool(toolName: string, input: any, agent: any): Promise<any> {
    // This is a simplified implementation
    // In a real implementation, we'd need to call the tool through the agent's tool system
    console.log(chalk.gray(\`  → Calling tool: \${toolName}\`));

    // For now, we'll just return the input
    // This would need to be implemented to actually call tools
    return { success: true, tool: toolName, input };
  }

  async queryAgent(prompt: string, agent: any): Promise<any> {
    console.log(chalk.gray('  → Querying agent...'));

    let result = '';
    for await (const message of agent.query(prompt)) {
      if (message.type === 'stream_event') {
        if (message.event?.type === 'content_block_delta' && message.event.delta?.type === 'text_delta') {
          const text = message.event.delta.text || '';
          process.stdout.write(text);
          result += text;
        }
      }
    }
    process.stdout.write('\\n');

    return result;
  }

  async resolvePath(pattern: string, context: WorkflowContext): Promise<string[]> {
    try {
      const files = await glob(pattern);
      return files;
    } catch (error) {
      console.error(chalk.red(\`Failed to resolve path pattern: \${pattern}\`));
      return [];
    }
  }

  resolveTemplates(template: any, context: WorkflowContext): any {
    if (typeof template !== 'string') {
      return template;
    }

    return template.replace(/\\{\\{([^}]+)\\}\\}/g, (_, varName) => {
      const trimmed = varName.trim();
      const value = context.variables.get(trimmed);
      return value !== undefined ? String(value) : \`{{\${trimmed}}\}\`;
    });
  }

  extractVariableName(output: string): string {
    const match = output.match(/\\{\\{([^}]+)\\}\\}/);
    return match ? match[1].trim() : output;
  }

  shouldRetry(error: any, retry?: WorkflowStep['retry']): boolean {
    if (!retry || !retry.retryOn) {
      return true; // Retry all errors if retry is configured
    }

    const errorType = error?.constructor?.name || 'Error';
    return retry.retryOn.includes(errorType);
  }

  calculateBackoff(attempt: number, backoff: 'linear' | 'exponential' = 'linear'): number {
    if (backoff === 'exponential') {
      return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
    }
    return 1000 * attempt;
  }

  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async loadWorkflow(commandName: string): Promise<WorkflowDefinition> {
    // Resolve path relative to project root, not current working directory
    const workflowPath = join(PROJECT_ROOT, '.commands', \`\${commandName}.json\`);

    if (!existsSync(workflowPath)) {
      throw new Error(\`Workflow not found: \${commandName} (looked in \${workflowPath})\`);
    }

    try {
      const content = readFileSync(workflowPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(\`Failed to load workflow: \${commandName} - \${error instanceof Error ? error.message : String(error)}\`);
    }
  }
}
`
}

function generateLiteratureReviewWorkflow(): string {
  const workflow = {
    name: "literature-review",
    description: "Perform systematic literature review with citations and bibliography generation",
    arguments: [
      {
        name: "sources",
        type: "path",
        required: true,
        description: "Path to PDFs/documents directory (e.g., ./data/sources)"
      },
      {
        name: "output",
        type: "path",
        default: "./output/literature-review.md",
        description: "Output file path for the review"
      },
      {
        name: "limit",
        type: "number",
        default: 10,
        description: "Maximum number of key claims to extract"
      }
    ],
    workflow: {
      steps: [
        {
          name: "find_documents",
          forEach: "{{sources}}/**/*.{pdf,docx,txt}",
          tool: "doc_ingest",
          input: "{{item}}",
          output: "{{$documents}}",
          onError: "continue"
        },
        {
          name: "extract_claims",
          prompt: "Based on the {{$documents.length}} documents I've ingested, extract the top {{limit}} most important claims or findings. For each claim, provide: 1) The claim itself, 2) Which document it came from (include file path), 3) A brief quote or evidence. Format as a numbered list with citations.",
          output: "{{$claims}}"
        },
        {
          name: "identify_gaps",
          prompt: "Based on the claims extracted, identify 3-5 research gaps or open questions that aren't fully addressed in the literature.",
          output: "{{$gaps}}"
        },
        {
          name: "generate_bibliography",
          prompt: "Create an annotated bibliography entry for each document, including: file path, key findings, and relevance to the research topic. Format in markdown.",
          output: "{{$bibliography}}"
        },
        {
          name: "compile_review",
          prompt: "Compile a complete literature review document with these sections: 1) Executive Summary, 2) Key Claims ({{$claims}}), 3) Research Gaps ({{$gaps}}), 4) Annotated Bibliography ({{$bibliography}}). Use markdown formatting.",
          output: "{{$review}}"
        },
        {
          name: "save_review",
          tool: "write_file",
          input: {
            filePath: "{{output}}",
            content: "{{$review}}"
          },
          output: "{{$result}}"
        }
      ]
    },
    permissions: ["read_file", "write_file"],
    requiresApproval: false
  };

  return JSON.stringify(workflow, null, 2);
}

function generateExperimentLogWorkflow(): string {
  const workflow = {
    name: "experiment-log",
    description: "Create structured experiment log with data traceability",
    arguments: [
      {
        name: "hypothesis",
        type: "string",
        required: true,
        description: "The hypothesis being tested"
      },
      {
        name: "data",
        type: "path",
        required: false,
        description: "Path to data file (CSV, JSON, etc.)"
      },
      {
        name: "context",
        type: "string",
        required: false,
        description: "Additional context or background"
      }
    ],
    workflow: {
      steps: [
        {
          name: "read_data",
          tool: "read_file",
          input: "{{data}}",
          output: "{{$dataContent}}",
          onError: "skip"
        },
        {
          name: "analyze_data",
          prompt: "Analyze this data and provide observations: {{$dataContent}}. If no data was provided, skip this analysis.",
          output: "{{$observations}}",
          onError: "continue"
        },
        {
          name: "generate_log",
          prompt: "Create a detailed experiment log entry with these sections:\\n\\n**Experiment Log - {{timestamp}}**\\n\\n**Hypothesis:** {{hypothesis}}\\n\\n**Context:** {{context}}\\n\\n**Data Source:** {{data}}\\n\\n**Observations:** {{$observations}}\\n\\n**Results:** [Provide analysis of whether the hypothesis is supported]\\n\\n**Next Actions:** [Suggest 2-3 concrete next steps]\\n\\nUse markdown formatting and be thorough.",
          output: "{{$log}}"
        },
        {
          name: "save_log",
          tool: "write_file",
          input: {
            filePath: "./logs/experiment-{{timestamp}}.md",
            content: "{{$log}}"
          },
          output: "{{$result}}"
        },
        {
          name: "update_index",
          tool: "write_file",
          input: {
            filePath: "./logs/index.md",
            content: "## Experiment Log Index\\n\\n- [{{timestamp}}](./experiment-{{timestamp}}.md) - {{hypothesis}}\\n"
          },
          onError: "continue"
        }
      ]
    },
    permissions: ["read_file", "write_file"],
    requiresApproval: false
  };

  return JSON.stringify(workflow, null, 2);
}

// Development Domain Workflows

function generateCodeAuditWorkflow(): string {
  const workflow = {
    name: "code-audit",
    description: "Comprehensive code audit for technical debt, security issues, and modernization opportunities",
    arguments: [
      {
        name: "path",
        type: "path",
        required: true,
        description: "Path to codebase directory to audit"
      },
      {
        name: "output",
        type: "path",
        default: "./audit-report-{{timestamp}}.md",
        description: "Output path for audit report"
      },
      {
        name: "focus",
        type: "string",
        required: false,
        description: "Focus area: security, performance, maintainability, or all"
      }
    ],
    workflow: {
      steps: [
        {
          name: "scan_files",
          tool: "find_files",
          input: "{{path}}/**/*.{js,ts,jsx,tsx,py,java,go,rb}",
          output: "{{$files}}"
        },
        {
          name: "analyze_structure",
          prompt: "Analyze the file structure of this codebase. Identify: 1) Architecture pattern, 2) Technology stack, 3) Potential organizational issues.",
          output: "{{$structure}}"
        },
        {
          name: "search_deprecated",
          tool: "search_files",
          input: {
            path: "{{path}}",
            pattern: "(TODO|FIXME|HACK|XXX|deprecated|legacy)"
          },
          output: "{{$issues}}",
          onError: "continue"
        },
        {
          name: "security_scan",
          prompt: "Review the codebase for common security issues: 1) SQL injection vulnerabilities, 2) XSS risks, 3) Exposed secrets/keys, 4) Insecure dependencies. Focus: {{focus}}",
          output: "{{$security}}"
        },
        {
          name: "technical_debt",
          prompt: "Identify technical debt: 1) Code duplication, 2) Complex functions needing refactoring, 3) Missing tests, 4) Outdated patterns. Prioritize by impact.",
          output: "{{$debt}}"
        },
        {
          name: "generate_report",
          prompt: "Create comprehensive audit report with sections for overview, security findings, technical debt, flagged issues, and prioritized recommendations with effort estimates",
          output: "{{$report}}"
        },
        {
          name: "save_report",
          tool: "write_file",
          input: {
            filePath: "{{output}}",
            content: "{{$report}}"
          }
        }
      ]
    },
    permissions: ["read_file", "write_file"],
    requiresApproval: false
  };

  return JSON.stringify(workflow, null, 2);
}

function generateTestSuiteWorkflow(): string {
  const workflow = {
    name: "test-suite",
    description: "Generate comprehensive test suite for code file or module",
    arguments: [
      {
        name: "target",
        type: "path",
        required: true,
        description: "Path to source file or directory to test"
      },
      {
        name: "framework",
        type: "string",
        default: "jest",
        description: "Test framework: jest, mocha, pytest, junit, etc."
      },
      {
        name: "output",
        type: "path",
        required: false,
        description: "Output path for test file (auto-generated if not specified)"
      }
    ],
    workflow: {
      steps: [
        {
          name: "read_source",
          tool: "read_file",
          input: "{{target}}",
          output: "{{$source}}"
        },
        {
          name: "analyze_code",
          prompt: "Analyze this code and identify: 1) All exported functions/classes, 2) Dependencies and imports, 3) Edge cases to test, 4) Integration points",
          output: "{{$analysis}}"
        },
        {
          name: "generate_tests",
          prompt: "Generate comprehensive test suite using {{framework}}. Include: unit tests, edge cases, error handling, mocks for dependencies. Use best practices.",
          output: "{{$tests}}"
        },
        {
          name: "create_test_file",
          tool: "write_file",
          input: {
            filePath: "{{output}}",
            content: "{{$tests}}"
          }
        },
        {
          name: "run_tests",
          tool: "run_command",
          input: "npm test {{output}}",
          output: "{{$results}}",
          onError: "continue"
        },
        {
          name: "report_coverage",
          prompt: "Summarize test results. Provide: 1) Pass/fail status, 2) Coverage estimation, 3) Suggestions for additional tests",
          output: "{{$summary}}"
        }
      ]
    },
    permissions: ["read_file", "write_file", "run_command"],
    requiresApproval: true
  };

  return JSON.stringify(workflow, null, 2);
}

function generateRefactorAnalysisWorkflow(): string {
  const workflow = {
    name: "refactor-analysis",
    description: "Analyze code for refactoring opportunities and modernization paths",
    arguments: [
      {
        name: "target",
        type: "path",
        required: true,
        description: "File or directory to analyze for refactoring"
      },
      {
        name: "goal",
        type: "string",
        required: false,
        description: "Refactoring goal: modernize, performance, readability, testability"
      }
    ],
    workflow: {
      steps: [
        {
          name: "read_code",
          tool: "read_file",
          input: "{{target}}",
          output: "{{$code}}"
        },
        {
          name: "complexity_analysis",
          prompt: "Analyze code complexity. Identify: 1) Functions with high cyclomatic complexity, 2) Deep nesting, 3) Long parameter lists, 4) Code smells",
          output: "{{$complexity}}"
        },
        {
          name: "pattern_detection",
          prompt: "Detect outdated patterns and suggest modern alternatives based on goal: {{goal}}. Include: 1) Deprecated APIs, 2) Anti-patterns, 3) Missing design patterns, 4) Framework-specific improvements",
          output: "{{$patterns}}"
        },
        {
          name: "refactoring_plan",
          prompt: "Create detailed refactoring plan. For each suggestion provide: 1) Current code snippet, 2) Proposed refactoring, 3) Benefits, 4) Effort estimate (S/M/L), 5) Risk level",
          output: "{{$plan}}"
        },
        {
          name: "save_plan",
          tool: "write_file",
          input: {
            filePath: "./refactoring-plan-{{timestamp}}.md",
            content: "{{$plan}}"
          }
        }
      ]
    },
    permissions: ["read_file", "write_file"],
    requiresApproval: false
  };

  return JSON.stringify(workflow, null, 2);
}

// Business Domain Workflows

function generateInvoiceBatchWorkflow(): string {
  const workflow = {
    name: "invoice-batch",
    description: "Batch process invoices from PDF/document directory into structured data",
    arguments: [
      { name: "input", type: "path", required: true, description: "Path to directory containing invoice PDFs/documents" },
      { name: "output", type: "path", default: "./invoices-{{timestamp}}.csv", description: "Output CSV file path" }
    ],
    workflow: {
      steps: [
        { name: "find_invoices", tool: "find_files", input: "{{input}}/**/*.{pdf,docx,txt}", output: "{{$invoiceFiles}}" },
        { name: "extract_data", prompt: "Extract key information from each invoice: invoice number, date, vendor, amount. Format as CSV.", output: "{{$csv}}" },
        { name: "save_output", tool: "write_file", input: { filePath: "{{output}}", content: "{{$csv}}" } }
      ]
    },
    permissions: ["read_file", "write_file"],
    requiresApproval: false
  };
  return JSON.stringify(workflow, null, 2);
}

function generateContractReviewWorkflow(): string {
  const workflow = {
    name: "contract-review",
    description: "Analyze contract documents and extract key terms, obligations, and risks",
    arguments: [
      { name: "contract", type: "path", required: true, description: "Path to contract document" },
      { name: "type", type: "string", required: false, description: "Contract type: vendor, employment, lease, NDA" }
    ],
    workflow: {
      steps: [
        { name: "read_contract", tool: "read_file", input: "{{contract}}", output: "{{$text}}" },
        { name: "extract_terms", prompt: "Extract: parties, duration, payment terms, key obligations, termination clauses", output: "{{$terms}}" },
        { name: "risk_assessment", prompt: "Identify risks: unfavorable terms, missing clauses, compliance issues. Rate severity.", output: "{{$risks}}" },
        { name: "generate_summary", prompt: "Create executive summary with terms, obligations, and risk assessment", output: "{{$summary}}" },
        { name: "save_review", tool: "write_file", input: { filePath: "./contract-review-{{timestamp}}.md", content: "{{$summary}}" } }
      ]
    },
    permissions: ["read_file", "write_file"],
    requiresApproval: false
  };
  return JSON.stringify(workflow, null, 2);
}

function generateMeetingSummaryWorkflow(): string {
  const workflow = {
    name: "meeting-summary",
    description: "Process meeting transcripts into structured summaries with action items",
    arguments: [
      { name: "transcript", type: "path", required: true, description: "Path to meeting transcript file" },
      { name: "meeting_type", type: "string", required: false, description: "Meeting type: standup, planning, review, client" }
    ],
    workflow: {
      steps: [
        { name: "read_transcript", tool: "read_file", input: "{{transcript}}", output: "{{$transcript}}" },
        { name: "extract_participants", prompt: "Identify all meeting participants and their roles", output: "{{$participants}}" },
        { name: "extract_decisions", prompt: "List all decisions made: decision, rationale, who decided", output: "{{$decisions}}" },
        { name: "extract_actions", prompt: "Extract action items: task, assignee, deadline, priority", output: "{{$actions}}" },
        { name: "create_summary", prompt: "Generate structured summary: Participants, Decisions, Action Items, Next Steps", output: "{{$summary}}" },
        { name: "save_summary", tool: "write_file", input: { filePath: "./meeting-summary-{{timestamp}}.md", content: "{{$summary}}" } }
      ]
    },
    permissions: ["read_file", "write_file"],
    requiresApproval: false
  };
  return JSON.stringify(workflow, null, 2);
}

// Creative Domain Workflows

function generateContentCalendarWorkflow(): string {
  const workflow = {
    name: "content-calendar",
    description: "Generate 30-day social media content calendar with trending topics and hashtags",
    arguments: [
      { name: "brand", type: "string", required: true, description: "Brand or company name" },
      { name: "industry", type: "string", required: true, description: "Industry or niche" },
      { name: "platforms", type: "string", default: "linkedin,twitter,instagram", description: "Comma-separated platforms" }
    ],
    workflow: {
      steps: [
        { name: "research_trends", tool: "web_search", input: "{{industry}} trending topics 2025", output: "{{$trends}}" },
        { name: "generate_themes", prompt: "Create 4 weekly content themes for {{brand}} in {{industry}}", output: "{{$themes}}" },
        { name: "create_post_ideas", prompt: "Generate 30 post ideas with platform, content type, hashtags", output: "{{$ideas}}" },
        { name: "schedule_calendar", prompt: "Create 30-day content calendar in markdown table format", output: "{{$calendar}}" },
        { name: "save_calendar", tool: "write_file", input: { filePath: "./content-calendar-{{timestamp}}.md", content: "{{$calendar}}" } }
      ]
    },
    permissions: ["write_file", "web_search"],
    requiresApproval: false
  };
  return JSON.stringify(workflow, null, 2);
}

function generateBlogOutlineWorkflow(): string {
  const workflow = {
    name: "blog-outline",
    description: "Research topic and create SEO-optimized blog post outline with keywords",
    arguments: [
      { name: "topic", type: "string", required: true, description: "Blog post topic" },
      { name: "target_audience", type: "string", required: false, description: "Target audience" },
      { name: "word_count", type: "number", default: 1500, description: "Target word count" }
    ],
    workflow: {
      steps: [
        { name: "keyword_research", tool: "web_search", input: "{{topic}} SEO keywords", output: "{{$keywords}}" },
        { name: "research_content", tool: "web_search", input: "{{topic}} comprehensive guide", output: "{{$research}}" },
        { name: "create_outline", prompt: "Create detailed blog outline: headline, intro, 5-7 sections, conclusion. Aim for {{word_count}} words", output: "{{$outline}}" },
        { name: "add_seo", prompt: "Add SEO elements: meta description, keywords, internal links", output: "{{$seoOutline}}" },
        { name: "save_outline", tool: "write_file", input: { filePath: "./blog-outline-{{timestamp}}.md", content: "{{$seoOutline}}" } }
      ]
    },
    permissions: ["write_file", "web_search"],
    requiresApproval: false
  };
  return JSON.stringify(workflow, null, 2);
}

function generateCampaignBriefWorkflow(): string {
  const workflow = {
    name: "campaign-brief",
    description: "Generate multi-channel marketing campaign brief with messaging variations",
    arguments: [
      { name: "product", type: "string", required: true, description: "Product or service name" },
      { name: "goal", type: "string", required: true, description: "Campaign goal: launch, awareness, conversion" },
      { name: "channels", type: "string", default: "email,social,web", description: "Marketing channels" }
    ],
    workflow: {
      steps: [
        { name: "product_analysis", prompt: "Analyze {{product}}: features, benefits, value proposition, target audience", output: "{{$analysis}}" },
        { name: "audience_personas", prompt: "Create 2-3 personas: demographics, pain points, motivations", output: "{{$personas}}" },
        { name: "messaging_strategy", prompt: "Develop messaging for {{goal}}: primary message, talking points, tone", output: "{{$messaging}}" },
        { name: "channel_tactics", prompt: "For {{channels}}, create tactics: content types, messaging, CTAs", output: "{{$tactics}}" },
        { name: "create_brief", prompt: "Compile campaign brief: Summary, Product, Personas, Messaging, Tactics, Metrics", output: "{{$brief}}" },
        { name: "save_brief", tool: "write_file", input: { filePath: "./campaign-brief-{{timestamp}}.md", content: "{{$brief}}" } }
      ]
    },
    permissions: ["write_file"],
    requiresApproval: false
  };
  return JSON.stringify(workflow, null, 2);
}

// Data Domain Workflows

function generateDatasetProfileWorkflow(): string {
  const workflow = {
    name: "dataset-profile",
    description: "Analyze dataset and generate statistical profile with quality assessment",
    arguments: [
      { name: "data", type: "path", required: true, description: "Path to dataset file (CSV, JSON)" },
      { name: "output", type: "path", default: "./dataset-profile-{{timestamp}}.md", description: "Output path" }
    ],
    workflow: {
      steps: [
        { name: "load_data", tool: "read_file", input: "{{data}}", output: "{{$dataset}}" },
        { name: "basic_stats", prompt: "Analyze structure: row/column count, column types", output: "{{$structure}}" },
        { name: "statistical_summary", prompt: "For numeric columns: min, max, mean, median. For categorical: unique values, distribution", output: "{{$stats}}" },
        { name: "quality_check", prompt: "Check: missing values, duplicates, outliers, inconsistencies", output: "{{$quality}}" },
        { name: "generate_report", prompt: "Create profile report: Overview, Stats, Quality, Recommendations", output: "{{$report}}" },
        { name: "save_report", tool: "write_file", input: { filePath: "{{output}}", content: "{{$report}}" } }
      ]
    },
    permissions: ["read_file", "write_file"],
    requiresApproval: false
  };
  return JSON.stringify(workflow, null, 2);
}

function generateChartReportWorkflow(): string {
  const workflow = {
    name: "chart-report",
    description: "Load data and generate visualization report with insights",
    arguments: [
      { name: "data", type: "path", required: true, description: "Path to data file" },
      { name: "focus", type: "string", required: false, description: "Analysis focus: trends, comparison, distribution" }
    ],
    workflow: {
      steps: [
        { name: "load_data", tool: "read_file", input: "{{data}}", output: "{{$dataset}}" },
        { name: "identify_metrics", prompt: "Identify key metrics suitable for visualization. Focus: {{focus}}", output: "{{$metrics}}" },
        { name: "create_visualizations", prompt: "Describe 3-5 visualizations with ASCII charts where possible", output: "{{$charts}}" },
        { name: "analyze_trends", prompt: "Analyze trends, patterns, anomalies. Provide insights", output: "{{$insights}}" },
        { name: "compile_report", prompt: "Generate report: Summary, Visualizations, Analysis, Recommendations", output: "{{$report}}" },
        { name: "save_report", tool: "write_file", input: { filePath: "./chart-report-{{timestamp}}.md", content: "{{$report}}" } }
      ]
    },
    permissions: ["read_file", "write_file"],
    requiresApproval: false
  };
  return JSON.stringify(workflow, null, 2);
}

// MCP Configuration Manager
function generateMcpConfigManager(): string {
  return `import * as fs from 'fs';
import * as path from 'path';

export type MCPServerType = 'stdio' | 'http' | 'sse' | 'sdk';

export interface MCPServerBase {
  type: MCPServerType;
  enabled?: boolean;
  description?: string;
}

export interface MCPStdioServer extends MCPServerBase {
  type: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface MCPHttpServer extends MCPServerBase {
  type: 'http';
  url: string;
  headers?: Record<string, string>;
}

export interface MCPSseServer extends MCPServerBase {
  type: 'sse';
  url: string;
  headers?: Record<string, string>;
}

export interface MCPSdkServer extends MCPServerBase {
  type: 'sdk';
  serverModule: string;
}

export type MCPServerConfig = MCPStdioServer | MCPHttpServer | MCPSseServer | MCPSdkServer;

export interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>;
}

export class MCPConfigManager {
  private configPath: string;
  private config: MCPConfig = { mcpServers: {} };

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(process.cwd(), '.mcp.json');
  }

  async load(): Promise<MCPConfig> {
    try {
      if (fs.existsSync(this.configPath)) {
        const content = fs.readFileSync(this.configPath, 'utf-8');
        this.config = JSON.parse(content);
      }
    } catch (error) {
      console.warn(\`Warning: Could not load MCP config from \${this.configPath}\`);
    }
    return this.config;
  }

  async save(): Promise<void> {
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  getServers(): Record<string, MCPServerConfig> {
    return this.config.mcpServers || {};
  }

  getEnabledServers(): Record<string, MCPServerConfig> {
    const servers: Record<string, MCPServerConfig> = {};
    for (const [name, config] of Object.entries(this.config.mcpServers || {})) {
      if (config.enabled !== false) {
        servers[name] = config;
      }
    }
    return servers;
  }

  async addServer(name: string, config: MCPServerConfig): Promise<void> {
    this.config.mcpServers[name] = { ...config, enabled: true };
    await this.save();
  }

  async removeServer(name: string): Promise<boolean> {
    if (this.config.mcpServers[name]) {
      delete this.config.mcpServers[name];
      await this.save();
      return true;
    }
    return false;
  }

  async toggleServer(name: string, enabled?: boolean): Promise<boolean> {
    if (this.config.mcpServers[name]) {
      const current = this.config.mcpServers[name].enabled !== false;
      this.config.mcpServers[name].enabled = enabled !== undefined ? enabled : !current;
      await this.save();
      return true;
    }
    return false;
  }

  resolveEnvVariables(config: MCPServerConfig): MCPServerConfig {
    const resolved = JSON.parse(JSON.stringify(config));

    const resolveValue = (value: string): string => {
      return value.replace(/\\$\\{([^}]+)\\}/g, (match, varName) => {
        // Support default values: \${VAR:-default}
        const [name, defaultValue] = varName.split(':-');
        return process.env[name] || defaultValue || match;
      });
    };

    const resolveObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return resolveValue(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(resolveObject);
      }
      if (obj && typeof obj === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          result[key] = resolveObject(value);
        }
        return result;
      }
      return obj;
    };

    return resolveObject(resolved);
  }

  formatServerList(): string {
    const servers = this.getServers();
    const entries = Object.entries(servers);

    if (entries.length === 0) {
      return 'No MCP servers configured.';
    }

    return entries.map(([name, config]) => {
      const status = config.enabled !== false ? '●' : '○';
      const statusText = config.enabled !== false ? 'enabled' : 'disabled';
      const typeLabel = config.type.toUpperCase();

      let details = '';
      switch (config.type) {
        case 'stdio':
          details = \`Command: \${config.command}\${config.args?.length ? ' ' + config.args.join(' ') : ''}\`;
          break;
        case 'http':
        case 'sse':
          details = \`URL: \${config.url}\`;
          break;
        case 'sdk':
          details = \`Module: \${config.serverModule}\`;
          break;
      }

      return \`\${status} \${name} (\${typeLabel}) - \${statusText}\\n   \${config.description || ''}\\n   \${details}\`;
    }).join('\\n\\n');
  }
}
`;
}

function generateMcpJson(config: AgentConfig): string {
  const mcpServers: Record<string, any> = {};

  // Convert the configured MCP servers to .mcp.json format
  for (const server of config.mcpServers || []) {
    if (!server.enabled) continue;

    switch (server.transportType) {
      case 'stdio':
        mcpServers[server.name] = {
          type: 'stdio',
          command: (server as any).command || '',
          args: (server as any).args || [],
          env: (server as any).env || {},
          description: server.description || ''
        };
        break;
      case 'http':
        mcpServers[server.name] = {
          type: 'http',
          url: (server as any).url || '',
          headers: (server as any).headers || {},
          description: server.description || ''
        };
        break;
      case 'sse':
        mcpServers[server.name] = {
          type: 'sse',
          url: (server as any).url || '',
          headers: (server as any).headers || {},
          description: server.description || ''
        };
        break;
      case 'sdk':
        mcpServers[server.name] = {
          type: 'sdk',
          serverModule: (server as any).serverModule || '',
          description: server.description || ''
        };
        break;
    }
  }

  return JSON.stringify({ mcpServers }, null, 2);
}

// =============================================================================
// HuggingFace Tiny-Agents Configuration
// =============================================================================

function generateTinyAgentJson(config: AgentConfig): string {
  // Build MCP servers array for tiny-agents format
  const servers: Array<{type: string; command?: string; args?: string[]; url?: string}> = [];

  // Convert configured MCP servers to tiny-agents format
  for (const server of config.mcpServers || []) {
    if (!server.enabled) continue;

    switch (server.transportType) {
      case 'stdio':
        servers.push({
          type: 'stdio',
          command: (server as any).command || '',
          args: (server as any).args || []
        });
        break;
      case 'sse':
        servers.push({
          type: 'sse',
          url: (server as any).url || ''
        });
        break;
      case 'http':
        servers.push({
          type: 'http',
          url: (server as any).url || ''
        });
        break;
    }
  }

  // Build the agent.json structure matching HuggingFace tiny-agents format
  const agentConfig: any = {
    model: config.model || 'Qwen/Qwen2.5-72B-Instruct',
    provider: 'nebius',
    servers
  };

  return JSON.stringify(agentConfig, null, 2);
}

function generateTinyAgentPrompt(config: AgentConfig, template: any): string {
  const enabledTools = config.tools.filter(t => t.enabled);

  return `# ${config.name}

${config.description || template?.documentation || `A specialized AI assistant for ${config.domain}.`}

## Instructions

${config.customInstructions || `You are ${config.name}, an AI assistant specialized in ${config.domain} tasks.

- Provide helpful, accurate, and actionable assistance
- Use your available tools when appropriate
- Be thorough and explain your reasoning
- Always prioritize user safety and best practices`}

## Available Capabilities

${enabledTools.map(tool => `- **${tool.name}**: ${tool.description}`).join('\n')}

## Guidelines

1. When asked to perform tasks, think step-by-step
2. Use available MCP tools to extend your capabilities
3. Be honest about limitations and uncertainties
4. Provide clear, concise responses
5. Ask clarifying questions when requirements are unclear

${template?.samplePrompts ? `
## Example Tasks

${template.samplePrompts.map((p: string) => `- ${p}`).join('\n')}
` : ''}
`;
}

// =============================================================================
// Claude Code Files Generation
// =============================================================================

function generateClaudeCodeFiles(_config: AgentConfig): GeneratedFile[] {
  // Levers (CLAUDE.md, slash commands, hooks, etc.) are configured in the target
  // project where the agent runs, not bundled with the generated agent itself.
  return []
}

// =============================================================================
// Claude Config Loader (Runtime loader for Claude Code files)
// =============================================================================

function generateClaudeConfigLoader(): string {
  return `/**
 * Claude Config Loader
 *
 * Loads Claude Code configuration files at runtime:
 * - CLAUDE.md (project memory/context)
 * - .claude/skills/*.md (model-invoked skills)
 * - .claude/commands/*.md (slash commands)
 * - .claude/agents/*.md (subagents)
 */

import * as fs from 'fs';
import * as path from 'path';

export interface SkillDefinition {
  name: string;
  description: string;
  tools: string[];
  instructions: string;
  filePath: string;
}

export interface CommandDefinition {
  name: string;
  description?: string;
  template: string;
  filePath: string;
}

export interface SubagentDefinition {
  name: string;
  description: string;
  tools: string[];
  model: string;
  permissionMode?: string;
  systemPrompt: string;
  filePath: string;
}

export interface ClaudeConfig {
  memory: string | null;
  skills: SkillDefinition[];
  commands: CommandDefinition[];
  subagents: SubagentDefinition[];
}

/**
 * Parse YAML-like frontmatter from a markdown file
 */
function parseFrontmatter(content: string): { frontmatter: Record<string, string>; body: string } {
  const frontmatterMatch = content.match(/^---\\n([\\s\\S]*?)\\n---\\n([\\s\\S]*)$/);

  if (!frontmatterMatch) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterRaw = frontmatterMatch[1];
  const body = frontmatterMatch[2].trim();
  const frontmatter: Record<string, string> = {};

  for (const line of frontmatterRaw.split('\\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

/**
 * Load all Claude Code configuration from the working directory
 */
export function loadClaudeConfig(workingDir: string = process.cwd()): ClaudeConfig {
  const config: ClaudeConfig = {
    memory: null,
    skills: [],
    commands: [],
    subagents: []
  };

  // 1. Load CLAUDE.md (memory)
  const claudeMdPath = path.join(workingDir, 'CLAUDE.md');
  if (fs.existsSync(claudeMdPath)) {
    try {
      config.memory = fs.readFileSync(claudeMdPath, 'utf-8');
    } catch (e) {
      console.warn('Warning: Could not read CLAUDE.md:', e);
    }
  }

  // 2. Load skills from .claude/skills/*/SKILL.md
  const skillsDir = path.join(workingDir, '.claude', 'skills');
  if (fs.existsSync(skillsDir)) {
    try {
      const skillFolders = fs.readdirSync(skillsDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

      for (const folder of skillFolders) {
        const skillFile = path.join(skillsDir, folder, 'SKILL.md');
        if (fs.existsSync(skillFile)) {
          const content = fs.readFileSync(skillFile, 'utf-8');
          const { frontmatter, body } = parseFrontmatter(content);

          config.skills.push({
            name: frontmatter.name || folder,
            description: frontmatter.description || '',
            tools: frontmatter.tools ? frontmatter.tools.split(',').map(t => t.trim()) : [],
            instructions: body,
            filePath: skillFile
          });
        }
      }
    } catch (e) {
      console.warn('Warning: Could not load skills:', e);
    }
  }

  // 3. Load commands from .claude/commands/*.md
  const commandsDir = path.join(workingDir, '.claude', 'commands');
  if (fs.existsSync(commandsDir)) {
    try {
      const commandFiles = fs.readdirSync(commandsDir)
        .filter(f => f.endsWith('.md'));

      for (const file of commandFiles) {
        const filePath = path.join(commandsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const name = file.replace('.md', '');

        config.commands.push({
          name,
          template: content,
          filePath
        });
      }
    } catch (e) {
      console.warn('Warning: Could not load commands:', e);
    }
  }

  // 4. Load subagents from .claude/agents/*.md
  const agentsDir = path.join(workingDir, '.claude', 'agents');
  if (fs.existsSync(agentsDir)) {
    try {
      const agentFiles = fs.readdirSync(agentsDir)
        .filter(f => f.endsWith('.md'));

      for (const file of agentFiles) {
        const filePath = path.join(agentsDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const { frontmatter, body } = parseFrontmatter(content);
        const name = frontmatter.name || file.replace('.md', '');

        config.subagents.push({
          name,
          description: frontmatter.description || '',
          tools: frontmatter.tools ? frontmatter.tools.split(',').map(t => t.trim()) : [],
          model: frontmatter.model || 'sonnet',
          permissionMode: frontmatter.permissionMode,
          systemPrompt: body,
          filePath
        });
      }
    } catch (e) {
      console.warn('Warning: Could not load subagents:', e);
    }
  }

  return config;
}

/**
 * Format skills as a system prompt section
 */
export function formatSkillsForPrompt(skills: SkillDefinition[]): string {
  if (skills.length === 0) return '';

  let prompt = '\\n\\n## Available Skills\\n\\n';
  prompt += 'You have access to the following specialized skills. When the user\\'s request matches a skill\\'s purpose, you should apply that skill\\'s instructions.\\n\\n';

  for (const skill of skills) {
    prompt += \`### Skill: \${skill.name}\\n\`;
    prompt += \`**When to use:** \${skill.description}\\n\\n\`;
    prompt += \`**Instructions:**\\n\${skill.instructions}\\n\\n\`;
  }

  return prompt;
}

/**
 * Format commands for display/autocomplete
 */
export function formatCommandsForDisplay(commands: CommandDefinition[]): string[] {
  return commands.map(cmd => \`/\${cmd.name}\`);
}

/**
 * Get a specific command by name
 */
export function getCommand(commands: CommandDefinition[], name: string): CommandDefinition | undefined {
  return commands.find(cmd => cmd.name === name || cmd.name === name.replace(/^\\//, ''));
}

/**
 * Expand a command template with arguments
 */
export function expandCommand(command: CommandDefinition, args: string): string {
  let expanded = command.template;

  // Replace $ARGUMENTS with the full args string
  expanded = expanded.replace(/\\$ARGUMENTS/g, args);

  // Replace $1, $2, etc. with positional args
  const argParts = args.split(/\\s+/).filter(Boolean);
  for (let i = 0; i < argParts.length; i++) {
    expanded = expanded.replace(new RegExp(\`\\\\$\${i + 1}\`, 'g'), argParts[i]);
  }

  return expanded;
}
`;
}
