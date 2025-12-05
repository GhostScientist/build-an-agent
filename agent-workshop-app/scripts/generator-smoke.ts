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
    tools,
    mcpServers: [],
    customInstructions: '',
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

  // Check for core files that should always be generated
  const requiredFiles = [
    'package.json',
    'src/cli.ts',
    'src/agent.ts',
    'tsconfig.json',
    '.commands/literature-review.json',  // knowledge domain workflow
  ]

  for (const file of requiredFiles) {
    if (!filePaths.includes(file)) {
      throw new Error(`Missing required file: ${file}`)
    }
  }

  console.log(`✅ Generated ${project.files.length} files; all required files present.`)
}

main().catch(err => {
  console.error('Generator smoke test failed:', err)
  process.exit(1)
})
