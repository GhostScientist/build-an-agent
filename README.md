# Agent Workshop

Build custom AI agents with the Claude Agent SDK, OpenAI Agents SDK, GitHub Copilot SDK, or HuggingFace tiny-agents. Choose your approach:

- **[Web UI](./agent-workshop-app)** - Visual builder with live code preview
- **[CLI](./create-agent-app)** - Interactive terminal wizard (`npx build-agent-app`) — or run without installing: `npx build-agent-app@latest`

## Quick Start

### CLI (Recommended)

```bash
npx build-agent-app@latest my-agent
cd my-agent
cp .env.example .env  # Add your API key (not needed for GitHub Copilot)
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
| **GitHub Copilot** | Auto, Claude Sonnet 4.5, GPT-5, GPT-5.4, GPT-5.2 Codex | No API key — uses your Copilot subscription and built-in runtime tools |
| **HuggingFace** | Qwen 3, Llama 3.3, DeepSeek | Zero-build tiny-agents, open-source models |

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

- Node.js 18+ (20.19+ for GitHub Copilot agents)
- An API key from [Anthropic](https://console.anthropic.com/) or [OpenAI](https://platform.openai.com/),
  or an active [GitHub Copilot](https://github.com/features/copilot) subscription
  (sign in once with `npx @github/copilot` — no API key needed)

## License

MIT - Copyright (c) 2025-2026 [Dakota Kim](https://github.com/GhostScientist) / [reasoning.software](https://reasoning.software) (MadWatch LLC). Forks and derivative works should credit the original creator. See [LICENSE](./LICENSE).
