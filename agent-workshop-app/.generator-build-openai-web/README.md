# Researcher Agent

Test researcher agent with knowledge tools

## ⚠️ Security Warning

**IMPORTANT: This agent has the ability to execute code and perform actions on your system.**

This agent is configured with HIGH-RISK tools that can:
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


## Features

- **Read File**: Read contents of any file in the project
- **Write File**: Create new files with specified content
- **Edit File**: Modify existing files with find-and-replace
- **Find Files**: Search for files using glob patterns
- **Search in Files**: Search for text content across multiple files
- **Run Command**: Execute shell commands and scripts
- **Git Operations**: Git commands for version control
- **Web Search**: Search the web for information
- **Web Fetch**: Fetch and analyze web page content
- **Database Query**: Query SQL databases
- **API Client**: Make HTTP requests to external APIs
- **Document Ingestion**: Extract text from PDFs, DOCX, and text files with source capture
- **Table to CSV**: Extract tables from documents into structured CSV/JSON
- **Source Notebook**: Track sources, citations, and summaries in a local notebook
- **Local Retrieval**: Search local notes/corpus for grounded snippets (no remote calls)

### Safety & Audit
- Permission policy: balanced
- Audit log: stored locally at `~/.researcher-agent/audit.log`
- **Workspace sandboxing**: All file operations are restricted to the current working directory

## Prerequisites

- Node.js >= 22.12.0
- npm or yarn
- OpenAI API key

## Installation

### Option 1: Install Globally (Recommended)

Install once, use from any directory:

```bash
# Build and link globally
npm install
./scripts/publish.sh --link

# Or install globally from source
./scripts/publish.sh --global
```

Then use from any project directory:
```bash
cd /path/to/your/project
researcher-agent
```

### Option 2: Local Development

```bash
npm install
npm run build
npm start
```

## Configuration

Create a `.env` file in any directory where you want to use the agent:

```bash
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

Or set the environment variable:
```bash
export OPENAI_API_KEY=your_api_key_here
```

**Note:** When installed globally, the agent loads `.env` from your current working directory.

## Usage

### Interactive Mode
```bash
cd /path/to/your/project  # Agent is sandboxed to this directory
researcher-agent
```

### Single Query
```bash
researcher-agent "Your question here"
```

### Help
```bash
researcher-agent --help
```

### Workspace Security

The agent is **sandboxed** to your current working directory:
- All file operations (read, write, list) are restricted to the current directory
- The agent cannot access files above the directory where you run it
- This allows safe usage across different projects

## Customization

### Modifying the System Prompt

The agent's behavior is controlled by the system prompt in `src/agent.ts`. To customize:

1. Open `src/agent.ts`
2. Find the `buildSystemPrompt()` method (or `buildInstructions()` for OpenAI)
3. Edit the template string to modify:
   - Agent personality and tone
   - Domain-specific knowledge
   - Task priorities and guidelines
   - Tool usage preferences

Example:
```typescript
private buildSystemPrompt(): string {
  return `You are Researcher Agent, a specialized AI assistant.

  YOUR CUSTOM INSTRUCTIONS HERE

  Be helpful and thorough in your responses.`;
}
```

### Local Knowledge Workflow
- Drop PDFs/DOCX/TXT into `./data/sources`
- Use tools `doc_ingest`, `table_extract`, `source_notes`, `local_retrieval`
- See `workflows/literature_review.md` and `data/sample-notes.md` for examples

### Adding Custom Tools

To add new tools:

1. Create a new file in `src/tools/my-custom-tool.ts`
2. Implement your tool class with permission checks
3. Import and initialize it in `src/agent.ts`
4. Rebuild: `npm run build`

**Tip:** Claude Code is excellent at helping you customize your agent! Just ask it to help modify the prompts or add new capabilities.

### Adjusting Permission Settings

Edit `src/permissions.ts` to:
- Change default permission behaviors
- Add/remove permission types
- Customize permission prompt messages
- Implement persistent permission storage

## Publishing

### Quick Start
```bash
chmod +x scripts/publish.sh
./scripts/publish.sh --help    # See all options
```

### Publish Options

| Command | Description |
|---------|-------------|
| `./scripts/publish.sh --link` | Link globally for local development |
| `./scripts/publish.sh --global` | Install globally from source |
| `./scripts/publish.sh --public` | Publish to npmjs.com (public) |
| `./scripts/publish.sh --private` | Publish to private registry |
| `./scripts/publish.sh --dry-run` | Test publish without publishing |
| `./scripts/publish.sh --pack` | Create tarball for distribution |

### Publishing to a Private Registry

1. Copy the template: `cp .npmrc.example .npmrc`
2. Edit `.npmrc` with your registry URL and auth token
3. Run: `./scripts/publish.sh --private`

Supported registries:
- GitHub Packages
- GitLab Packages
- Artifactory
- Verdaccio (self-hosted)
- AWS CodeArtifact

### Scoped Packages

To publish under a scope (e.g., `@mycompany/researcher-agent`):
1. Update `package.json` "name" field
2. Configure scope in `.npmrc`

## Development

```bash
npm run dev    # Watch mode for development
npm run build  # Build TypeScript to JavaScript
npm run start  # Run the built CLI
npm test       # Show help (basic test)
```

## Troubleshooting

### API Key Issues
- Verify your API key is correct
- Check that environment variables are set
- Run `researcher-agent config --show` to verify configuration

### Permission Errors
- Review file/directory permissions
- Ensure the agent has access to required resources
- Check that you're approving permission requests

### Build Errors
- Clear dist folder: `npm run clean`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be ≥22.12.0)

## Generated with Agent Workshop

This agent was generated using [Agent Workshop](https://agent-workshop.dev) - the fastest way to build specialized AI agents.

## License

MIT
