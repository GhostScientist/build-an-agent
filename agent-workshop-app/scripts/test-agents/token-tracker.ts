/**
 * TokenTracker manages API token budget for cost-conscious testing
 */

export interface TokenUsage {
  estimated: number
  actual?: number
}

export interface TokenReport {
  budget: number
  used: number
  remaining: number
  tests: Array<{
    name: string
    estimated: number
    actual?: number
  }>
  overBudget: boolean
}

export class TokenTracker {
  private budget: number
  private used: number = 0
  private tests: Array<{ name: string; estimated: number; actual?: number }> = []

  constructor(budget: number = 5000) {
    this.budget = budget
  }

  /**
   * Check if we can proceed with a test given its estimated token usage
   */
  canProceed(estimatedTokens: number): boolean {
    return (this.used + estimatedTokens) <= this.budget
  }

  /**
   * Record token usage for a test
   */
  record(testName: string, estimated: number, actual?: number): void {
    this.tests.push({ name: testName, estimated, actual })
    // Use actual if available, otherwise use estimated
    this.used += actual ?? estimated
  }

  /**
   * Get remaining budget
   */
  getRemaining(): number {
    return Math.max(0, this.budget - this.used)
  }

  /**
   * Get total used
   */
  getUsed(): number {
    return this.used
  }

  /**
   * Check if over budget
   */
  isOverBudget(): boolean {
    return this.used > this.budget
  }

  /**
   * Get full report
   */
  getReport(): TokenReport {
    return {
      budget: this.budget,
      used: this.used,
      remaining: this.getRemaining(),
      tests: this.tests,
      overBudget: this.isOverBudget()
    }
  }

  /**
   * Format report for console output
   */
  formatReport(): string {
    const report = this.getReport()
    const percentage = ((report.used / report.budget) * 100).toFixed(1)
    const status = report.overBudget ? '⚠️  OVER BUDGET' : '✓'

    let output = `\n📊 Token Usage Report\n`
    output += `${'─'.repeat(40)}\n`
    output += `Budget:    ${report.budget.toLocaleString()} tokens\n`
    output += `Used:      ${report.used.toLocaleString()} tokens (${percentage}%)\n`
    output += `Remaining: ${report.remaining.toLocaleString()} tokens\n`
    output += `Status:    ${status}\n`

    if (report.tests.length > 0) {
      output += `\nPer-test breakdown:\n`
      for (const test of report.tests) {
        const actualStr = test.actual !== undefined
          ? ` (actual: ${test.actual})`
          : ''
        output += `  • ${test.name}: ~${test.estimated}${actualStr}\n`
      }
    }

    return output
  }

  /**
   * Reset tracker for new run
   */
  reset(): void {
    this.used = 0
    this.tests = []
  }

  /**
   * Set new budget
   */
  setBudget(budget: number): void {
    this.budget = budget
  }
}

/**
 * Estimate tokens from text (rough approximation)
 * ~4 characters per token for English text
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Default budget levels
 */
export const BUDGET_LEVELS = {
  minimal: 1000,   // ~3-4 simple tests
  quick: 2500,     // ~6-8 tests
  standard: 5000,  // ~12-15 tests
  full: 10000      // Full test suite
} as const
