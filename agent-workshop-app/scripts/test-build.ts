#!/usr/bin/env tsx
import { generateAgentProject } from '../src/lib/generator'
import { AGENT_TEMPLATES, AVAILABLE_TOOLS, type AgentConfig, type SDKProvider } from '../src/types/agent'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

const SUPPORTED_PROVIDERS: SDKProvider[] = ['claude', 'openai', 'copilot']

const MODEL_BY_PROVIDER: Record<string, string> = {
  claude: 'claude-sonnet-4.5-20250929',
  openai: 'gpt-5.1',
  copilot: 'auto',
}

function parseProvider(): SDKProvider {
  const args = process.argv.slice(2)
  const index = args.indexOf('--provider')
  if (index === -1 || !args[index + 1]) {
    return 'claude'
  }

  const value = args[index + 1] as SDKProvider
  if (!SUPPORTED_PROVIDERS.includes(value)) {
    console.error(`Unsupported provider: ${value}. Expected one of ${SUPPORTED_PROVIDERS.join(', ')}`)
    process.exit(1)
  }
  return value
}

const provider = parseProvider()
const outputDir = `/tmp/test-researcher-agent-${provider}`

// Clean up previous test
try {
  rmSync(outputDir, { recursive: true, force: true })
} catch {}

console.log(`Generating ${provider} agent project with knowledge tools...`)

// Build proper config based on research template
const template = AGENT_TEMPLATES.find(t => t.id === 'research-ops-agent')!
const tools = AVAILABLE_TOOLS.map(tool => ({
  ...tool,
  enabled: template.defaultTools.includes(tool.id),
}))

const config: AgentConfig = {
  name: 'Researcher Agent',
  description: 'Test researcher agent with knowledge tools',
  domain: 'knowledge',
  templateId: 'research-ops-agent',
  sdkProvider: provider,
  model: MODEL_BY_PROVIDER[provider],
  tools,
  mcpServers: [],
  customInstructions: '',
  permissions: 'balanced',
  maxTokens: 2048,
  temperature: 0.4,
  projectName: 'researcher-agent',
  packageName: 'researcher-agent',
  version: '1.0.0',
  author: 'Test User',
  license: 'MIT',
}

async function runTest() {
  const project = await generateAgentProject(config)

  console.log(`Generated ${project.files.length} files`)

  // Write all files
  for (const file of project.files) {
    const fullPath = join(outputDir, file.path)
    const dir = fullPath.substring(0, fullPath.lastIndexOf('/'))
    mkdirSync(dir, { recursive: true })
    writeFileSync(fullPath, file.content, 'utf-8')
  }

  console.log(`✅ Project written to ${outputDir}`)

  // Test npm install
  console.log('\n📦 Running npm install...')
  try {
    execSync('npm install', { cwd: outputDir, stdio: 'inherit' })
    console.log('✅ npm install succeeded')
  } catch (error) {
    console.error('❌ npm install failed')
    process.exit(1)
  }

  // Test build
  console.log('\n🔨 Running npm run build...')
  try {
    execSync('npm run build', { cwd: outputDir, stdio: 'inherit' })
    console.log('✅ Build succeeded!')
  } catch (error) {
    console.error('❌ Build failed')
    process.exit(1)
  }

  console.log('\n🎉 All tests passed!')
}

runTest().catch(err => {
  console.error('Test failed:', err)
  process.exit(1)
})
