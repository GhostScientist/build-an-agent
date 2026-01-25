#!/usr/bin/env tsx
/**
 * Agent Test Runner
 *
 * Automated testing framework for generated CLI agents
 * Tests both Claude and OpenAI SDK agents
 *
 * Usage:
 *   npm run test:agents              # Run all tests
 *   npm run test:agents:claude       # Claude only
 *   npm run test:agents:openai       # OpenAI only
 *   npm run test:agents:quick        # Minimal test suite
 */

import * as fs from 'fs'
import * as path from 'path'
import { TestHarness, ensureBuilt, checkApiKeys, type ChatMessage, type HistoryMessage } from './test-harness'
import { runAssertions, allPassed, formatResults, type Assertion } from './assertions'
import { TokenTracker, BUDGET_LEVELS } from './token-tracker'
import { saveHtmlReport, openReportInBrowser, type ReportData } from './html-reporter'

// ============================================================================
// Types
// ============================================================================

interface TestCase {
  name: string
  prompt: string
  assertions: Assertion[]
  estimatedTokens: number
  note?: string
}

interface MultiTurnTestCase {
  name: string
  turns: Array<{
    prompt: string
    assertions?: Assertion[]
  }>
  estimatedTokens: number
}

interface TestFixture {
  category: string
  description: string
  tests: (TestCase | MultiTurnTestCase)[]
}

interface TestResult {
  name: string
  category: string
  passed: boolean
  duration: number
  error?: string
  assertions?: string
  chat?: ChatMessage[]
}

interface SuiteResult {
  provider: 'claude' | 'openai' | 'copilot'
  template: string
  total: number
  passed: number
  failed: number
  skipped: number
  duration: number
  tests: TestResult[]
}

interface RunConfig {
  providers: Array<'claude' | 'openai' | 'copilot'>
  templates: string[]
  openReport: boolean
  categories: string[]
  budget: number
  timeout: number
  verbose: boolean
  quick: boolean
}

// ============================================================================
// Constants
// ============================================================================

const GENERATED_AGENTS_DIR = path.join(__dirname, '../../../GENERATED_AGENTS')
const FIXTURES_DIR = path.join(__dirname, 'fixtures')
const REPORTS_DIR = path.join(__dirname, 'reports')

// Representative templates to test (one per domain)
const REPRESENTATIVE_TEMPLATES = [
  'development-agent',  // Development domain
  'business-agent',     // Business domain
  'research-ops-agent'  // Knowledge domain
]

// ============================================================================
// CLI Argument Parsing
// ============================================================================

function parseArgs(): RunConfig {
  const args = process.argv.slice(2)

  const config: RunConfig = {
    providers: ['claude', 'openai'],
    templates: REPRESENTATIVE_TEMPLATES,
    openReport: true,
    categories: ['simple-chat', 'multi-turn', 'workflows'],
    budget: BUDGET_LEVELS.full,
    timeout: 60000,
    verbose: false,
    quick: false
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case '--provider':
        const provider = args[++i] as 'claude' | 'openai' | 'copilot'
        if (provider === 'claude' || provider === 'openai' || provider === 'copilot') {
          config.providers = [provider]
        }
        break

      case '--template':
        config.templates = [args[++i]]
        break

      case '--category':
        config.categories = [args[++i]]
        break

      case '--budget':
        config.budget = parseInt(args[++i], 10)
        break

      case '--timeout':
        config.timeout = parseInt(args[++i], 10)
        break

      case '--verbose':
      case '-v':
        config.verbose = true
        break

      case '--quick':
        config.quick = true
        config.budget = BUDGET_LEVELS.quick
        break

      case '--full':
        config.budget = BUDGET_LEVELS.full
        break

      case '--no-open':
        config.openReport = false
        break

      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
    }
  }

  return config
}

function printHelp(): void {
  console.log(`
Agent Test Runner

Usage: tsx scripts/test-agents/runner.ts [options]

Options:
  --provider <name>   Test only 'claude', 'openai', or 'copilot' (default: claude + openai)
  --template <id>     Test specific template (default: representative set)
  --category <name>   Run specific category: simple-chat, multi-turn, workflows
  --budget <n>        Token budget (default: 5000)
  --timeout <ms>      Per-test timeout (default: 60000)
  --quick             Minimal test suite with reduced budget
  --full              Full test suite with larger budget
  --verbose, -v       Show detailed output
  --no-open           Don't open HTML report in browser
  --help, -h          Show this help

Examples:
  npm run test:agents                    # Full test suite
  npm run test:agents -- --provider claude
  npm run test:agents -- --quick
  npm run test:agents -- --template development-agent --verbose
  npm run test:agents -- --no-open       # Generate report without opening
`)
}

// ============================================================================
// Test Loading
// ============================================================================

function loadFixtures(categories: string[]): Map<string, TestFixture> {
  const fixtures = new Map<string, TestFixture>()

  for (const category of categories) {
    const fixturePath = path.join(FIXTURES_DIR, `${category}.json`)
    if (fs.existsSync(fixturePath)) {
      const content = fs.readFileSync(fixturePath, 'utf-8')
      fixtures.set(category, JSON.parse(content))
    }
  }

  return fixtures
}

