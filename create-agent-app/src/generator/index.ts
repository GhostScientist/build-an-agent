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
  // HuggingFace uses lightweight Hub-ready config (no build step needed)
  if (config.sdkProvider === 'huggingface') {
    await generateTinyAgentProject(targetDir, config);
    return;
  }

  // Claude/OpenAI: Use the full webapp generator
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

// =============================================================================
// HuggingFace Tiny Agents: Lightweight Hub-Ready Project
// =============================================================================
// Generates only the files needed to run with tiny-agents:
// - agent.json (model, provider, MCP servers)
// - PROMPT.md (system prompt)
// - EXAMPLES.md (sample use cases)
// - README.md (how to run & publish)
// - .gitignore

async function generateTinyAgentProject(
  targetDir: string,
  config: AgentConfig
): Promise<void> {
  const agentSlug = config.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Create project directory
  await fs.ensureDir(targetDir);

  await withSpinner('Creating tiny-agent config...', async () => {
    // 1. agent.json
    const servers: Array<{ type: string; command?: string; args?: string[]; url?: string; env?: Record<string, string> }> = [];
    const inputs: Array<{ type: string; id: string; description: string; password?: boolean }> = [];

    // Add any configured MCP servers
    for (const server of config.mcpServers || []) {
      if (!server.enabled) continue;
      const s = server as any;
      if (s.transportType === 'stdio') {
        const serverEntry: any = { type: 'stdio', command: s.command || '', args: s.args || [] };

        // Add env if present
        if (s.env && Object.keys(s.env).length > 0) {
          serverEntry.env = s.env;

          // Check for input references and add to inputs array
          for (const value of Object.values(s.env)) {
            const inputMatch = (value as string).match(/\$\{input:([^}]+)\}/);
            if (inputMatch) {
              const inputId = inputMatch[1];
              if (!inputs.some(i => i.id === inputId)) {
                inputs.push({
                  type: 'promptString',
                  id: inputId,
                  description: getInputDescription(inputId),
                  password: isSecretInput(inputId)
                });
              }
            }
          }
        }

        servers.push(serverEntry);
      } else if (s.transportType === 'sse') {
        servers.push({ type: 'sse', url: s.url || '' });
      } else if (s.transportType === 'http') {
        servers.push({ type: 'http', url: s.url || '' });
      }
    }

    // Build final agent.json
    const agentJson: any = {
      model: config.model || 'Qwen/Qwen3-235B-A22B-Instruct-2507',
      provider: 'auto'
    };

    if (inputs.length > 0) {
      agentJson.inputs = inputs;
    }

    agentJson.servers = servers;

    await fs.writeFile(
      path.join(targetDir, 'agent.json'),
      JSON.stringify(agentJson, null, 2)
    );

    // 2. PROMPT.md
    const promptMd = `# ${config.name}

${config.description || `A specialized AI assistant for ${config.domain} tasks.`}

## Instructions

${config.customInstructions || `You are ${config.name}, an AI assistant specialized in ${config.domain} tasks.

- Provide helpful, accurate, and actionable assistance
- Use your available tools when appropriate
- Be thorough and explain your reasoning
- Always prioritize user safety and best practices`}

## Guidelines

1. When asked to perform tasks, think step-by-step
2. Use available MCP tools to extend your capabilities
3. Be honest about limitations and uncertainties
4. Provide clear, concise responses
5. Ask clarifying questions when requirements are unclear
`;

    await fs.writeFile(path.join(targetDir, 'PROMPT.md'), promptMd);

    // 3. EXAMPLES.md
    const examplesMd = `# ${config.name} - Examples

This file contains example conversations and use cases for the agent.

## Getting Started

**User:** Hello! What can you help me with?

**Assistant:** I'm ${config.name}, specialized in ${config.domain} tasks. I can help you with various tasks using my available tools and capabilities.

---

## Tips for Best Results

1. **Be specific** - The more context you provide, the better the response
2. **Use available tools** - Ask about tasks that leverage the configured MCP servers
3. **Iterate** - Follow up with clarifying questions if needed

## MCP Server Capabilities

${(config.mcpServers || []).filter(s => s.enabled).map(s => `- **${s.name}**: ${s.description || 'Extended capabilities'}`).join('\n') || '- No MCP servers configured yet. Add servers in `agent.json` to extend capabilities.'}
`;

    await fs.writeFile(path.join(targetDir, 'EXAMPLES.md'), examplesMd);

    // 4. README.md
    const readmeMd = `# ${config.name}

${config.description || `A specialized AI assistant for ${config.domain} tasks.`}

## Quick Start

### Prerequisites

- Node.js 18+ installed
- HuggingFace account with API access
- \`HF_TOKEN\` environment variable set

### Run Locally

\`\`\`bash
# Set your HuggingFace token
export HF_TOKEN="hf_your_token_here"

# Run the agent
npx @huggingface/tiny-agents run .
\`\`\`

## Configuration

### Model: \`${config.model || 'Qwen/Qwen3-235B-A22B-Instruct-2507'}\`

The agent uses automatic provider selection to find the best available inference provider.

### MCP Servers

${(config.mcpServers || []).filter(s => s.enabled).length > 0
  ? (config.mcpServers || []).filter(s => s.enabled).map(s => `- **${s.name}**: ${s.description || 'Extended capabilities'}`).join('\n')
  : 'No MCP servers configured. Add servers in `agent.json` to extend capabilities.'}

## Add Your Agent to the Community

You've created a tiny-agent! Here's how to share it with the community on HuggingFace.

### Your Agent Files

Your project contains:
- \`agent.json\` - Your agent configuration (required)
- \`PROMPT.md\` - Your agent's system prompt (required)
- \`EXAMPLES.md\` - Sample conversations (optional but recommended)

### Folder Structure

Your agent will live at:
\`\`\`
tiny-agents/tiny-agents/<your-username>/${agentSlug}/
├── agent.json
├── PROMPT.md
└── EXAMPLES.md (optional)
\`\`\`

### Creating a Pull Request

**Option 1: Web Upload (Easiest)**

1. Go to the dataset: https://huggingface.co/datasets/tiny-agents/tiny-agents
2. Click **"+ Contribute"** (top right) → **"New pull request"**
3. Click **"Upload files"** in the PR interface
4. Upload your agent folder to: \`<your-username>/${agentSlug}/\`
5. Write a PR description explaining what your agent does
6. Submit the PR for review

**Option 2: Git CLI (after creating PR via web)**

After creating a PR via the web interface, you'll see instructions to push files:

\`\`\`bash
# Clone and checkout your PR branch
git clone https://huggingface.co/datasets/tiny-agents/tiny-agents
cd tiny-agents
git fetch origin refs/pr/<PR_NUMBER>:pr-<PR_NUMBER>
git checkout pr-<PR_NUMBER>

# Add your agent files
mkdir -p your-username/${agentSlug}
cp /path/to/your/agent.json your-username/${agentSlug}/
cp /path/to/your/PROMPT.md your-username/${agentSlug}/
cp /path/to/your/EXAMPLES.md your-username/${agentSlug}/  # optional

# Push to your PR (HuggingFace uses refs, not forks)
git add your-username/
git commit -m "Add ${agentSlug} agent"
git push origin HEAD:refs/pr/<PR_NUMBER>
\`\`\`

**Option 3: Create new PR via Git**

\`\`\`bash
# Clone, add files, and create a new PR in one go
git clone https://huggingface.co/datasets/tiny-agents/tiny-agents
cd tiny-agents
mkdir -p your-username/${agentSlug}
# ... add your files ...
git add your-username/
git commit -m "Add ${agentSlug} agent"
git push origin main:refs/pr/new  # Creates a new PR
\`\`\`

### Test Locally First

Before submitting, verify your agent works:

\`\`\`bash
npx @huggingface/tiny-agents run .
\`\`\`

### After Merge

Once merged, anyone can run your agent with:

\`\`\`bash
npx @huggingface/tiny-agents run <your-username>/${agentSlug}
\`\`\`

### Questions?

Check existing agents for examples: https://huggingface.co/datasets/tiny-agents/tiny-agents/tree/main

## Files

| File | Purpose |
|------|---------|
| \`agent.json\` | Model, provider, and MCP server configuration |
| \`PROMPT.md\` | System prompt and personality |
| \`EXAMPLES.md\` | Sample conversations and use cases |
| \`README.md\` | This file |

## Learn More

- [tiny-agents Documentation](https://huggingface.co/docs/huggingface.js/tiny-agents/readme)
- [MCP Servers Directory](https://github.com/modelcontextprotocol/servers)
- [HuggingFace Inference API](https://huggingface.co/docs/api-inference)

---

*Generated with [Agent Workshop CLI](https://github.com/anthropics/build-an-agent)*
`;

    await fs.writeFile(path.join(targetDir, 'README.md'), readmeMd);

    // 5. .gitignore
    const gitignore = `# Environment
.env
.env.local

# OS
.DS_Store
Thumbs.db

# Logs
*.log
`;

    await fs.writeFile(path.join(targetDir, '.gitignore'), gitignore);

  }, 'Generated 5 files (lightweight tiny-agent config)');

  // No npm install needed for tiny-agents!
}

// Helper to get human-readable description for input IDs
function getInputDescription(inputId: string): string {
  const descriptions: Record<string, string> = {
    'github-token': 'GitHub Personal Access Token',
    'brave-api-key': 'Brave Search API Key',
    'database-url': 'PostgreSQL Connection URL',
    'slack-token': 'Slack Bot Token',
    'openai-api-key': 'OpenAI API Key'
  };
  return descriptions[inputId] || `${inputId} value`;
}

// Helper to determine if an input should be treated as a secret
function isSecretInput(inputId: string): boolean {
  const secretPatterns = ['token', 'key', 'secret', 'password', 'credential'];
  return secretPatterns.some(pattern => inputId.toLowerCase().includes(pattern));
}
