# Agent Workshop

Build custom AI agents with the Claude Agent SDK or OpenAI Agents SDK. Choose your approach:

- **[Web UI](./agent-workshop-app)** - Visual builder with live code preview
- **[CLI](./create-agent-app)** - Interactive terminal wizard (`npx build-agent-app`)

## Quick Start

### CLI (Recommended)

```bash
npx build-agent-app my-agent
cd my-agent
cp .env.example .env  # Add your API key
npm run build
npm start
```

### Web UI

```bash
cd agent-workshop-app
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## What You Get

A complete TypeScript agent project with:

- Interactive CLI with streaming responses
- File operations (read, write, search, find)
- Git integration
- Web search capabilities
- MCP server support for extended capabilities
- Planning mode for complex tasks
- Domain-specific workflow commands

## SDK Providers

| Provider | Models | Best For |
|----------|--------|----------|
| **Claude** | Sonnet 4.5, Haiku 4.5, Opus 4.1 | General purpose, code generation |
| **OpenAI** | GPT-5.1, GPT-5 mini, GPT-4.1 | Agents SDK, function calling |

## Domains

Create specialized agents for:

- **Development** - Code review, testing, debugging, modernization
- **Business** - Document processing, reports, data entry
- **Creative** - Content writing, social media, copywriting
- **Data** - Analysis, visualization, ML pipelines
- **Knowledge** - Research, literature review, citations

## Documentation

Full documentation is available in the web UI at `/docs` or see the [agent-workshop-app](./agent-workshop-app) package.

## Requirements

- Node.js 18+
- API key from [Anthropic](https://console.anthropic.com/) or [OpenAI](https://platform.openai.com/)

## License

MIT
