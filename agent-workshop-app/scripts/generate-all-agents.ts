import { generateAgentProject } from '../src/lib/generator'
import { AVAILABLE_TOOLS, type AgentConfig, type SDKProvider } from '../src/types/agent'
import * as fs from 'fs'
import * as path from 'path'

const OUTPUT_DIR = path.join(__dirname, '../../GENERATED_AGENTS')

// Parse CLI arguments
function parseArgs(): { provider: SDKProvider | 'both'; templates?: string[] } {
  const args = process.argv.slice(2)
  let provider: SDKProvider | 'both' = 'both'
  let templates: string[] | undefined

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--provider' && args[i + 1]) {
      const p = args[i + 1]
      if (p === 'claude' || p === 'openai' || p === 'both') {
        provider = p
      }
      i++
    } else if (args[i] === '--template' && args[i + 1]) {
      templates = templates || []
      templates.push(args[i + 1])
      i++
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Usage: tsx scripts/generate-all-agents.ts [options]

Options:
  --provider <name>   Generate for 'claude', 'openai', or 'both' (default: both)
  --template <id>     Generate specific template(s) only (can repeat)
  --help, -h          Show this help

Examples:
  tsx scripts/generate-all-agents.ts --provider claude
  tsx scripts/generate-all-agents.ts --provider openai
  tsx scripts/generate-all-agents.ts --template development-agent --provider both
`)
      process.exit(0)
    }
  }

  return { provider, templates }
}

// Test prompts for each agent type
const TEST_PROMPTS: Record<string, string[]> = {
  'modernization-agent': [
    'Analyze the current directory structure and identify any legacy patterns',
    'What are the main files in this project and their purposes?',
    'Search for any deprecated API usage in JavaScript files',
    '/code-audit --path . --focus security',
  ],
  'eqe-modernization': [
    'What are your capabilities as an enterprise modernization agent?',
    '/dare-status',
    '/dare-discover --target .',
    'Analyze this codebase and identify the technology stack being used',
    'What DARE methodology phases can you help me with?',
  ],
  'document-processing-agent': [
    'List all PDF and text files in the current directory',
    'What document formats can you help me process?',
    'Help me understand the structure of documents in ./docs',
    '/invoice-batch --input ./invoices --output ./processed',
  ],
  'social-media-agent': [
    'Generate 3 tweet ideas about AI development tools',
    'What are trending topics I should consider for tech content?',
    'Help me plan a content calendar for next week',
    '/content-calendar --platform twitter --duration 7days',
  ],
  'research-ops-agent': [
    'Search the web for recent developments in AI agent frameworks',
    'What are the key differences between Claude and GPT-4?',
    'Help me summarize the main points from recent AI research',
    '/literature-review --topic "AI agents" --sources web --limit 10',
  ],
  'development-agent': [
    'Read the package.json and explain the project dependencies',
    'Find all TypeScript files in the src directory',
    'What testing frameworks are set up in this project?',
    '/code-review --path ./src --focus best-practices',
  ],
  'business-agent': [
    'Help me draft a project proposal outline',
    'What are key metrics I should track for a SaaS product?',
    'Generate a SWOT analysis template for a tech startup',
    '/quarterly-report --metrics revenue,users,churn',
  ],
  'creative-agent': [
    'Help me brainstorm names for a developer tool',
    'Write a tagline for an AI-powered code assistant',
    'Generate 5 creative concepts for a product launch',
    '/brand-voice --analyze ./content --suggest improvements',
  ],
  'code-review-agent': [
    'Review the main entry point file for potential issues',
    'Check for any security vulnerabilities in the codebase',
    'What coding standards should this project follow?',
    '/security-audit --path . --severity high',
  ],
  'testing-agent': [
    'What test files exist in this project?',
    'Suggest test cases for a user authentication flow',
    'How can I improve test coverage for this codebase?',
    '/test-coverage --path ./src --threshold 80',
  ],
  'data-entry-agent': [
    'What data formats can you help me process?',
    'Help me validate a CSV file structure',
    'Create a data entry template for customer records',
    '/validate-data --input ./data.csv --schema ./schema.json',
  ],
  'report-generation-agent': [
    'Generate a summary report template',
    'What sections should a technical report include?',
    'Help me format data for a monthly status report',
    '/generate-report --type monthly --data ./metrics.json',
  ],
  'blog-writing-agent': [
    'Help me outline a blog post about TypeScript best practices',
    'Generate an introduction for an article about AI tools',
    'What are good SEO keywords for developer content?',
    '/draft-post --topic "AI Development" --length 1500',
  ],
  'marketing-copy-agent': [
    'Write a product description for a CLI tool',
    'Generate email subject lines for a product launch',
    'Help me create compelling CTAs for a landing page',
    '/campaign-copy --product "AI Agent Builder" --channel email',
  ],
  'data-analysis-agent': [
    'What statistical methods would help analyze user engagement?',
    'Explain how to interpret correlation coefficients',
    'Help me design an A/B test for a new feature',
    '/analyze-dataset --input ./data.csv --metrics mean,median,std',
  ],
  'visualization-agent': [
    'What chart types work best for time series data?',
    'Help me design a dashboard for monitoring metrics',
    'Suggest color schemes for data visualization',
    '/create-dashboard --data ./metrics.json --charts line,bar,pie',
  ],
  'ml-pipeline-agent': [
    'Explain the steps in a typical ML pipeline',
    'What preprocessing steps should I consider for text data?',
    'Help me design a model evaluation strategy',
    '/train-model --data ./training.csv --target label --algorithm rf',
  ],
}

// Agent configurations matching the matrix
const AGENT_CONFIGS: Array<{
  templateId: string
  domain: string
  name: string
  description: string
  specialization: string
  tools: string[]
}> = [
  {
    templateId: 'modernization-agent',
    domain: 'development',
    name: 'Legacy Code Modernization Agent',
    description: 'Analyze and modernize legacy codebases',
    specialization: 'Legacy code analysis and modernization strategies',
    tools: ['read-file', 'find-files', 'search-files', 'write-file', 'edit-file', 'run-command', 'git-operations'],
  },
  {
    templateId: 'eqe-modernization',
    domain: 'development',
    name: 'Enterprise Modernization Agent (DARE)',
    description: 'Technology-agnostic enterprise modernization using DARE methodology',
    specialization: 'DARE methodology with subagent architecture and full traceability',
    tools: ['read-file', 'find-files', 'search-files', 'write-file', 'edit-file', 'run-command', 'git-operations', 'web-search', 'web-fetch', 'doc-ingest', 'source-notes'],
  },
  {
    templateId: 'document-processing-agent',
    domain: 'business',
    name: 'Document Processing Agent',
    description: 'Extract and process business documents',
    specialization: 'Document extraction, classification, and transformation',
    tools: ['read-file', 'find-files', 'write-file', 'doc-ingest', 'table-extract'],
  },
  {
    templateId: 'social-media-agent',
    domain: 'creative',
    name: 'Social Media Manager Agent',
    description: 'Create and manage social media content',
    specialization: 'Social media content creation and scheduling',
    tools: ['read-file', 'write-file', 'web-search', 'web-fetch'],
  },
  {
    templateId: 'research-ops-agent',
    domain: 'knowledge',
    name: 'Research Operations Agent',
    description: 'Evidence-backed research with literature reviews',
    specialization: 'Systematic research and source tracking',
    tools: ['read-file', 'find-files', 'search-files', 'web-search', 'web-fetch', 'doc-ingest', 'source-notes', 'local-rag'],
  },
  {
    templateId: 'development-agent',
    domain: 'development',
    name: 'Development Assistant Agent',
    description: 'Help with software development tasks',
    specialization: 'Code assistance, debugging, and best practices',
    tools: ['read-file', 'find-files', 'search-files', 'write-file', 'edit-file', 'run-command', 'git-operations'],
  },
  {
    templateId: 'business-agent',
    domain: 'business',
    name: 'Business Operations Agent',
    description: 'Support business operations and planning',
    specialization: 'Business analysis and operational efficiency',
    tools: ['read-file', 'find-files', 'write-file', 'web-search', 'doc-ingest', 'table-extract'],
  },
  {
    templateId: 'creative-agent',
    domain: 'creative',
    name: 'Creative Assistant Agent',
    description: 'Help with creative projects and ideation',
    specialization: 'Creative brainstorming and content development',
    tools: ['read-file', 'write-file', 'web-search', 'web-fetch'],
  },
  {
    templateId: 'code-review-agent',
    domain: 'development',
    name: 'Code Review Agent',
    description: 'Automated code review and quality checks',
    specialization: 'Code quality, security, and best practices review',
    tools: ['read-file', 'find-files', 'search-files', 'run-command', 'git-operations'],
  },
  {
    templateId: 'testing-agent',
    domain: 'development',
    name: 'Testing Assistant Agent',
    description: 'Help with test creation and coverage',
    specialization: 'Test strategy, coverage analysis, and automation',
    tools: ['read-file', 'find-files', 'search-files', 'write-file', 'run-command'],
  },
  {
    templateId: 'data-entry-agent',
    domain: 'business',
    name: 'Data Entry Agent',
    description: 'Automate data entry and validation',
    specialization: 'Data validation, transformation, and entry automation',
    tools: ['read-file', 'find-files', 'write-file', 'doc-ingest', 'table-extract'],
  },
  {
    templateId: 'report-generation-agent',
    domain: 'business',
    name: 'Report Generation Agent',
    description: 'Generate business reports and summaries',
    specialization: 'Report creation, data aggregation, and formatting',
    tools: ['read-file', 'find-files', 'write-file', 'doc-ingest', 'table-extract', 'web-search'],
  },
  {
    templateId: 'blog-writing-agent',
    domain: 'creative',
    name: 'Blog Writing Agent',
    description: 'Create blog posts and articles',
    specialization: 'Long-form content creation and SEO optimization',
    tools: ['read-file', 'write-file', 'web-search', 'web-fetch', 'source-notes'],
  },
  {
    templateId: 'marketing-copy-agent',
    domain: 'creative',
    name: 'Marketing Copy Agent',
    description: 'Create marketing and sales copy',
    specialization: 'Persuasive copy, CTAs, and campaign content',
    tools: ['read-file', 'write-file', 'web-search', 'web-fetch'],
  },
  {
    templateId: 'data-analysis-agent',
    domain: 'data-science',
    name: 'Data Analysis Agent',
    description: 'Analyze datasets and generate insights',
    specialization: 'Statistical analysis and data interpretation',
    tools: ['read-file', 'find-files', 'write-file', 'run-command'],
  },
  {
    templateId: 'visualization-agent',
    domain: 'data-science',
    name: 'Visualization Agent',
    description: 'Create data visualizations and dashboards',
    specialization: 'Chart design, dashboard creation, and visual analytics',
    tools: ['read-file', 'find-files', 'write-file', 'run-command'],
  },
  {
    templateId: 'ml-pipeline-agent',
    domain: 'data-science',
    name: 'ML Pipeline Agent',
    description: 'Build and manage ML pipelines',
    specialization: 'Model training, evaluation, and deployment',
    tools: ['read-file', 'find-files', 'search-files', 'write-file', 'run-command', 'doc-ingest'],
  },
]

function createTestPromptsFile(agentId: string, outputPath: string): void {
  const prompts = TEST_PROMPTS[agentId] || [
    'Hello! What can you help me with?',
    'Describe your capabilities',
    'Show me the available commands',
  ]

  const content = `# Test Prompts for ${agentId}

Use these prompts to validate the agent's functionality.

## Quick Start
\`\`\`bash
# Install dependencies
npm install

# Run the agent
npm start

# Or run with a specific query
npm start -- --query "Hello, what can you do?"

# Run in verbose mode to see statistics
npm start -- --verbose
\`\`\`

## Test Prompts

### Basic Functionality
${prompts.slice(0, 3).map((p, i) => `${i + 1}. \`${p}\``).join('\n')}

