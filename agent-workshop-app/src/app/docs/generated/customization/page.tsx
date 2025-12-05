'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';
import Link from 'next/link';

export default function CustomizationPage() {
  return (
    <DocsLayout
      title="Customization"
      description="How to modify and extend your generated agent."
    >
      <p>
        The generated agent is fully customizable. This guide covers common
        customization scenarios and best practices.
      </p>

      <h2>Modifying Agent Behavior</h2>

      <h3>System Prompt</h3>
      <p>
        The agent&apos;s personality and behavior are defined in <code>src/agent.ts</code>.
        Find the system prompt and modify it:
      </p>
      <CodeBlock
        language="typescript"
        code={`const systemPrompt = \`
You are a helpful AI assistant specialized in...

Your capabilities include:
- Reading and analyzing files
- Searching codebases
- ...

Always:
- Be concise and precise
- Ask for clarification when needed
- Explain your reasoning
\`;`}
      />

      <h3>Memory (CLAUDE.md)</h3>
      <p>
        Add persistent context by editing <code>CLAUDE.md</code>:
      </p>
      <CodeBlock
        language="markdown"
        code={`# Project Context

This agent assists with [your specific use case].

## Important Guidelines

- Always follow [specific convention]
- Never modify files in [restricted directory]
- Prefer [specific approach] when possible`}
      />

      <h2>Adding Custom Tools</h2>

      <h3>Define the Tool</h3>
      <p>
        Add new tools in <code>src/agent.ts</code>:
      </p>
      <CodeBlock
        language="typescript"
        code={`const customTool = {
  name: 'my-custom-tool',
  description: 'Description of what this tool does',
  parameters: {
    type: 'object',
    properties: {
      input: {
        type: 'string',
        description: 'The input to process'
      }
    },
    required: ['input']
  },
  execute: async (params: { input: string }) => {
    // Your implementation here
    const result = await processInput(params.input);
    return { success: true, result };
  }
};`}
      />

      <h3>Register the Tool</h3>
      <p>
        Add your tool to the agent&apos;s tool list:
      </p>
      <CodeBlock
        language="typescript"
        code={`const tools = [
  // ... existing tools
  customTool,
];`}
      />

      <Callout type="tip" title="Tool best practices">
        <p>
          Keep tools focused on a single task. It&apos;s better to have multiple
          specific tools than one tool that does everything.
        </p>
      </Callout>

      <h2>Adding Slash Commands</h2>
      <p>
        Create new commands in <code>.claude/commands/</code>:
      </p>
      <CodeBlock
        language="markdown"
        filename=".claude/commands/my-command.md"
        code={`Perform my custom workflow:

1. First, do this with $1
2. Then, analyze the results
3. Finally, generate a report

Focus on: $ARGUMENTS`}
      />
      <p>
        The command is now available as <code>/my-command</code>.
      </p>

      <h2>Adding Subagents</h2>
      <p>
        Create specialized subagents in <code>.claude/agents/</code>:
      </p>
      <CodeBlock
        language="markdown"
        filename=".claude/agents/my-specialist.md"
        code={`# My Specialist

## Description
Handles [specific type of tasks].

## System Prompt
You are a specialist in [domain]. Your focus is:
- [Specific capability 1]
- [Specific capability 2]

## Tools
- Read
- Write
- Bash

## Model
sonnet`}
      />

      <h2>Modifying Hooks</h2>
      <p>
        Edit <code>.claude/settings.json</code> to add or modify hooks:
      </p>
      <CodeBlock
        language="json"
        code={`{
  "hooks": {
    "PostToolUse": [
      {
        "name": "my-hook",
        "matcher": "Write",
        "command": "echo 'File written: $CLAUDE_FILE_PATH'",
        "timeout": 5000
      }
    ]
  }
}`}
      />

      <h2>Changing Permissions</h2>
      <p>
        Modify <code>src/permissions.ts</code> to customize security:
      </p>
      <CodeBlock
        language="typescript"
        code={`// Add custom path restrictions
const restrictedPaths = [
  '/etc',
  '/usr',
  process.env.HOME + '/.ssh',
  // Add your restrictions
];

// Add custom command filters
const blockedCommands = [
  'rm -rf',
  'sudo',
  // Add blocked patterns
];`}
      />

      <h2>Adding Domain Workflows</h2>
      <p>
        Create workflow definitions in <code>.commands/</code>:
      </p>
      <CodeBlock
        language="json"
        filename=".commands/my-workflow.json"
        code={`{
  "name": "my-workflow",
  "description": "My custom multi-step workflow",
  "steps": [
    {
      "name": "step1",
      "prompt": "First, analyze the input",
      "tools": ["read-file", "search-files"]
    },
    {
      "name": "step2",
      "prompt": "Then, process the analysis",
      "dependsOn": ["step1"]
    },
    {
      "name": "step3",
      "prompt": "Finally, generate output",
      "dependsOn": ["step2"]
    }
  ]
}`}
      />

      <h2>Extending MCP Integration</h2>
      <p>
        Add new MCP servers by editing <code>.mcp.json</code>:
      </p>
      <CodeBlock
        language="json"
        code={`{
  "mcpServers": {
    "existing-server": { ... },
    "new-server": {
      "command": "npx",
      "args": ["-y", "@package/new-server"],
      "env": {
        "API_KEY": "\${NEW_SERVER_API_KEY}"
      }
    }
  }
}`}
      />

      <h2>Customizing the CLI</h2>
      <p>
        Modify <code>src/cli.ts</code> to add new commands or change behavior:
      </p>
      <CodeBlock
        language="typescript"
        code={`// Add a new CLI command
program
  .command('analyze <path>')
  .description('Analyze a file or directory')
  .action(async (path) => {
    // Your implementation
  });

// Add custom input handling
if (input.startsWith('!')) {
  // Handle custom prefix
  await handleCustomCommand(input.slice(1));
}`}
      />

      <h2>Best Practices</h2>

      <h3>Keep Changes Organized</h3>
      <p>
        Document your customizations. Consider adding comments explaining why
        changes were made.
      </p>

      <h3>Test Incrementally</h3>
      <p>
        Test after each significant change. It&apos;s easier to debug one change
        than many.
      </p>

      <h3>Version Control</h3>
      <p>
        Initialize git and commit regularly:
      </p>
      <CodeBlock
        language="bash"
        code={`git init
git add .
git commit -m "Initial generated agent"`}
      />

      <h3>Backup Before Major Changes</h3>
      <p>
        Before significant modifications, create a backup or commit your current state.
      </p>

      <Callout type="info" title="Re-generating">
        <p>
          If you need to re-generate your agent, your customizations will be lost.
          Consider extracting reusable customizations into separate files that you
          can merge back in.
        </p>
      </Callout>
    </DocsLayout>
  );
}
