# CLAUDE.md

Guidance for AI assistants (Claude Code and others) working in this repository.

## Project Overview

**Agent Workshop** scaffolds custom AI agent projects targeting one of three providers: the **Claude Agent SDK**, the **OpenAI Agents SDK**, or **HuggingFace tiny-agents**. It ships two user-facing products in an npm-workspaces monorepo:

- **`agent-workshop-app/`** — a Next.js 14 web UI (visual wizard with live Monaco code preview, downloads a zip). Deployed to Netlify as a static export.
- **`create-agent-app/`** — an interactive CLI wizard, published to npm as **`build-agent-app`** (`npx build-agent-app@latest my-agent`).

Generated agents are configured by **domain** (development, business, creative, data, knowledge), **provider**, tools, permission level, and MCP servers.

## Repository Layout

```
package.json              # Root: private, npm workspaces (agent-workshop-app, create-agent-app), no scripts
netlify.toml              # Netlify deploy (base=agent-workshop-app, publish=out, Node 18)
.devcontainer/            # Node 20 devcontainer, postCreate=npm install, port 3000
src/tools/                # Legacy/reference code (file-operations.ts) — not part of either workspace build

create-agent-app/         # CLI package ("build-agent-app")
├── bin/create-agent-app.js   # Executable entry → dist/index.js
└── src/
    ├── index.ts          # commander program + Enquirer wizard flow
    ├── types.ts          # AgentConfig, SDKProvider, MCPServer... (mirrors web app types)
    ├── generator/        # index.ts (orchestrator), webapp-generator.ts (~6.2k lines, codegen)
    ├── data/             # models.ts, domains.ts, tools.ts, agent-templates.ts, mcp-templates.ts
    ├── prompts/          # Wizard steps (project, domain, template, sdk, tools, huggingface)
    └── utils/            # styles.ts, spinner.ts, validation.ts

agent-workshop-app/       # Next.js 14 web UI (App Router, static export)
├── src/
│   ├── app/              # layout.tsx, page.tsx, docs/ (large docs tree rendered as pages)
│   ├── components/       # wizard/AgentBuilder.tsx + wizard/steps/, docs/, preview/
│   ├── lib/              # generator.ts (~6.6k lines, codegen core), store.ts (zustand)
│   ├── data/             # mcp-templates.ts
│   └── types/agent.ts    # Shared type model
├── e2e/                  # Playwright specs (wizard.spec.ts, example.spec.ts)
└── scripts/              # generator-smoke.ts, generator-matrix.ts, test-build.ts,
                          # generate-all-agents.ts, test-agents/ (custom agent test harness)
```

## Commands

Node **>= 18** required. Install once at the repo root (hydrates both workspaces):

```bash
npm install
```

### Web app (`cd agent-workshop-app`)

```bash
npm run dev                  # Dev server at http://localhost:3000
npm run build                # Static export to out/ (output: 'export')
npm run lint                 # next lint (eslint-config-next)
npm run type-check           # tsc --noEmit
npm run test:e2e             # Playwright (chromium; auto-starts the dev server)
npm run test:generator       # Generator smoke test (tsx)
npm run test:generator:all   # Full generator matrix
npm run test:generator:build # Generated projects compile/build
npm run test:agents          # Behavioral tests of generated agents — needs live API keys
npm run test:agents:claude   # (also :openai, :quick variants)
npm run generate:agents      # Generate all agent variants (also :claude / :openai)
```

### CLI (`cd create-agent-app`)

```bash
npm run build   # tsc → dist/
npm run dev     # tsc --watch
npm start       # node dist/index.js (run the wizard locally)
```

There is no root-level test or build script; run commands inside the relevant workspace.

## Architecture

**CLI flow:** `create-agent-app/src/index.ts` defines the `build-agent-app [project-name]` commander program and runs an Enquirer wizard (provider → domain → template → model → tools/permissions, or a shorter 3-step HuggingFace path). It assembles an `AgentConfig` and calls `generateProject()` in `src/generator/index.ts`, which delegates to `webapp-generator.ts` (Claude/OpenAI) or `generateTinyAgentProject` (HuggingFace), writes the files, and runs `npm install` in the target.

