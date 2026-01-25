/**
 * HTML Report Generator for Agent Tests
 *
 * Generates beautiful, minimal black and white HTML reports
 * showing test results with full chat transcripts.
 */

import * as fs from 'fs'
import * as path from 'path'
import type { TokenReport } from './token-tracker'

// ============================================================================
// Types
// ============================================================================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp?: Date
  toolName?: string
}

export interface TestResult {
  name: string
  category: string
  passed: boolean
  duration: number
  error?: string
  assertions?: string
  chat?: ChatMessage[]
}

export interface SuiteResult {
  provider: 'claude' | 'openai' | 'copilot'
  template: string
  total: number
  passed: number
  failed: number
  skipped: number
  duration: number
  tests: TestResult[]
}

export interface ReportData {
  timestamp: string
  summary: {
    total: number
    passed: number
    failed: number
    skipped: number
    passRate: string
    duration: string
  }
  tokenUsage: TokenReport
  suites: SuiteResult[]
}

// ============================================================================
// HTML Template
// ============================================================================

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}m`
}

function generateChatHtml(chat: ChatMessage[]): string {
  if (!chat || chat.length === 0) {
    return '<p class="no-chat">No chat transcript available</p>'
  }

  return chat.map(msg => {
    const roleClass = msg.role
    const roleLabel = msg.role === 'tool'
      ? `tool: ${msg.toolName || 'unknown'}`
      : msg.role

    return `
      <div class="chat-message ${roleClass}">
        <div class="chat-role">${roleLabel}</div>
        <div class="chat-content">${escapeHtml(msg.content)}</div>
      </div>
    `
  }).join('\n')
}

function generateTestHtml(test: TestResult, index: number): string {
  const statusClass = test.passed ? 'passed' : 'failed'
  const statusIcon = test.passed ? '✓' : '✗'
  const testId = `test-${index}`

  return `
    <div class="test-card ${statusClass}">
      <div class="test-header" onclick="toggleTest('${testId}')">
        <div class="test-status">
          <span class="status-icon">${statusIcon}</span>
          <span class="test-name">${escapeHtml(test.name)}</span>
        </div>
        <div class="test-meta">
          <span class="test-category">${escapeHtml(test.category)}</span>
          <span class="test-duration">${formatDuration(test.duration)}</span>
          <span class="expand-icon">▼</span>
        </div>
      </div>
      <div class="test-details" id="${testId}">
        ${test.error ? `
          <div class="test-error">
            <strong>Error:</strong> ${escapeHtml(test.error)}
          </div>
        ` : ''}
        ${test.assertions ? `
          <div class="test-assertions">
            <strong>Assertions:</strong> ${escapeHtml(test.assertions)}
          </div>
        ` : ''}
        <div class="chat-transcript">
          <h4>Chat Transcript</h4>
          ${generateChatHtml(test.chat || [])}
        </div>
      </div>
    </div>
  `
}

function generateSuiteHtml(suite: SuiteResult, suiteIndex: number): string {
  const passRate = suite.total > 0
    ? ((suite.passed / suite.total) * 100).toFixed(0)
    : '0'
  const statusClass = suite.failed === 0 ? 'suite-passed' : 'suite-failed'

  let testIndex = suiteIndex * 1000 // Ensure unique IDs across suites

  return `
    <div class="suite ${statusClass}">
      <div class="suite-header">
        <div class="suite-title">
          <span class="provider-badge ${suite.provider}">${suite.provider}</span>
          <h3>${escapeHtml(suite.template)}</h3>
        </div>
        <div class="suite-stats">
          <span class="stat passed">${suite.passed} passed</span>
          <span class="stat failed">${suite.failed} failed</span>
          <span class="stat skipped">${suite.skipped} skipped</span>
          <span class="stat duration">${formatDuration(suite.duration)}</span>
          <span class="pass-rate">${passRate}%</span>
        </div>
      </div>
      <div class="suite-tests">
        ${suite.tests.map(test => generateTestHtml(test, testIndex++)).join('\n')}
      </div>
    </div>
  `
}

export function generateHtmlReport(data: ReportData): string {
  const timestamp = new Date(data.timestamp).toLocaleString()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agent Test Report - ${timestamp}</title>
  <style>
    :root {
      --bg-primary: #ffffff;
      --bg-secondary: #fafafa;
      --bg-tertiary: #f5f5f5;
      --text-primary: #000000;
      --text-secondary: #666666;
      --text-muted: #999999;
      --border-color: #e0e0e0;
      --border-dark: #cccccc;
      --success: #000000;
      --success-bg: #f0f0f0;
      --failure: #000000;
      --failure-bg: #f5f5f5;
      --accent: #000000;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header */
    .report-header {
      border-bottom: 2px solid var(--text-primary);
      padding-bottom: 2rem;
      margin-bottom: 2rem;
    }

    .report-title {
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
    }

    .report-timestamp {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    /* Summary Cards */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      padding: 1.5rem;
      text-align: center;
    }

    .summary-card.highlight {
      background: var(--text-primary);
      color: var(--bg-primary);
      border-color: var(--text-primary);
    }

    .summary-value {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .summary-label {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      opacity: 0.8;
    }

    /* Token Usage */
    .token-usage {
      background: var(--bg-tertiary);
      border: 1px solid var(--border-color);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .token-usage h3 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
      color: var(--text-secondary);
    }

    .token-bar {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      height: 24px;
      position: relative;
      margin-bottom: 0.5rem;
    }

    .token-bar-fill {
      background: var(--text-primary);
      height: 100%;
      transition: width 0.3s ease;
    }

    .token-stats {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    /* Suites */
    .suites-section {
      margin-top: 3rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .suite {
      border: 1px solid var(--border-color);
      margin-bottom: 1.5rem;
    }

    .suite-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
      flex-wrap: wrap;
      gap: 1rem;
    }

    .suite-title {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .suite-title h3 {
      font-size: 1.1rem;
      font-weight: 600;
    }

    .provider-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: 1px solid var(--text-primary);
    }

    .provider-badge.claude {
      background: var(--text-primary);
      color: var(--bg-primary);
    }

    .provider-badge.openai {
      background: var(--bg-primary);
      color: var(--text-primary);
    }

    .suite-stats {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .stat {
      font-size: 0.85rem;
      padding: 0.25rem 0.5rem;
    }

    .stat.passed {
      border-left: 3px solid var(--text-primary);
    }

    .stat.failed {
      border-left: 3px solid var(--text-secondary);
      background: var(--bg-tertiary);
    }

    .stat.skipped {
      color: var(--text-muted);
    }

    .pass-rate {
      font-size: 1.25rem;
      font-weight: 700;
    }

    /* Tests */
    .suite-tests {
      padding: 1rem;
    }

    .test-card {
      border: 1px solid var(--border-color);
      margin-bottom: 0.75rem;
    }

    .test-card.passed {
      border-left: 4px solid var(--text-primary);
    }

    .test-card.failed {
      border-left: 4px solid var(--text-secondary);
      background: var(--bg-tertiary);
    }

    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .test-header:hover {
      background: var(--bg-secondary);
    }

    .test-status {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status-icon {
      font-size: 1.1rem;
      font-weight: bold;
    }

    .test-card.passed .status-icon {
      color: var(--text-primary);
    }

    .test-card.failed .status-icon {
      color: var(--text-secondary);
    }

    .test-name {
      font-weight: 500;
    }

    .test-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      color: var(--text-secondary);
      font-size: 0.85rem;
    }

    .test-category {
      padding: 0.125rem 0.5rem;
      background: var(--bg-tertiary);
      border-radius: 2px;
    }

    .expand-icon {
      transition: transform 0.2s ease;
    }

    .test-details {
      display: none;
      padding: 1rem;
      border-top: 1px solid var(--border-color);
      background: var(--bg-primary);
    }

    .test-details.open {
      display: block;
    }

    .test-error {
      background: var(--bg-tertiary);
      border-left: 3px solid var(--text-secondary);
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 0.85rem;
    }

    .test-assertions {
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      background: var(--bg-secondary);
    }

    /* Chat Transcript */
    .chat-transcript h4 {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .chat-message {
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
    }

    .chat-message.user {
      background: var(--bg-primary);
      border-left: 3px solid var(--text-primary);
    }

    .chat-message.assistant {
      background: var(--bg-secondary);
      border-left: 3px solid var(--text-secondary);
    }

    .chat-message.system {
      background: var(--bg-tertiary);
      border-left: 3px solid var(--text-muted);
      font-style: italic;
    }

    .chat-message.tool {
      background: var(--bg-tertiary);
      border: 1px dashed var(--border-color);
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 0.85rem;
    }

    .chat-role {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-secondary);
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .chat-content {
      white-space: pre-wrap;
      word-break: break-word;
    }

    .no-chat {
      color: var(--text-muted);
      font-style: italic;
      padding: 1rem;
      text-align: center;
    }

    /* Footer */
    .report-footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }

      .report-title {
        font-size: 1.75rem;
      }

      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .suite-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .test-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .test-meta {
        width: 100%;
        justify-content: space-between;
      }
    }

    /* Print styles */
    @media print {
      body {
        padding: 0;
      }

      .test-details {
        display: block !important;
      }

      .expand-icon {
        display: none;
      }
    }
  </style>
</head>
<body>
  <header class="report-header">
    <h1 class="report-title">Agent Test Report</h1>
    <p class="report-timestamp">Generated: ${timestamp}</p>
  </header>

  <section class="summary-grid">
    <div class="summary-card highlight">
      <div class="summary-value">${data.summary.passRate}</div>
      <div class="summary-label">Pass Rate</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.total}</div>
      <div class="summary-label">Total Tests</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.passed}</div>
      <div class="summary-label">Passed</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.failed}</div>
      <div class="summary-label">Failed</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.skipped}</div>
      <div class="summary-label">Skipped</div>
    </div>
    <div class="summary-card">
      <div class="summary-value">${data.summary.duration}</div>
      <div class="summary-label">Duration</div>
    </div>
  </section>

  <section class="token-usage">
    <h3>Token Budget</h3>
    <div class="token-bar">
      <div class="token-bar-fill" style="width: ${Math.min(100, (data.tokenUsage.used / data.tokenUsage.budget) * 100)}%"></div>
    </div>
    <div class="token-stats">
      <span>Used: ${data.tokenUsage.used.toLocaleString()} / ${data.tokenUsage.budget.toLocaleString()}</span>
      <span>${((data.tokenUsage.used / data.tokenUsage.budget) * 100).toFixed(1)}%</span>
    </div>
  </section>

  <section class="suites-section">
    <h2 class="section-title">Test Suites</h2>
    ${data.suites.map((suite, i) => generateSuiteHtml(suite, i)).join('\n')}
  </section>

  <footer class="report-footer">
    <p>Agent Workshop Test Framework</p>
  </footer>

  <script>
    function toggleTest(id) {
      const details = document.getElementById(id);
      const header = details.previousElementSibling;
      const icon = header.querySelector('.expand-icon');

      details.classList.toggle('open');
      icon.style.transform = details.classList.contains('open') ? 'rotate(180deg)' : '';
    }

    // Auto-expand failed tests
    document.querySelectorAll('.test-card.failed .test-details').forEach(el => {
      el.classList.add('open');
      el.previousElementSibling.querySelector('.expand-icon').style.transform = 'rotate(180deg)';
    });
  </script>
</body>
</html>`
}

// ============================================================================
// File Operations
// ============================================================================

export function saveHtmlReport(data: ReportData, outputPath: string): void {
  const html = generateHtmlReport(data)
  const dir = path.dirname(outputPath)

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(outputPath, html)
}

export function openReportInBrowser(reportPath: string): void {
  const { exec } = require('child_process')
  const platform = process.platform

  const command = platform === 'darwin'
    ? `open "${reportPath}"`
    : platform === 'win32'
      ? `start "" "${reportPath}"`
      : `xdg-open "${reportPath}"`

  exec(command, (error: Error | null) => {
    if (error) {
      console.log(`Report saved to: ${reportPath}`)
    }
  })
}