// ============================================================================
// Test Execution
// ============================================================================

async function runTestSuite(
  provider: 'claude' | 'openai' | 'copilot',
  template: string,
  fixtures: Map<string, TestFixture>,
  tracker: TokenTracker,
  config: RunConfig
): Promise<SuiteResult> {
  const startTime = Date.now()
  const results: TestResult[] = []
  let skipped = 0

  // Determine agent directory
  const agentDir = provider === 'claude'
    ? path.join(GENERATED_AGENTS_DIR, template)
    : path.join(GENERATED_AGENTS_DIR, `${template}-${provider}`)

  // Check if agent exists
  if (!fs.existsSync(agentDir)) {
    console.log(`  ⚠️  Agent not found: ${agentDir}`)
    return {
      provider,
      template,
      total: 0,
      passed: 0,
      failed: 0,
      skipped: fixtures.size,
      duration: 0,
      tests: []
    }
  }

  // Ensure agent is built
  console.log(`  📦 Ensuring agent is built...`)
  const built = await ensureBuilt(agentDir, config.verbose)
  if (!built) {
    console.log(`  ❌ Build failed`)
    return {
      provider,
      template,
      total: 0,
      passed: 0,
      failed: 1,
      skipped: 0,
      duration: Date.now() - startTime,
      tests: [{ name: 'build', category: 'setup', passed: false, duration: 0, error: 'Build failed' }]
    }
  }

  // Check API key
  const apiKeyCheck = checkApiKeys(provider)
  if (!apiKeyCheck.available) {
    console.log(`  ⚠️  Missing API key for ${provider}`)
    return {
      provider,
      template,
      total: 0,
      passed: 0,
      failed: 0,
      skipped: fixtures.size,
      duration: 0,
      tests: []
    }
  }

  // Create harness
  const envMap: Record<string, Record<string, string>> = {
    claude: { ANTHROPIC_API_KEY: apiKeyCheck.key! },
    openai: { OPENAI_API_KEY: apiKeyCheck.key! },
    copilot: { GITHUB_TOKEN: apiKeyCheck.key! },
  }
  const harness = new TestHarness(agentDir, {
    timeout: config.timeout,
    env: envMap[provider],
    verbose: config.verbose
  })

  // Run tests for each fixture
  for (const [category, fixture] of Array.from(fixtures.entries())) {
    console.log(`  📋 ${category}`)

    for (const test of fixture.tests) {
      // Check budget
      const estimatedTokens = (test as TestCase).estimatedTokens || 500
      if (!tracker.canProceed(estimatedTokens)) {
        console.log(`    ⏸️  ${test.name} (skipped - budget)`)
        skipped++
        continue
      }

      // Quick mode: only run first test per category
      if (config.quick && results.filter(r => r.category === category).length >= 1) {
        skipped++
        continue
      }

      const testStart = Date.now()

      try {
        // Check if multi-turn test
        if ('turns' in test) {
          // Multi-turn test
          const multiTest = test as MultiTurnTestCase
          console.log(`    🔄 ${multiTest.name}...`)

          let allTurnsPassed = true
          let lastError: string | undefined
          const turnResponses: ChatMessage[] = []
          const conversationHistory: HistoryMessage[] = []

          for (let i = 0; i < multiTest.turns.length; i++) {
            const turn = multiTest.turns[i]
            // Pass conversation history for context
            const response = await harness.query(turn.prompt, conversationHistory)

            // Accumulate chat messages from each turn for reporting
            if (response.chat) {
              turnResponses.push(...response.chat)
            }

            // Build history for next turn (only user/assistant, simplified format)
            conversationHistory.push(
              { role: 'user', content: turn.prompt },
              { role: 'assistant', content: response.text }
            )

            if (turn.assertions) {
              const assertionResults = runAssertions(response.text, turn.assertions)
              if (!allPassed(assertionResults)) {
                allTurnsPassed = false
                lastError = `Turn ${i + 1}: ${formatResults(assertionResults)}`
                break
              }
            }
          }

          const duration = Date.now() - testStart
          tracker.record(multiTest.name, estimatedTokens)

          results.push({
            name: multiTest.name,
            category,
            passed: allTurnsPassed,
            duration,
            error: lastError,
            chat: turnResponses
          })

          console.log(`    ${allTurnsPassed ? '✓' : '✗'} ${multiTest.name} (${duration}ms)`)

        } else {
          // Single turn test
          const singleTest = test as TestCase
          console.log(`    🔹 ${singleTest.name}...`)

          const response = await harness.query(singleTest.prompt)
          const assertionResults = runAssertions(response.text, singleTest.assertions)
          const passed = allPassed(assertionResults)

          const duration = Date.now() - testStart
          tracker.record(singleTest.name, estimatedTokens)

          results.push({
            name: singleTest.name,
            category,
            passed,
            duration,
            assertions: formatResults(assertionResults),
            error: passed ? undefined : formatResults(assertionResults),
            chat: response.chat
          })

          console.log(`    ${passed ? '✓' : '✗'} ${singleTest.name} (${duration}ms)`)
        }

      } catch (err) {
        const duration = Date.now() - testStart
        tracker.record(test.name, estimatedTokens)

        results.push({
          name: test.name,
          category,
          passed: false,
          duration,
          error: err instanceof Error ? err.message : String(err)
        })

        console.log(`    ✗ ${test.name} (error: ${err instanceof Error ? err.message : err})`)
      }
    }
  }

  // Cleanup
  harness.kill()

  const totalDuration = Date.now() - startTime
  const passedCount = results.filter(r => r.passed).length
  const failedCount = results.filter(r => !r.passed).length

  return {
    provider,
    template,
    total: results.length,
    passed: passedCount,
    failed: failedCount,
    skipped,
    duration: totalDuration,
    tests: results
  }
}