**Web flow:** `components/wizard/AgentBuilder.tsx` steps through the same choices, holding state in the zustand store (`src/lib/store.ts`, typed by `src/types/agent.ts`). `src/lib/generator.ts` produces the files, previewed in Monaco and downloaded via JSZip/file-saver.

**Shared type model** (both packages): `AgentDomain` (development | business | creative | data | knowledge), `SDKProvider` (claude | openai | huggingface), `PermissionLevel` (restrictive | balanced | permissive), `AgentTool`, `MCPServer` (stdio | http | sse | sdk), `AgentConfig`, `GeneratedProject`/`GeneratedFile`.

## ⚠ Critical Convention: Duplicated Generators

The code-generation engine exists **twice** and must be kept in sync:

| Web app (canonical) | CLI (mirror) |
|---|---|
| `agent-workshop-app/src/lib/generator.ts` | `create-agent-app/src/generator/webapp-generator.ts` |
| `agent-workshop-app/src/types/agent.ts` | `create-agent-app/src/types.ts` |

When changing agent-generation logic or the type model, apply the change to **both** files. `create-agent-app/src/types.ts` explicitly documents this mirroring.

## Conventions

- **Strict TypeScript** everywhere; ESM in the CLI with `module: NodeNext` — relative imports in CLI `.ts` source carry `.js` extensions (e.g. `import ... from './utils/styles.js'`). Keep that pattern.
- **Naming:** kebab-case for data/util/script filenames (`agent-templates.ts`), PascalCase for React components (`AgentBuilder.tsx`), `prompt*` prefix for wizard-step functions, `generate*` prefix for codegen functions.
- **Error handling:** wrap and rethrow with descriptive messages; narrow unknowns with `error instanceof Error ? error.message : String(error)`.
- **Web app stack:** Tailwind CSS (forms + typography plugins), zustand for wizard state, zod for validation, framer-motion, react-hot-toast. Path alias `@/` → `src/`.
- **Static export:** `next.config.js` sets `output: 'export'` (dist `out/`), `images.unoptimized`, and webpack fallbacks disabling `fs`/`path`/`crypto` for Monaco — no server runtime, so no API routes or server actions.

## Testing

There is **no unit-test framework** (no Jest/Vitest). Testing is:

1. **Playwright e2e** (`agent-workshop-app/e2e/`) — chromium only, `baseURL http://localhost:3000`, dev server auto-started by `playwright.config.ts`.
2. **Generator scripts** (`scripts/generator-*.ts`, `scripts/test-build.ts`) — smoke/matrix/build checks run with `tsx`, no API keys needed.
3. **Agent behavioral harness** (`scripts/test-agents/`) — generates real agents and runs them against JSON fixtures (`fixtures/`), producing HTML reports in `scripts/test-agents/reports/`. **Requires live API keys.**

`npm run type-check` and `npm run lint` in `agent-workshop-app/`, plus `npm run build` in `create-agent-app/`, are the cheap correctness checks — run them after changes.

## Environment Variables

No `.env` files are committed (`.env*` is gitignored). Keys are only needed for agent behavioral tests and for running generated agents:

- `ANTHROPIC_API_KEY` — Claude agents
- `OPENAI_API_KEY` — OpenAI agents
- `HF_TOKEN` (fallback `HUGGINGFACE_TOKEN`) — HuggingFace tiny-agents

Generated projects include their own `.env.example`.

## CI / Deployment

- **No GitHub Actions** — there is no `.github/` directory. Validate changes locally with the commands above.
- **Netlify** deploys the web app (`netlify.toml`: build `npm run build`, publish `out/`, Node 18).
- Default branch is `master`; development happens via pull requests into it.
- The CLI is published to npm as `build-agent-app` (`prepublishOnly` runs the build); bump its `version` in `create-agent-app/package.json` when releasing.
