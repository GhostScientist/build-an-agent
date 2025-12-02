import { generateAgentProject } from '../src/lib/generator'
import { AVAILABLE_TOOLS, type AgentConfig } from '../src/types/agent'

async function main() {
  const tools = AVAILABLE_TOOLS.map(tool => ({
    ...tool,
    enabled: ['doc-ingest', 'table-extract', 'source-notes', 'local-rag', 'read-file', 'find-files', 'search-files'].includes(tool.id),
  }))

  const config: AgentConfig = {
    name: 'SmokeTestAgent',
    description: 'Smoke test agent',
    domain: 'knowledge',
    templateId: 'research-ops-agent',
    sdkProvider: 'claude',
    model: 'claude-sonnet-4.5',
    interface: 'cli',
    tools,
    mcpServers: [],
    customInstructions: '',
    specialization: 'Smoke test specialization',
    permissions: 'restrictive',
    maxTokens: 2048,
    temperature: 0.3,
    projectName: 'smoke-test-agent',
    packageName: 'smoke-test-agent',
    version: '0.0.1',
    author: 'Smoke Test',
    license: 'MIT',
  }

  const project = await generateAgentProject(config)
  const filePaths = project.files.map(f => f.path)

  if (!filePaths.includes('src/tools/knowledge-tools.ts')) {
    throw new Error('Missing knowledge tools in generated project')
  }

  if (!filePaths.includes('workflows/literature_review.md')) {
    throw new Error('Missing knowledge workflow in generated project')
  }

  if (!filePaths.includes('scripts/eval.ts')) {
    throw new Error('Missing eval script in generated project')
  }

  console.log(`✅ Generated ${project.files.length} files; knowledge assets present.`)
}

main().catch(err => {
  console.error('Generator smoke test failed:', err)
  process.exit(1)
})
