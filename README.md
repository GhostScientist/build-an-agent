# Agent Workshop

Build custom AI agents with the Claude Agent SDK, OpenAI Agents SDK, GitHub Copilot SDK, or HuggingFace tiny-agents. Choose your approach:

- **[Web UI](./agent-workshop-app)** - Visual builder with live code preview
- **[CLI](./create-agent-app)** - Interactive terminal wizard (`npx build-agent-app`) — or run without installing: `npx build-agent-app@latest`

## Quick Start

### CLI (Recommended)

Use a supported Node.js release (22.12+). For Claude, OpenAI, or Copilot TypeScript starters:

```bash
npx build-agent-app@latest my-agent
cd my-agent
cp .env.example .env  # Add your API key (not needed for GitHub Copilot)
npm run build
npm start
```

Copilot still requires a supported login/token with Copilot access. Provider usage limits and charges apply.
For **HuggingFace**, follow the generated instructions instead: configure `HF_TOKEN` or your
inference endpoint and run `npx @huggingface/tiny-agents run .` from the generated directory.
There is no TypeScript build step on that path.

### Web UI

```bash
cd agent-workshop-app
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## What You Get

Claude, OpenAI, and Copilot generate an editable TypeScript starter with:

- Interactive CLI (Claude/Copilot stream output; the OpenAI adapter returns completed responses)
- File operations (read, write, search, find)
- Git integration
- Web search capabilities
- MCP configuration files (runtime connection support varies by provider)
- Planning mode for complex tasks
- Domain-specific workflow commands

HuggingFace generates `agent.json`, `PROMPT.md`, and setup files for tiny-agents instead.
The web app downloads a ZIP; the CLI writes a directory. Neither hosts your agent, supplies
credentials, or guarantees production readiness. Permission checks are not an OS sandbox.
Database/API integrations and automated publishing need additional implementation or MCP servers.

## SDK Providers

| Provider | Example models (not a live catalogue) | Generated offering |
|----------|--------|----------|
| **Claude** | Sonnet 4.5, Haiku 4.5, Opus 4.1 | General purpose, code generation |
| **OpenAI** | GPT-5.1, GPT-5 mini, GPT-4.1 | Agents SDK, function calling |
| **GitHub Copilot** | Auto, Claude Sonnet 4.5, GPT-5, GPT-5.4, GPT-5.2 Codex | Copilot runtime tools; login/token with Copilot access required |
| **HuggingFace** | Qwen 3, Llama 3.3, DeepSeek | Zero-build tiny-agents, open-source models |

Model availability, prices, context limits, and tool support change independently of this
builder. Check the provider documentation linked in the wizard; edit the generated model
configuration to use other models. The catalogue is not a promise that an account can run every model.

## Learn Modern Agent Engineering

Follow the [learning path](https://agent-workshop.dev/docs/concepts#learning-path) from either builder:

1. Define a bounded task and a small set of expected answers; compare against a plain-model baseline.
2. Inspect the generated agent loop, instructions, schemas, and tool handlers.
3. Test denied actions and prompt injection with synthetic data in an isolated workspace.
4. Add one tool or MCP server and test its failure modes.
5. Record correctness, citations, latency, errors, and provider-reported usage.
6. Compare one change at a time before adding workflows or multiple agents.

These are hands-on exercises, not a built-in eval runner, trace viewer, or hosted course.

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

- Node.js 22.12+; check generated `package.json` for the runtime requirement
- An API key from [Anthropic](https://console.anthropic.com/) or [OpenAI](https://platform.openai.com/),
  or an active [GitHub Copilot](https://github.com/features/copilot) subscription
  (sign in once with `npx @github/copilot` — no API key needed)
- For hosted HuggingFace inference, a token and model/provider access; local endpoints and MCP servers may have separate requirements

## License

MIT - Copyright (c) 2025-2026 [Dakota Kim](https://github.com/GhostScientist) / [reasoning.software](https://reasoning.software) (MadWatch LLC). Forks and derivative works should credit the original creator. See [LICENSE](./LICENSE).