### Workflow Commands
${prompts.slice(3).map((p, i) => `${i + 1}. \`${p}\``).join('\n') || 'N/A'}

## What to Verify

1. **Message Display**: Text should stream smoothly without duplicates
2. **Web Search** (if enabled): Should use SDK built-in WebSearch/WebFetch
3. **Session Persistence**: Multi-turn conversations should maintain context
4. **Verbose Mode**: Running with \`--verbose\` should show:
   - System messages during initialization
   - Statistics after each response (duration, tokens)
5. **Workflows**: Slash commands should execute multi-step processes

## Expected Behavior

- Agent should respond helpfully to queries
- File operations should request appropriate permissions
- Web search should return real results (not placeholders)
- Workflows should show step-by-step progress

## Troubleshooting

If you encounter issues:
1. Ensure ANTHROPIC_API_KEY is set in your environment
2. Check that all dependencies are installed
3. Run with \`--verbose\` to see detailed output
4. Check the audit log in \`./audit.log\` for permission decisions
`

  fs.writeFileSync(path.join(outputPath, 'TEST_PROMPTS.md'), content)
}

async function generateAgentForProvider(
  agentConfig: typeof AGENT_CONFIGS[0],
  provider: SDKProvider
): Promise<void> {
  const suffix = provider === 'openai' ? '-openai' : ''
  const dirName = `${agentConfig.templateId}${suffix}`

  console.log(`📦 Generating ${dirName} (${provider})...`)

  // Build tools array
  const tools = AVAILABLE_TOOLS.map(tool => ({
    ...tool,
    enabled: agentConfig.tools.includes(tool.id),
  }))

  // Model selection based on provider
  const model = provider === 'claude'
    ? 'claude-sonnet-4-5-20250929'
    : 'gpt-4.1'

  const config: AgentConfig = {
    name: agentConfig.name,
    description: agentConfig.description,
    domain: agentConfig.domain as any,
    templateId: agentConfig.templateId,
    sdkProvider: provider,
    model,
    tools,
    mcpServers: [],
    customInstructions: '',
    permissions: 'balanced',
    maxTokens: 4096,
    temperature: 0.3,
    projectName: dirName,
    packageName: dirName,
    version: '1.0.0',
    author: 'Build-An-Agent Workshop',
    license: 'MIT',
  }

  try {
    const project = await generateAgentProject(config)
    const outputPath = path.join(OUTPUT_DIR, dirName)

    // Create project directory
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true })
    }

    // Write all generated files
    for (const file of project.files) {
      const filePath = path.join(outputPath, file.path)
      const dirPath = path.dirname(filePath)

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true })
      }

      fs.writeFileSync(filePath, file.content)
    }

    // Create test prompts file
    createTestPromptsFile(agentConfig.templateId, outputPath)

    console.log(`   ✅ Generated ${project.files.length} files + TEST_PROMPTS.md`)
  } catch (error) {
    console.error(`   ❌ Failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function generateAllAgents() {
  const { provider, templates } = parseArgs()

  console.log('🚀 Generating agent variants...\n')
  console.log(`Provider(s): ${provider}`)
  if (templates) {
    console.log(`Templates: ${templates.join(', ')}`)
  }
  console.log('')

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Filter configs if specific templates requested
  const configs = templates
    ? AGENT_CONFIGS.filter(c => templates.includes(c.templateId))
    : AGENT_CONFIGS

  // Determine which providers to generate
  const providers: SDKProvider[] = provider === 'both'
    ? ['claude', 'openai']
    : [provider]

  for (const agentConfig of configs) {
    for (const p of providers) {
      await generateAgentForProvider(agentConfig, p)
    }
  }

  console.log('\n🎉 All agents generated!')
  console.log(`📁 Output directory: ${OUTPUT_DIR}`)
  console.log('\nTo test an agent:')
  console.log('  cd GENERATED_AGENTS/<agent-name>')
  console.log('  npm install')
  if (provider === 'both' || provider === 'claude') {
    console.log('  export ANTHROPIC_API_KEY=your-key  # for Claude agents')
  }
  if (provider === 'both' || provider === 'openai') {
    console.log('  export OPENAI_API_KEY=your-key     # for OpenAI agents')
  }
  console.log('  npm start')
}

generateAllAgents().catch(console.error)
