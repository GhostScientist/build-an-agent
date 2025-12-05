# create-agent-app

Create AI agents with the Claude Agent SDK or OpenAI Agents SDK.

## Quick Start

```bash
npx create-agent-app my-agent
cd my-agent
cp .env.example .env  # Add your API key
npm run build
npm start
```

## Interactive Wizard

The CLI guides you through a 6-step process:

1. **Project Name** - Name your agent project
2. **Domain** - Choose your agent's area of expertise
   - Development, Business, Creative, Data, or Knowledge
3. **Template** - Select a pre-configured template or start from scratch
4. **SDK & Model** - Choose Claude (Anthropic) or OpenAI with your preferred model
5. **Tools & Permissions** - Enable capabilities and set security level
6. **Project Details** - Author name and license

## Example

```bash
$ npx create-agent-app

   ╔═══════════════════════════════════════╗
   ║     Agent Workshop CLI               ║
   ║     Build AI agents with Claude/OpenAI║
   ╚═══════════════════════════════════════╝

? What is your project name? › my-agent
? What domain is your agent for? › Development
? Select a template: › Code Review Agent
? Which AI provider? › Claude (Anthropic)
? Select model: › Claude Sonnet 4.5 (recommended)
? Permission level: › Balanced
? Enable tools: › read-file, find-files, search-files, git-operations
? Author name: › Your Name
? License: › MIT

   Creating project files...
✔ Generated 25 files
   Installing dependencies...
✔ Dependencies installed

   ✨ Success! Created my-agent

   Next steps:
   cd my-agent
   cp .env.example .env
   # Add your ANTHROPIC_API_KEY to .env
   npm run build
   npm start

   Want to add MCP servers for extended capabilities?
   → Visit https://agent-workshop.dev/docs/features/mcp-servers
   → Or use the web builder at https://agent-workshop.dev
```

## Generated Project

Your agent project includes:

```
my-agent/
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── src/
│   ├── cli.ts            # Interactive CLI entry point
│   ├── agent.ts          # Core agent implementation
│   ├── config.ts         # Configuration management
│   ├── permissions.ts    # Permission policies
│   ├── planner.ts        # Planning mode support
│   ├── workflows.ts      # Workflow execution
│   ├── mcp-config.ts     # MCP server configuration
│   ├── claude-config.ts  # Claude Code lever support
│   └── tools/            # Tool implementations by category
├── .commands/            # Domain-specific workflows
├── .plans/               # Plan storage directory
├── .mcp.json             # MCP server configuration
├── .env.example          # Environment variable template
├── scripts/publish.sh    # Publishing helper script
├── .gitignore
├── README.md
└── LICENSE
```

## Requirements

- Node.js 18+
- API key from [Anthropic](https://console.anthropic.com/) or [OpenAI](https://platform.openai.com/)

## Domains

| Domain | Description | Example Templates |
|--------|-------------|-------------------|
| Development | Software engineering | Code Review, Test Generation |
| Business | Document processing | Report Generator, Data Entry |
| Creative | Content creation | Blog Writing, Social Media |
| Data | Analysis & ML | Data Analysis, Visualization |
| Knowledge | Research | Research Ops |

## MCP Servers

MCP (Model Context Protocol) servers extend your agent with additional capabilities. Configure them after generation:

- Visit [agent-workshop.dev/docs/features/mcp-servers](https://agent-workshop.dev/docs/features/mcp-servers)
- Or use the web builder at [agent-workshop.dev](https://agent-workshop.dev)

## License

MIT
