import { generateAgentProject } from '../src/lib/generator'
import { AGENT_TEMPLATES, AVAILABLE_TOOLS, type AgentConfig } from '../src/types/agent'

const KNOWLEDGE_TOOL_IDS = new Set(['doc-ingest', 'table-extract', 'source-notes', 'local-rag'])

function sanitizeName(id: string) {
  return id.toLowerCase().replace(/[^a-z0-9-]/g, '-')
}

function buildConfig(templateId: string): AgentConfig {
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

  const projectName = sanitizeName(`${template.id}-test`)

  return {
    name: `${template.name} Test Agent`,
    description: template.description,
    domain: template.domain,
    templateId: template.id,
    sdkProvider: 'claude',
    model: 'claude-sonnet-4.5-20250929',
    interface: 'cli',
    tools,
    customInstructions: '',
    specialization: template.documentation,
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

  for (const template of AGENT_TEMPLATES) {
    const config = buildConfig(template.id)
    const project = await generateAgentProject(config)
    const paths = new Set(project.files.map(f => f.path))

    // Core files
    const mustHave = ['package.json', 'src/agent.ts', 'src/cli.ts', 'src/config.ts', 'src/permissions.ts', 'README.md', 'Dockerfile', '.env.example']
    for (const path of mustHave) {
      if (!paths.has(path)) {
        throw new Error(`Template ${template.id} missing required file: ${path}`)
      }
    }

    // Knowledge assets
    const hasKnowledgeTools = config.tools.some(t => t.enabled && KNOWLEDGE_TOOL_IDS.has(t.id))
    if (hasKnowledgeTools && !paths.has('src/tools/knowledge-tools.ts')) {
      throw new Error(`Template ${template.id} expected knowledge-tools.ts but not generated`)
    }

    results.push(`✅ ${template.id} -> ${project.files.length} files`)
  }

  console.log('Generator matrix completed:')
  results.forEach(r => console.log(r))
}

runMatrix().catch(err => {
  console.error('Generator matrix failed:', err)
  process.exit(1)
})
