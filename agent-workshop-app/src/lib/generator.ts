import { AgentConfig, GeneratedProject, GeneratedFile, ProjectMetadata } from '@/types/agent'
import { AGENT_TEMPLATES } from '@/types/agent'

const KNOWLEDGE_TOOL_IDS = ['doc-ingest', 'table-extract', 'source-notes', 'local-rag']

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
  
  // Generate Docker files for containerization
  files.push({
    path: 'Dockerfile',
    content: generateDockerfile(config),
    type: 'dockerfile',
    template: 'Dockerfile'
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

  // Sample data files (local-first)
  files.push({
    path: 'data/sample-notes.md',
    content: sampleNotes(),
    type: 'markdown',
    template: 'data/sample-notes.md'
  })

  files.push({
    path: 'data/sample-table.csv',
    content: sampleTable(),
    type: 'markdown',
    template: 'data/sample-table.csv'
  })

  // Developer scripts
  files.push({
    path: 'scripts/publish.sh',
    content: generatePublishScript(config),
    type: 'shell',
    template: 'scripts/publish.sh'
  })

  files.push({
    path: 'scripts/eval.ts',
    content: generateEvalScript(config),
    type: 'typescript',
    template: 'scripts/eval.ts'
  })

  files.push({
    path: 'src/tools/custom/custom-tool-template.ts',
    content: generateCustomToolTemplate(),
    type: 'typescript',
    template: 'src/tools/custom/custom-tool-template.ts'
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
  const packageData = {
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
      eval: 'ts-node scripts/eval.ts'
    },
    keywords: [
      'ai-agent',
      'claude',
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
    dependencies: getDependencies(config),
    devDependencies: {
      '@types/node': '^20.10.0',
      '@types/inquirer': '^9.0.7',
      '@types/pdf-parse': '^1.1.4',
      'typescript': '^5.3.0',
      'ts-node': '^10.9.2'
    }
  }
  
  return JSON.stringify(packageData, null, 2)
}

function getDependencies(config: AgentConfig): Record<string, string> {
  const baseDeps: Record<string, string> = {
    'commander': '^12.0.0',
    'chalk': '^5.3.0',
    'ora': '^8.0.1',
    'inquirer': '^9.2.12',
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
    case 'anthropic-direct':
      baseDeps['@anthropic-ai/sdk'] = '^0.71.0'
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

  return `#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { ${sanitizeClassName(config.name)}Agent } from './agent.js';
import { ConfigManager } from './config.js';
import { PermissionManager, type PermissionPolicy } from './permissions.js';

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
      console.log(chalk.gray('Source:'), process.env.${config.sdkProvider?.toUpperCase() || 'ANTHROPIC'}_API_KEY ? 'Environment variable' : 'Config file');
      return;
    }

    console.log(chalk.yellow('\\n🔐 API Key Configuration\\n'));
    console.log(chalk.white('To configure your API key, create a .env file in the project root:\\n'));
    console.log(chalk.gray('  echo "${config.sdkProvider?.toUpperCase() || 'ANTHROPIC'}_API_KEY=your-key-here" > .env\\n'));
    console.log(chalk.white('Or set the environment variable directly:\\n'));
    console.log(chalk.gray('  export ${config.sdkProvider?.toUpperCase() || 'ANTHROPIC'}_API_KEY=your-key-here\\n'));
    console.log(chalk.cyan('Tip: Copy .env.example to .env and fill in your API key.'));
  });

program
  .argument('[query]', 'Direct query to the agent')
  .option('-i, --interactive', 'Start interactive session')
  .option('-v, --verbose', 'Verbose output')
  .action(async (query?: string, options?: { interactive?: boolean; verbose?: boolean }) => {
    try {
      const configManager = new ConfigManager();
      const config = await configManager.load();

      if (!configManager.hasApiKey()) {
        console.log(chalk.red('❌ No API key found.'));
        console.log(chalk.yellow('\\nCreate a .env file with your API key:'));
        console.log(chalk.gray('  echo "${config.sdkProvider?.toUpperCase() || 'ANTHROPIC'}_API_KEY=your-key-here" > .env'));
        console.log(chalk.yellow('\\nOr set the environment variable:'));
        console.log(chalk.gray('  export ${config.sdkProvider?.toUpperCase() || 'ANTHROPIC'}_API_KEY=your-key-here'));
        process.exit(1);
      }

      const permissionManager = new PermissionManager({ policy: '${config.permissions || 'balanced'}' });
      const agent = new ${sanitizeClassName(config.name)}Agent({
        verbose: options?.verbose || false,
        apiKey: config.apiKey,
        permissionManager
      });

      console.log(chalk.cyan.bold('\\n🤖 ${config.name}'));
      console.log(chalk.gray('${config.description || 'AI Agent for ' + config.domain}\\n'));

      if (query) {
        await handleSingleQuery(agent, query, options?.verbose);
      } else {
        await handleInteractiveMode(agent, options?.verbose);
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

async function handleSingleQuery(agent: any, query: string, verbose?: boolean) {
  const spinner = ora('Processing...').start();

  try {
    const response = agent.query(query);
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

async function handleInteractiveMode(agent: any, verbose?: boolean) {
  // Load workflow executor
  const { WorkflowExecutor } = await import('./workflows.js');
  const workflowExecutor = new WorkflowExecutor(agent.permissionManager);

  console.log(chalk.gray('Type your questions, or:'));
  console.log(chalk.gray('• /help - Show available commands'));
  console.log(chalk.gray('• /quit or Ctrl+C - Exit\\n'));

  while (true) {
    try {
      const { input } = await inquirer.prompt([
        {
          type: 'input',
          name: 'input',
          message: chalk.cyan('${config.projectName}>'),
          prefix: ''
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
        console.log(chalk.gray('  Generate visualization report with insights'));` : ''}
        console.log(chalk.gray('\\n💡 Ask me anything about ${config.domain}!\\n'));
        continue;
      }

      // Handle workflow commands
      if (input.startsWith('/')) {
        const { command, args, error} = parseSlashCommand(input);

        if (error) {
          console.log(chalk.red(\`Error: \${error}\`));
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

process.on('SIGINT', () => {
  console.log(chalk.yellow('\\n\\n👋 Goodbye!'));
  process.exit(0);
});

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
    case 'anthropic-direct':
      imports.push(`import Anthropic from '@anthropic-ai/sdk';`)
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
    case 'anthropic-direct':
      return generateAnthropicDirectAgent(imports, className, config, enabledTools, template, hasFileOps, hasCommands, hasWeb, hasKnowledge)
    default:
      throw new Error(`Unsupported SDK provider: ${config.sdkProvider}`)
  }
}

function generateClaudeAgent(imports: string[], className: string, config: AgentConfig, enabledTools: AgentConfig['tools'], template: any, hasFileOps: boolean, hasCommands: boolean, hasWeb: boolean, hasKnowledge: boolean): string {
  return `${imports.join('\n')}
import { PermissionManager, type PermissionPolicy } from './permissions.js';

export interface ${className}AgentConfig {
  verbose?: boolean;
  apiKey?: string;
  permissionManager?: PermissionManager;
  permissions?: PermissionPolicy;
  auditPath?: string;
}

export class ${className}Agent {
  private config: ${className}AgentConfig;
  private permissionManager: PermissionManager;${hasFileOps ? `
  private fileOps: FileOperations;` : ''}${hasCommands ? `
  private commandRunner: CommandRunner;` : ''}${hasKnowledge ? `
  private knowledgeTools: KnowledgeTools;` : ''}
  private customServer: ReturnType<typeof createSdkMcpServer>;
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
  }

  async *query(userQuery: string) {
    const systemPrompt = this.buildSystemPrompt();

    const options: any = {
      model: '${config.model || 'claude-sonnet-4-5-20250929'}',
      cwd: process.cwd(),
      systemPrompt,
      mcpServers: {
        'custom-tools': this.customServer
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

    const queryResult = query({
      prompt: userQuery,
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
            return { content: [{ type: 'text', text: result.summary }] };
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
    return \`You are ${config.name}, a specialized AI assistant for ${config.domain}.

${config.specialization || template?.documentation || ''}

## Your Capabilities:
${enabledTools.map(tool => `- **${tool.name}**: ${tool.description}`).join('\n')}

## Instructions:
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
import { PermissionManager } from './permissions.js';

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

  async *query(userQuery: string) {
    try {
      // Show thinking progress while waiting for OpenAI response
      let thinkingDots = 1;
      let isComplete = false;
      
      // Start the API call
      const resultPromise = run(this.agent, userQuery);
      
      // Show thinking animation every 500ms until response arrives
      const thinkingInterval = setInterval(() => {
        if (!isComplete) {
          const dots = '.'.repeat(thinkingDots);
          // Note: This won't show in generator but CLI can handle thinking events
          thinkingDots = (thinkingDots % 4) + 1; // Cycle 1->2->3->4->1
        }
      }, 500);

      // Periodically yield thinking updates
      const startTime = Date.now();
      while (!isComplete) {
        const elapsed = Date.now() - startTime;
        
        // Check if the API call is done
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 500));
        const raceResult = await Promise.race([
          resultPromise.then(result => ({ type: 'completed', result })),
          timeoutPromise.then(() => ({ type: 'thinking' }))
        ]);
        
        if (raceResult.type === 'completed') {
          isComplete = true;
          clearInterval(thinkingInterval);
          
          // Return the final result
          yield {
            type: 'result',
            subtype: 'success',
            result: (raceResult as any).result.finalOutput || 'No response generated.'
          };
          break;
        } else {
          // Show thinking progress
          const dots = '.'.repeat(thinkingDots);
          yield {
            type: 'stream_event',
            event: {
              type: 'content_block_delta', 
              delta: {
                type: 'text_delta',
                text: elapsed < 1000 ? \`thinking\${dots}\` : \`\\rthinking\${dots}\`
              }
            }
          };
          thinkingDots = (thinkingDots % 4) + 1;
        }
      }
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
            captureSources: z.boolean().optional()
          }),
          execute: async ({ filePath, captureSources = true }: { filePath: string; captureSources?: boolean }) => {
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
            return result.summary;
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
            limit: z.number().optional()
          }),
          execute: async ({ query, limit = 5 }: { query: string; limit?: number }) => {
            return await this.knowledgeTools.searchLocal(query, limit);
          }
        })
      );
    }` : ''}
    
    return tools;
  }

  private buildInstructions(): string {
    return \`You are ${config.name}, a specialized AI assistant for ${config.domain}.

${config.specialization || template?.documentation || ''}

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

function generateAnthropicDirectAgent(imports: string[], className: string, config: AgentConfig, enabledTools: AgentConfig['tools'], template: any, hasFileOps: boolean, hasCommands: boolean, hasWeb: boolean, hasKnowledge: boolean): string {
  return `${imports.join('\n')}

export interface ${className}AgentConfig {
  verbose?: boolean;
  apiKey?: string;
  model?: string;
}

export class ${className}Agent {
  private config: ${className}AgentConfig;
  private anthropic: Anthropic;
  private conversationHistory: string[] = [];${hasFileOps ? `
  private fileOps: FileOperations;` : ''}${hasCommands ? `
  private commandRunner: CommandRunner;` : ''}${hasWeb ? `
  private webTools: WebTools;` : ''}

  constructor(config: ${className}AgentConfig = {}) {
    this.config = config;
    
    if (!config.apiKey) {
      throw new Error('Anthropic API key is required. Set it via config.apiKey or ANTHROPIC_API_KEY environment variable.');
    }
    
    this.anthropic = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY
    });${hasFileOps ? `
    this.fileOps = new FileOperations();` : ''}${hasCommands ? `
    this.commandRunner = new CommandRunner();` : ''}${hasWeb ? `
    this.webTools = new WebTools();` : ''}
  }

  async query(userQuery: string): Promise<string> {
    this.conversationHistory.push(\`User: \${userQuery}\`);

    const systemPrompt = this.buildSystemPrompt();
    const fullPrompt = \`\${systemPrompt}\\n\\nConversation History:\\n\${this.conversationHistory.join('\\n')}\\n\\nCurrent Query: \${userQuery}\`;
    
    try {
      const response = await this.anthropic.messages.create({
        model: this.config.model || '${config.model}',
        max_tokens: ${config.maxTokens || 4096},
        messages: [{
          role: 'user',
          content: fullPrompt
        }]
      });

      const responseText = response.content[0]?.type === 'text' ? response.content[0].text : 'No response generated.';
      this.conversationHistory.push(\`Assistant: \${responseText}\`);
      
      return responseText;
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw new Error(\`Failed to generate response: \${error instanceof Error ? error.message : String(error)}\`);
    }
  }

  private buildSystemPrompt(): string {
    return \`You are ${config.name}, a specialized AI assistant for ${config.domain}.

${config.specialization || template?.documentation || ''}

## Your Capabilities:
${enabledTools.map(tool => `- **${tool.name}**: ${tool.description}`).join('\n')}

## Instructions:
${config.customInstructions || '- Provide helpful, accurate, and actionable assistance\n- Use your available tools when appropriate\n- Be thorough and explain your reasoning'}${hasKnowledge ? '\n- Track and cite sources when summarizing. Keep responses grounded in retrieved text.' : ''}

Always be helpful, accurate, and focused on ${config.domain} tasks.\`;
  }

  clearHistory(): void {
    this.conversationHistory = [];
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
    if (process.env.${config.sdkProvider?.toUpperCase()}_API_KEY) {
      this.config.apiKey = process.env.${config.sdkProvider?.toUpperCase()}_API_KEY;
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
    content: `import { readFile, writeFile, mkdir } from 'fs/promises'
import { resolve, dirname, extname } from 'path'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'
import { PermissionManager } from '../permissions.js'

type ExtractResult = { text: string; source: string }

export class KnowledgeTools {
  private permissionManager: PermissionManager
  private notesPath: string

  constructor(permissionManager: PermissionManager, notesPath = resolve(process.cwd(), 'data', 'notes.md')) {
    this.permissionManager = permissionManager
    this.notesPath = notesPath
  }

  async extractText(filePath: string, captureSources = true): Promise<ExtractResult> {
    const absolutePath = resolve(filePath)
    await this.ensureReadable(absolutePath)
    const ext = extname(absolutePath).toLowerCase()

    let text = ''
    if (ext === '.pdf') {
      const data = await pdf(await readFile(absolutePath))
      text = data.text
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: absolutePath })
      text = result.value
    } else {
      text = await readFile(absolutePath, 'utf-8')
    }

    const source = captureSources ? absolutePath : ''
    return { text, source }
  }

  async extractTables(filePath: string): Promise<{ summary: string }> {
    const { text, source } = await this.extractText(filePath, true)
    // naive table detection: lines with commas or tabs
    const tableLines = text.split('\\n').filter(line => line.includes(',') || line.includes('\\t'))
    const summary = [
      'Table-like content (preview):',
      tableLines.slice(0, 10).join('\\n'),
      source ? '\\nSource: ' + source : ''
    ].join('\\n')
    return { summary }
  }

  async saveNote(title: string, source: string, content: string): Promise<string> {
    await this.permissionManager.requestPermission({
      action: 'write_file',
      resource: this.notesPath,
      details: 'Appending to local notes'
    })
    await mkdir(dirname(this.notesPath), { recursive: true })
    const entry = [
      '\\n## ' + title,
      'Source: ' + source,
      '',
      content,
      ''
    ].join('\\n')
    await writeFile(this.notesPath, entry, { flag: 'a' })
    return 'Saved note to ' + this.notesPath
  }

  async searchLocal(query: string, limit = 5): Promise<string> {
    const { text } = await this.extractText(this.notesPath, false).catch(() => ({ text: '' }))
    const lines = text.split('\\n').filter(Boolean)
    const matches = lines.filter(line => line.toLowerCase().includes(query.toLowerCase())).slice(0, limit)
    if (matches.length === 0) {
      return 'No matches found in local notes.'
    }
    return ['Matches:', ...matches].join('\\n')
  }

  private async ensureReadable(path: string) {
    await this.permissionManager.requestPermission({
      action: 'read_file',
      resource: path,
      details: 'Reading document for analysis'
    })
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
- Default workspace data: \`./data\` and \`./workflows\`

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- ${config.sdkProvider === 'claude' ? 'Anthropic API key' : config.sdkProvider === 'openai' ? 'OpenAI API key' : 'API key'}

## Installation

\`\`\`bash
npm install
npm run build
\`\`\`

## Configuration

Set up your API key by creating a \`.env\` file:

\`\`\`bash
cp .env.example .env
# Edit .env and add your API key
\`\`\`

Or set the environment variable directly:
\`\`\`bash
export ${config.sdkProvider?.toUpperCase()}_API_KEY=your_api_key_here
\`\`\`

## Usage

### Interactive Mode
\`\`\`bash
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

## Evals

Run lightweight evals (requires API key):
\`\`\`bash
npm run eval   # via scripts/eval.ts
\`\`\`

## Publish locally to npm
\`\`\`bash
chmod +x scripts/publish.sh
./scripts/publish.sh
\`\`\`

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

function generateDockerfile(config: AgentConfig): string {
  return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

EXPOSE 3000

CMD ["node", "dist/cli.js"]`
}

function generateEnvExample(config: AgentConfig): string {
  return `# API Configuration
${config.sdkProvider?.toUpperCase()}_API_KEY=your_api_key_here

# Agent Settings
VERBOSE=false
LOG_LEVEL=info

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
`
}

function generatePublishScript(config: AgentConfig): string {
  return `#!/usr/bin/env bash
set -euo pipefail

# Build and publish your agent locally to npm
echo "🔧 Building ${config.projectName}..."
npm install
npm run build

echo "📦 Preparing npm metadata..."
npm pack

echo "🚀 To publish, run:"
echo "npm publish --access public"
echo
echo "✅ Consumers can install globally with:"
echo "npm install -g ${config.projectName}"
`
}

function generateEvalScript(config: AgentConfig): string {
  return `#!/usr/bin/env ts-node
import { ${sanitizeClassName(config.name)}Agent } from '../src/agent'
import { PermissionManager } from '../src/permissions'
import path from 'path'
import fs from 'fs'

async function main() {
  const apiKey = process.env.${config.sdkProvider?.toUpperCase()}_API_KEY
  if (!apiKey) {
    console.error('Set ${config.sdkProvider?.toUpperCase()}_API_KEY before running evals')
    process.exit(1)
  }

  const agent = new ${sanitizeClassName(config.name)}Agent({
    apiKey,
    permissionManager: new PermissionManager({ policy: 'restrictive' })
  })

  const tasks = [
    { name: 'smoke-help', prompt: 'Summarize your capabilities in one paragraph.' },
    { name: 'read-sample-note', prompt: 'Summarize the key insights from data/sample-notes.md and cite the source.' }
  ]

  fs.mkdirSync('eval-results', { recursive: true })

  for (const task of tasks) {
    console.log('\\n=== Running', task.name, '===')
    const response = agent.query(task.prompt)
    let output = ''
    for await (const message of response) {
      if (message.type === 'stream_event' && message.event?.type === 'content_block_delta' && message.event.delta?.type === 'text_delta') {
        process.stdout.write(message.event.delta.text || '')
        output += message.event.delta.text || ''
      }
    }
    fs.writeFileSync(path.join('eval-results', task.name + '.txt'), output, { encoding: 'utf-8', flag: 'w' })
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
`
}

function sampleNotes(): string {
  return `## Sample Note
Source: data/sample-notes.md

- Retrieval-augmented generation combines a retriever and generator to ground responses.
- Citations matter: always include the source path or URL.
`
}

function sampleTable(): string {
  return `name,category,score
alpha,baseline,0.61
beta,improved,0.74
gamma,experimental,0.52
`
}

function generateCustomToolTemplate(): string {
  return `// Example custom tool. Copy/rename this file and wire it into src/agent.ts
import { PermissionManager } from '../../permissions'

export class CustomToolTemplate {
  constructor(private permissions: PermissionManager) {}

  async doSomething(input: string): Promise<string> {
    await this.permissions.requestPermission({
      action: 'network_request',
      resource: 'https://example.com',
      details: 'Example custom tool call'
    })
    // TODO: implement your logic here
    return \`You sent: \${input}\`
  }
}
`
}

function generateWorkflowExecutor(config: AgentConfig): string {
  return `import { readFileSync } from 'fs';
import { glob } from 'glob';
import chalk from 'chalk';
import ora from 'ora';
import type { PermissionManager } from './permissions.js';

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
    try {
      const content = readFileSync(\`.commands/\${commandName}.json\`, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(\`Failed to load workflow: \${commandName}\`);
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