// ============================================================================
// Reporting
// ============================================================================

function printSummary(suiteResults: SuiteResult[], tracker: TokenTracker): void {
  console.log('\n' + '═'.repeat(60))
  console.log('                    TEST SUMMARY')
  console.log('═'.repeat(60))

  let totalTests = 0
  let totalPassed = 0
  let totalFailed = 0
  let totalSkipped = 0

  for (const suite of suiteResults) {
    const status = suite.failed === 0 ? '✓' : '✗'
    console.log(`\n${status} ${suite.provider}/${suite.template}`)
    console.log(`  Passed: ${suite.passed}/${suite.total} | Failed: ${suite.failed} | Skipped: ${suite.skipped}`)
    console.log(`  Duration: ${(suite.duration / 1000).toFixed(1)}s`)

    if (suite.failed > 0) {
      console.log('  Failed tests:')
      for (const test of suite.tests.filter(t => !t.passed)) {
        console.log(`    - ${test.name}: ${test.error?.substring(0, 100)}`)
      }
    }

    totalTests += suite.total
    totalPassed += suite.passed
    totalFailed += suite.failed
    totalSkipped += suite.skipped
  }

  console.log('\n' + '─'.repeat(60))
  console.log(`TOTAL: ${totalPassed}/${totalTests} passed | ${totalFailed} failed | ${totalSkipped} skipped`)

  // Token usage
  console.log(tracker.formatReport())
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

function saveReport(suiteResults: SuiteResult[], tracker: TokenTracker, openReport: boolean): void {
  const totalDuration = suiteResults.reduce((sum, s) => sum + s.duration, 0)
  const total = suiteResults.reduce((sum, s) => sum + s.total, 0)
  const passed = suiteResults.reduce((sum, s) => sum + s.passed, 0)

  const report: ReportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed: suiteResults.reduce((sum, s) => sum + s.failed, 0),
      skipped: suiteResults.reduce((sum, s) => sum + s.skipped, 0),
      passRate: total > 0 ? `${((passed / total) * 100).toFixed(0)}%` : '0%',
      duration: formatDuration(totalDuration)
    },
    tokenUsage: tracker.getReport(),
    suites: suiteResults
  }

  // Save JSON report
  const jsonPath = path.join(REPORTS_DIR, 'latest.json')
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))
  console.log(`\n📄 JSON Report: ${jsonPath}`)

  // Save HTML report
  const htmlPath = path.join(REPORTS_DIR, 'report.html')
  saveHtmlReport(report, htmlPath)
  console.log(`📊 HTML Report: ${htmlPath}`)

  // Open in browser
  if (openReport) {
    openReportInBrowser(htmlPath)
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const config = parseArgs()
  const tracker = new TokenTracker(config.budget)

  console.log('🧪 Agent Test Runner')
  console.log('═'.repeat(60))
  console.log(`Providers: ${config.providers.join(', ')}`)
  console.log(`Templates: ${config.templates.join(', ')}`)
  console.log(`Categories: ${config.categories.join(', ')}`)
  console.log(`Budget: ${config.budget} tokens`)
  console.log(`Mode: ${config.quick ? 'Quick' : 'Standard'}`)
  console.log('═'.repeat(60))

  // Load fixtures
  const fixtures = loadFixtures(config.categories)
  if (fixtures.size === 0) {
    console.error('No test fixtures found!')
    process.exit(1)
  }

  const suiteResults: SuiteResult[] = []

  // Run tests for each provider/template combination
  for (const provider of config.providers) {
    for (const template of config.templates) {
      console.log(`\n🚀 Testing ${provider}/${template}`)

      const result = await runTestSuite(provider, template, fixtures, tracker, config)
      suiteResults.push(result)

      // Check if we should stop due to budget
      if (tracker.isOverBudget()) {
        console.log('\n⚠️  Token budget exhausted, stopping tests')
        break
      }
    }

    if (tracker.isOverBudget()) break
  }

  // Print summary and save report
  printSummary(suiteResults, tracker)
  saveReport(suiteResults, tracker, config.openReport)

  // Exit with appropriate code
  const failed = suiteResults.reduce((sum, s) => sum + s.failed, 0)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('Test runner failed:', err)
  process.exit(2)
})
