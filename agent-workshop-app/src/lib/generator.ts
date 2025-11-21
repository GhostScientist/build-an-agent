import { AgentConfig, GeneratedProject, GeneratedFile, ProjectMetadata } from '@/types/agent'
import { AGENT_TEMPLATES } from '@/types/agent'

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

  const metadata: ProjectMetadata = {
    generatedAt: new Date(),
    templateVersion: '1.0.0',
    agentWorkshopVersion: '0.1.0', 
    dependencies: {
      '@anthropic-ai/claude-agent-sdk': '^0.1.0',
      'commander': '^12.0.0',
      'chalk': '^5.3.0',
      'ora': '^8.0.1',
      'inquirer': '^9.2.12'
    },
    devDependencies: {
      '@types/node': '^20.10.0',
      '@types/inquirer': '^9.0.7',
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
      prepare: 'npm run build'
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
    'inquirer': '^9.2.12'
  }
  
  // Add SDK-specific dependencies
  switch (config.sdkProvider) {
    case 'claude':
      baseDeps['@anthropic-ai/claude-agent-sdk'] = '^0.1.0'
      break
    case 'openai':
      baseDeps['@openai/agents'] = '^0.1.0'
      baseDeps['zod'] = '^3.0.0'
      break
    case 'anthropic-direct':
      baseDeps['@anthropic-ai/sdk'] = '^0.24.0'
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
  
  return baseDeps
}

function generateTsConfig(): string {
  return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
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

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { ${sanitizeClassName(config.name)}Agent } from './agent.js';
import { ConfigManager } from './config.js';
import { PermissionManager } from './permissions.js';

const program = new Command();

program
  .name('${config.projectName}')
  .description('${config.description || config.name + ' - AI Agent'}')
  .version('${config.version || '1.0.0'}');

// Config command
program
  .command('config')
  .description('Configure the agent')
  .option('--api-key <key>', 'Set API key')
  .option('--show', 'Show current configuration')
  .action(async (options) => {
    const configManager = new ConfigManager();
    await configManager.load();

    if (options.show) {
      const config = configManager.get();
      console.log(chalk.cyan('\\n📋 Current Configuration:'));
      console.log(chalk.gray('API Key:'), config.apiKey ? '***' + config.apiKey.slice(-4) : chalk.red('Not set'));
      return;
    }

    if (options.apiKey) {
      await configManager.save({ apiKey: options.apiKey });
      console.log(chalk.green('✅ API key saved successfully'));
      return;
    }

    // Interactive config setup
    const { apiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Enter your API key:',
        mask: '*'
      }
    ]);

    if (apiKey) {
      await configManager.save({ apiKey });
      console.log(chalk.green('✅ API key saved successfully'));
    }
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
        console.log(chalk.red('❌ No API key found. Please configure your API key first:'));
        console.log(chalk.yellow('   ${config.projectName} config --api-key YOUR_API_KEY'));
        process.exit(1);
      }

      const permissionManager = new PermissionManager();
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

async function handleSingleQuery(agent: any, query: string, verbose?: boolean) {
  const spinner = ora('Processing...').start();

  try {
    const response = agent.query(query);
    spinner.stop();

    console.log(chalk.yellow('Query:'), query);
    console.log(chalk.green('Response:') + '\\n');

    for await (const message of response) {
      // Only show streaming deltas, not the final result (which duplicates the stream)
      if (message.type === 'stream_event') {
        if (message.event?.type === 'content_block_delta' && message.event.delta?.type === 'text_delta') {
          process.stdout.write(message.event.delta.text || '');
        }
      } else if (verbose) {
        console.log(chalk.blue(\`\\n[\${message.type}]\`));
      }
    }

    console.log('\\n');
  } catch (error) {
    spinner.fail('Failed to process query');
    throw error;
  }
}

async function handleInteractiveMode(agent: any, verbose?: boolean) {
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
        console.log(chalk.gray('\\n💡 Ask me anything about ${config.domain}!\\n'));
        continue;
      }

      const spinner = ora('Processing...').start();

      try {
        const response = agent.query(input);
        spinner.stop();

        console.log();

        for await (const message of response) {
          // Only show streaming deltas, not the final result (which duplicates the stream)
          if (message.type === 'stream_event') {
            if (message.event?.type === 'content_block_delta' && message.event.delta?.type === 'text_delta') {
              process.stdout.write(message.event.delta.text || '');
            }
          } else if (verbose) {
            console.log(chalk.blue(\`\\n[\${message.type}]\`));
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
  if (hasWeb) {
    imports.push(`import { WebTools } from './tools/web-tools.js';`)
  }

  // Generate the agent class based on SDK provider
  switch (config.sdkProvider) {
    case 'claude':
      return generateClaudeAgent(imports, className, config, enabledTools, template, hasFileOps, hasCommands, hasWeb)
    case 'openai':
      return generateOpenAIAgent(imports, className, config, enabledTools, template, hasFileOps, hasCommands, hasWeb)
    case 'anthropic-direct':
      return generateAnthropicDirectAgent(imports, className, config, enabledTools, template, hasFileOps, hasCommands, hasWeb)
    default:
      throw new Error(`Unsupported SDK provider: ${config.sdkProvider}`)
  }
}

function generateClaudeAgent(imports: string[], className: string, config: AgentConfig, enabledTools: AgentConfig['tools'], template: any, hasFileOps: boolean, hasCommands: boolean, hasWeb: boolean): string {
  return `${imports.join('\n')}
import { PermissionManager } from './permissions.js';

export interface ${className}AgentConfig {
  verbose?: boolean;
  apiKey?: string;
  permissionManager?: PermissionManager;
}

export class ${className}Agent {
  private config: ${className}AgentConfig;
  private permissionManager: PermissionManager;${hasFileOps ? `
  private fileOps: FileOperations;` : ''}${hasCommands ? `
  private commandRunner: CommandRunner;` : ''}${hasWeb ? `
  private webTools: WebTools;` : ''}
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

    this.permissionManager = config.permissionManager || new PermissionManager();${hasFileOps ? `
    this.fileOps = new FileOperations(this.permissionManager);` : ''}${hasCommands ? `
    this.commandRunner = new CommandRunner(this.permissionManager);` : ''}${hasWeb ? `
    this.webTools = new WebTools(this.permissionManager);` : ''}

    // Create SDK MCP server with custom tools
    this.customServer = this.createToolServer();
  }

  async *query(userQuery: string) {
    const systemPrompt = this.buildSystemPrompt();

    const options: any = {
      systemPrompt,
      mcpServers: {
        'custom-tools': this.customServer
      },
      canUseTool: async (toolName: string, input: any) => {
        // Permission check happens in tool execution
        return { behavior: 'allow', updatedInput: input };
      },
      includePartialMessages: true
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
      // Capture session ID from system messages for future queries
      if (message.type === 'system' && (message as any).sessionId) {
        this.sessionId = (message as any).sessionId;
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
    );` : ''}${hasWeb ? `

    // Web tools
    tools.push(
      tool(
        'web_search',
        'Search the web for information',
        {
          query: z.string().describe('Search query')
        },
        async (args) => {
          const results = await this.webTools.search(args.query);
          return {
            content: [{
              type: 'text',
              text: results.join('\\n')
            }]
          };
        }
      )
    );

    tools.push(
      tool(
        'web_fetch',
        'Fetch and analyze a web page',
        {
          url: z.string().describe('URL to fetch')
        },
        async (args) => {
          const content = await this.webTools.fetch(args.url);
          return {
            content: [{
              type: 'text',
              text: content
            }]
          };
        }
      )
    );` : ''}

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
${config.customInstructions || '- Provide helpful, accurate, and actionable assistance\n- Use your available tools when appropriate\n- Be thorough and explain your reasoning'}

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
  }` : ''}
}`
}

function generateOpenAIAgent(imports: string[], className: string, config: AgentConfig, enabledTools: AgentConfig['tools'], template: any, hasFileOps: boolean, hasCommands: boolean, hasWeb: boolean): string {
  return `${imports.join('\n')}
import { z } from 'zod';
import { PermissionManager } from './permissions.js';

export interface ${className}AgentConfig {
  verbose?: boolean;
  apiKey?: string;
  model?: string;
  permissionManager?: PermissionManager;
}

export class ${className}Agent {
  private config: ${className}AgentConfig;
  private agent: Agent;
  private permissionManager: PermissionManager;${hasFileOps ? `
  private fileOps: FileOperations;` : ''}${hasCommands ? `
  private commandRunner: CommandRunner;` : ''}${hasWeb ? `
  private webTools: WebTools;` : ''}

  constructor(config: ${className}AgentConfig = {}) {
    this.config = config;
    this.permissionManager = config.permissionManager || new PermissionManager();

    if (!config.apiKey && !process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is required. Set it via config.apiKey or OPENAI_API_KEY environment variable.');
    }

    // Set API key in environment for OpenAI SDK
    if (config.apiKey) {
      process.env.OPENAI_API_KEY = config.apiKey;
    }${hasFileOps ? `
    this.fileOps = new FileOperations(this.permissionManager);` : ''}${hasCommands ? `
    this.commandRunner = new CommandRunner(this.permissionManager);` : ''}${hasWeb ? `
    this.webTools = new WebTools(this.permissionManager);` : ''}

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
    
    return tools;
  }

  private buildInstructions(): string {
    return \`You are ${config.name}, a specialized AI assistant for ${config.domain}.

${config.specialization || template?.documentation || ''}

## Your Capabilities:
${enabledTools.map(tool => `- **${tool.name}**: ${tool.description}`).join('\n')}

## Instructions:
${config.customInstructions || '- Provide helpful, accurate, and actionable assistance\n- Use your available tools when appropriate\n- Be thorough and explain your reasoning'}

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
  }` : ''}
}`
}

function generateAnthropicDirectAgent(imports: string[], className: string, config: AgentConfig, enabledTools: AgentConfig['tools'], template: any, hasFileOps: boolean, hasCommands: boolean, hasWeb: boolean): string {
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
${config.customInstructions || '- Provide helpful, accurate, and actionable assistance\n- Use your available tools when appropriate\n- Be thorough and explain your reasoning'}

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

export type PermissionAction = 'write_file' | 'run_command' | 'delete_file' | 'modify_file' | 'network_request';

export interface PermissionRequest {
  action: PermissionAction;
  resource: string;
  details?: string;
}

export interface PermissionResponse {
  allowed: boolean;
  remember?: boolean;
}

export class PermissionManager {
  private allowedActions: Set<string> = new Set();
  private deniedActions: Set<string> = new Set();
  private alwaysAllow: Set<PermissionAction> = new Set();
  private alwaysDeny: Set<PermissionAction> = new Set();

  async requestPermission(request: PermissionRequest): Promise<PermissionResponse> {
    const actionKey = \`\${request.action}:\${request.resource}\`;

    // Check if we have a permanent decision for this specific action
    if (this.allowedActions.has(actionKey)) {
      return { allowed: true, remember: true };
    }

    if (this.deniedActions.has(actionKey)) {
      return { allowed: false, remember: true };
    }

    // Check if we always allow/deny this action type
    if (this.alwaysAllow.has(request.action)) {
      return { allowed: true, remember: true };
    }

    if (this.alwaysDeny.has(request.action)) {
      return { allowed: false, remember: true };
    }

    // Ask user for permission
    return await this.promptUser(request, actionKey);
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

  private formatActionName(action: PermissionAction): string {
    switch (action) {
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

  constructor(permissionManager: PermissionManager) {
    this.permissionManager = permissionManager;
  }

  async readFile(filePath: string): Promise<string> {
    try {
      const absolutePath = resolve(filePath)
      return await readFile(absolutePath, 'utf-8')
    } catch (error) {
      throw new Error(\`Failed to read file \${filePath}: \${error instanceof Error ? error.message : String(error)}\`)
    }
  }

  async writeFile(filePath: string, content: string): Promise<void> {
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
      const absolutePath = resolve(filePath)
      await writeFile(absolutePath, content, 'utf-8')
    } catch (error) {
      throw new Error(\`Failed to write file \${filePath}: \${error instanceof Error ? error.message : String(error)}\`)
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      const absolutePath = resolve(filePath)
      await access(absolutePath)
      return true
    } catch {
      return false
    }
  }

  async listFiles(dirPath: string): Promise<string[]> {
    try {
      const absolutePath = resolve(dirPath)
      const entries = await readdir(absolutePath, { withFileTypes: true })
      return entries
        .filter(entry => entry.isFile())
        .map(entry => entry.name)
    } catch (error) {
      throw new Error(\`Failed to list files in \${dirPath}: \${error instanceof Error ? error.message : String(error)}\`)
    }
  }

  async findFiles(pattern: string, cwd: string = process.cwd()): Promise<string[]> {
    try {
      return await glob(pattern, { cwd, absolute: true })
    } catch (error) {
      throw new Error(\`Failed to find files matching \${pattern}: \${error instanceof Error ? error.message : String(error)}\`)
    }
  }

  async getFileStats(filePath: string): Promise<{ size: number; modified: Date; isDirectory: boolean }> {
    try {
      const absolutePath = resolve(filePath)
      const stats = await stat(absolutePath)
      return {
        size: stats.size,
        modified: stats.mtime,
        isDirectory: stats.isDirectory()
      }
    } catch (error) {
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

  async search(query: string): Promise<string[]> {
    // Note: This is a placeholder implementation
    // In a real implementation, you'd integrate with a search API like Google Search API, Bing API, etc.
    console.warn('Search functionality requires API integration - returning placeholder results')
    return [
      \`Search results for: "\${query}"\`,
      'This is a placeholder implementation.',
      'To enable web search, integrate with a search API service.'
    ]
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

Set up your API key:

\`\`\`bash
${config.projectName} config --api-key YOUR_API_KEY
\`\`\`

Or set environment variable:
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