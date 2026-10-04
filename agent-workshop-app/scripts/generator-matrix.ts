import { generateAgentProject } from '../src/lib/generator'
import { AGENT_TEMPLATES, AVAILABLE_TOOLS, type AgentConfig, type SDKProvider } from '../src/types/agent'

const KNOWLEDGE_TOOL_IDS = new Set(['doc-ingest', 'table-extract', 'source-notes', 'local-rag'])

// Providers that produce a full TypeScript project (HuggingFace has its own lightweight path)
const FULL_PROJECT_PROVIDERS: SDKProvider[] = ['claude', 'openai', 'copilot']
const SDK_DEPENDENCIES = {
  claude: ['@anthropic-ai/claude-agent-sdk', '^0.3.289'],
  openai: ['@openai/agents', '^0.18.0'],
  copilot: ['@github/copilot-sdk', '^1.0.16'],
} as const

const MODEL_BY_PROVIDER: Record<SDKProvider, string> = {
  claude: 'claude-sonnet-4.5-20250929',
  openai: 'gpt-5.1',
  copilot: 'auto',
  huggingface: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
}

// Copilot delegates file/command/web work to the runtime's built-in tools, so it
// must not emit the wrapper tool implementations the other providers generate.
const WRAPPER_TOOL_FILES = ['src/tools/file-operations.ts', 'src/tools/command-runner.ts', 'src/tools/web-tools.ts']

function sanitizeName(id: string) {
  return id.toLowerCase().replace(/[^a-z0-9-]/g, '-')
}

function buildConfig(templateId: string, provider: SDKProvider): AgentConfig {
  const template = AGENT_TEMPLATES.find(t => t.id === templateId)
  if (!template) {
    throw new Error(`Unknown template: ${templateId}`)
  }

  const tools = AVAILABLE_TOOLS.map(tool => ({
    ...tool,
    enabled: template.defaultTools.includes(tool.id),
  }))

  // Ensure at least one tool is enabled
  if (!tools.some(t => t.enabled)) {
    tools[0].enabled = true
  }

  const projectName = sanitizeName(`${template.id}-${provider}-test`)

  return {
    name: `${template.name} Test Agent`,
    description: template.description,
    domain: template.domain,
    templateId: template.id,
    sdkProvider: provider,
    model: MODEL_BY_PROVIDER[provider],
    tools,
    mcpServers: [],
    customInstructions: '',
    permissions: template.domain === 'development' ? 'balanced' : 'restrictive',
    maxTokens: 2048,
    temperature: 0.4,
    projectName,
    packageName: projectName,
    version: '0.0.1',
    author: 'Generator Matrix',
    license: 'MIT',
  }
}

async function runMatrix() {
  const results: string[] = []

  for (const provider of FULL_PROJECT_PROVIDERS) {
    for (const template of AGENT_TEMPLATES) {
      const config = buildConfig(template.id, provider)
      const project = await generateAgentProject(config)
      const paths = new Set(project.files.map(f => f.path))
      const packageJson = JSON.parse(project.files.find(f => f.path === 'package.json')!.content)
      const [sdk, version] = SDK_DEPENDENCIES[provider as keyof typeof SDK_DEPENDENCIES]
      if (packageJson.dependencies[sdk] !== version || packageJson.engines.node !== '>=22.12.0') {
        throw new Error(`[${provider}] Template ${template.id} has stale SDK or Node requirements`)
      }
      if (provider === 'openai' && packageJson.dependencies.zod !== '^4.6.5') {
        throw new Error(`[openai] Template ${template.id} must satisfy the SDK's Zod 4 peer dependency`)
      }

      // Core files
      const mustHave = ['package.json', 'src/agent.ts', 'src/cli.ts', 'src/config.ts', 'src/permissions.ts', 'src/planner.ts', 'README.md', '.env.example', '.plans/.gitkeep']
      for (const path of mustHave) {
        if (!paths.has(path)) {
          throw new Error(`[${provider}] Template ${template.id} missing required file: ${path}`)
        }
      }

      // Knowledge assets
      const hasKnowledgeTools = config.tools.some(t => t.enabled && KNOWLEDGE_TOOL_IDS.has(t.id))
      if (hasKnowledgeTools && !paths.has('src/tools/knowledge-tools.ts')) {
        throw new Error(`[${provider}] Template ${template.id} expected knowledge-tools.ts but not generated`)
      }

      if (provider === 'copilot') {
        for (const wrapperFile of WRAPPER_TOOL_FILES) {
          if (paths.has(wrapperFile)) {
            throw new Error(`[copilot] Template ${template.id} should not generate ${wrapperFile} (built-in tools are used instead)`)
          }
        }

        const agentSource = project.files.find(f => f.path === 'src/agent.ts')?.content ?? ''
        if (!agentSource.includes("from '@github/copilot-sdk'")) {
          throw new Error(`[copilot] Template ${template.id} agent.ts does not import @github/copilot-sdk`)
        }
      }

      results.push(`✅ [${provider}] ${template.id} -> ${project.files.length} files`)
    }
  }

  console.log('Generator matrix completed:')
  results.forEach(r => console.log(r))
}

runMatrix().catch(err => {
  console.error('Generator matrix failed:', err)
  process.exit(1)
})
