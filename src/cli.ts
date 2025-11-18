#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { AndroidAgent } from './agent.js';
import { ConfigManager } from './config.js';

const program = new Command();

program
  .name('android-agent')
  .description('🤖 Android Agent - Claude Code for Android Development')
  .version('0.1.0');

// Config command
program
  .command('config')
  .description('Configure the Android Agent')
  .option('--api-key <key>', 'Set Claude API key')
  .option('--show', 'Show current configuration')
  .action(async (options) => {
    const configManager = new ConfigManager();
    await configManager.load();

    if (options.show) {
      const config = configManager.get();
      console.log(chalk.cyan('\n📋 Current Configuration:'));
      console.log(chalk.gray('API Key:'), config.apiKey ? '***' + config.apiKey.slice(-4) : chalk.red('Not set'));
      console.log(chalk.gray('Verbose:'), config.verbose || false);
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
        message: 'Enter your Claude API key:',
        mask: '*'
      }
    ]);

    if (apiKey) {
      await configManager.save({ apiKey });
      console.log(chalk.green('✅ API key saved successfully'));
    }
  });

program
  .argument('[query]', 'Direct query to the Android agent')
  .option('-i, --interactive', 'Start interactive session (default if no query provided)')
  .option('-v, --verbose', 'Verbose output for debugging')
  .action(async (query?: string, options?: { interactive?: boolean; verbose?: boolean }) => {
    try {
      const configManager = new ConfigManager();
      const config = await configManager.load();

      // Check for API key
      if (!configManager.hasApiKey()) {
        console.log(chalk.red('❌ No API key found. Please configure your Claude API key first:'));
        console.log(chalk.yellow('   android-agent config --api-key YOUR_API_KEY'));
        console.log(chalk.gray('   or set environment variable: ANTHROPIC_API_KEY=your_key'));
        process.exit(1);
      }

      const agent = new AndroidAgent({
        verbose: options?.verbose || false,
        apiKey: config.apiKey
      });

      // Welcome message
      console.log(chalk.cyan.bold('\n🤖 Android Agent - Claude Code for Android Development'));
      console.log(chalk.gray('Specialized in Kotlin • Jetpack Compose • DataWedge • Android SDK\n'));

      if (query) {
        // Single query mode
        await handleSingleQuery(agent, query, options?.verbose);
      } else {
        // Interactive mode
        await handleInteractiveMode(agent, options?.verbose);
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

async function handleSingleQuery(agent: AndroidAgent, query: string, verbose?: boolean) {
  const spinner = ora('Thinking...').start();
  
  try {
    spinner.text = 'Processing your Android development query...';
    
    const response = agent.query(query);
    spinner.stop();
    
    console.log(chalk.yellow('Query:'), query);
    console.log(chalk.green('Response:') + '\n');
    
    // Stream the response
    for await (const message of response) {
      if (message.type === 'user') {
        // Skip echoing user messages
        continue;
      } else if (message.type === 'result' && message.subtype === 'success') {
        process.stdout.write(message.result || '');
      } else if (message.type === 'stream_event') {
        // Handle streaming text chunks from the event
        if (message.event?.type === 'content_block_delta' && message.event.delta?.type === 'text_delta') {
          process.stdout.write(message.event.delta.text || '');
        }
      } else if (verbose) {
        console.log(chalk.blue(`\n[${message.type}]`));
      }
    }
    
    console.log('\n');
  } catch (error) {
    spinner.fail('Failed to process query');
    throw error;
  }
}

async function handleInteractiveMode(agent: AndroidAgent, verbose?: boolean) {
  console.log(chalk.gray('Type your Android development questions, or:'));
  console.log(chalk.gray('• /help - Show available commands'));
  console.log(chalk.gray('• /clear - Clear conversation history'));
  console.log(chalk.gray('• /scan - Analyze current Android project'));
  console.log(chalk.gray('• /config - Show configuration'));
  console.log(chalk.gray('• /build - Build the Android project'));
  console.log(chalk.gray('• /files - List Android files in project'));
  console.log(chalk.gray('• /quit or Ctrl+C - Exit\n'));

  while (true) {
    try {
      const { input } = await inquirer.prompt([
        {
          type: 'input',
          name: 'input',
          message: chalk.cyan('android-agent>'),
          prefix: ''
        }
      ]);

      if (!input.trim()) continue;

      // Handle special commands
      if (input.startsWith('/')) {
        const handled = await handleCommand(input, agent, verbose);
        if (handled === 'quit') break;
        continue;
      }

      // Regular query
      const spinner = ora('Thinking...').start();
      
      try {
        const response = agent.query(input);
        spinner.stop();
        
        console.log(); // New line before response
        
        // Stream the response
        for await (const message of response) {
          if (message.type === 'user') {
            // Skip echoing user messages
            continue;
          } else if (message.type === 'result' && message.subtype === 'success') {
            process.stdout.write(message.result || '');
          } else if (message.type === 'stream_event') {
            // Handle streaming text chunks from the event
            if (message.event?.type === 'content_block_delta' && message.event.delta?.type === 'text_delta') {
              process.stdout.write(message.event.delta.text || '');
            }
          } else if (verbose) {
            console.log(chalk.blue(`\n[${message.type}]`));
          }
        }
        
        console.log('\n'); // New line after response
      } catch (error) {
        spinner.fail('Failed to process query');
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('User force closed')) {
        console.log(chalk.yellow('\n\n👋 Goodbye! Happy Android coding!'));
        break;
      }
      console.error(chalk.red('Unexpected error:'), error);
    }
  }
}

async function handleCommand(command: string, agent: AndroidAgent, verbose?: boolean): Promise<string | void> {
  const cmd = command.toLowerCase().trim();
  
  switch (cmd) {
    case '/help':
      console.log(chalk.cyan.bold('\n📚 Android Agent Commands:'));
      console.log(chalk.gray('• /help - Show this help message'));
      console.log(chalk.gray('• /clear - Clear conversation history'));
      console.log(chalk.gray('• /scan - Analyze current Android project structure'));
      console.log(chalk.gray('• /config - Show configuration'));
      console.log(chalk.gray('• /build - Build the Android project'));
      console.log(chalk.gray('• /files - List Android files in project'));
      console.log(chalk.gray('• /quit - Exit the agent'));
      console.log(chalk.gray('\n💡 Ask me anything about Android development!'));
      console.log(chalk.gray('Examples:'));
      console.log(chalk.gray('  - "How do I set up DataWedge barcode scanning?"'));
      console.log(chalk.gray('  - "Create a Jetpack Compose login form"'));
      console.log(chalk.gray('  - "Help me configure Hilt dependency injection"'));
      console.log();
      break;
      
    case '/clear':
      agent.clearHistory();
      console.log(chalk.green('✅ Conversation history cleared\n'));
      break;
      
    case '/scan':
      const spinner = ora('Scanning Android project...').start();
      try {
        const projectInfo = await agent.scanAndroidProject();
        spinner.succeed('Project scan complete');
        console.log(chalk.green('\n📱 Android Project Analysis:'));
        console.log(projectInfo);
        console.log();
      } catch (error) {
        spinner.fail('Failed to scan project');
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      }
      break;
      
    case '/config':
      const configManager = new ConfigManager();
      await configManager.load();
      const config = configManager.get();
      console.log(chalk.cyan('\n📋 Current Configuration:'));
      console.log(chalk.gray('API Key:'), config.apiKey ? '***' + config.apiKey.slice(-4) : chalk.red('Not set'));
      console.log(chalk.gray('Verbose:'), config.verbose || false);
      console.log();
      break;
      
    case '/build':
      const buildSpinner = ora('Building Android project...').start();
      try {
        await agent.buildProject();
        buildSpinner.succeed('Build completed');
      } catch (error) {
        buildSpinner.fail('Build failed');
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      }
      break;
      
    case '/files':
      const filesSpinner = ora('Finding Android files...').start();
      try {
        const files = await agent.findFiles('**/*.{kt,java,xml}');
        filesSpinner.succeed(`Found ${files.length} Android files`);
        console.log(chalk.cyan('\n📁 Android Files:'));
        files.slice(0, 10).forEach(file => console.log(chalk.gray(`  ${file}`)));
        if (files.length > 10) {
          console.log(chalk.gray(`  ... and ${files.length - 10} more files`));
        }
        console.log();
      } catch (error) {
        filesSpinner.fail('Failed to find files');
        console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      }
      break;
      
    case '/quit':
    case '/exit':
      console.log(chalk.yellow('\n👋 Goodbye! Happy Android coding!'));
      return 'quit';
      
    default:
      console.log(chalk.red(`Unknown command: ${command}`));
      console.log(chalk.gray('Type /help to see available commands\n'));
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n\n👋 Goodbye! Happy Android coding!'));
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n\n👋 Goodbye! Happy Android coding!'));
  process.exit(0);
});

program.parse();