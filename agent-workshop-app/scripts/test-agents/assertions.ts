/**
 * Assertion types for validating agent responses
 * Designed to handle non-deterministic LLM outputs
 */

export interface Assertion {
  type: string
  value?: string | number
  values?: string[]
}

export interface AssertionResult {
  passed: boolean
  assertion: Assertion
  message: string
  actual?: string
}

/**
 * Run a single assertion against a response
 */
export function runAssertion(response: string, assertion: Assertion): AssertionResult {
  const normalizedResponse = response.toLowerCase()

  switch (assertion.type) {
    case 'notEmpty':
      return {
        passed: response.trim().length > 0,
        assertion,
        message: response.trim().length > 0
          ? 'Response is not empty'
          : 'Response is empty',
        actual: `Length: ${response.trim().length}`
      }

    case 'minLength':
      const minLen = assertion.value as number
      return {
        passed: response.length >= minLen,
        assertion,
        message: response.length >= minLen
          ? `Response length (${response.length}) >= ${minLen}`
          : `Response length (${response.length}) < ${minLen}`,
        actual: `Length: ${response.length}`
      }

    case 'maxLength':
      const maxLen = assertion.value as number
      return {
        passed: response.length <= maxLen,
        assertion,
        message: response.length <= maxLen
          ? `Response length (${response.length}) <= ${maxLen}`
          : `Response length (${response.length}) > ${maxLen}`,
        actual: `Length: ${response.length}`
      }

    case 'containsText':
      const searchText = (assertion.value as string).toLowerCase()
      const contains = normalizedResponse.includes(searchText)
      return {
        passed: contains,
        assertion,
        message: contains
          ? `Response contains "${assertion.value}"`
          : `Response does not contain "${assertion.value}"`,
        actual: response.substring(0, 200) + (response.length > 200 ? '...' : '')
      }

    case 'containsAny':
      const searchValues = assertion.values || []
      const foundValue = searchValues.find(v => normalizedResponse.includes(v.toLowerCase()))
      return {
        passed: !!foundValue,
        assertion,
        message: foundValue
          ? `Response contains "${foundValue}"`
          : `Response does not contain any of: ${searchValues.join(', ')}`,
        actual: response.substring(0, 200) + (response.length > 200 ? '...' : '')
      }

    case 'containsAll':
      const allValues = assertion.values || []
      const missingValues = allValues.filter(v => !normalizedResponse.includes(v.toLowerCase()))
      return {
        passed: missingValues.length === 0,
        assertion,
        message: missingValues.length === 0
          ? `Response contains all required values`
          : `Response missing: ${missingValues.join(', ')}`,
        actual: response.substring(0, 200) + (response.length > 200 ? '...' : '')
      }

    case 'matchesPattern':
      const pattern = new RegExp(assertion.value as string, 'i')
      const matches = pattern.test(response)
      return {
        passed: matches,
        assertion,
        message: matches
          ? `Response matches pattern /${assertion.value}/`
          : `Response does not match pattern /${assertion.value}/`,
        actual: response.substring(0, 200) + (response.length > 200 ? '...' : '')
      }

    case 'notContains':
      const excludeText = (assertion.value as string).toLowerCase()
      const notContains = !normalizedResponse.includes(excludeText)
      return {
        passed: notContains,
        assertion,
        message: notContains
          ? `Response does not contain "${assertion.value}"`
          : `Response unexpectedly contains "${assertion.value}"`,
        actual: response.substring(0, 200) + (response.length > 200 ? '...' : '')
      }

    case 'isRefusal':
      const refusalPatterns = [
        'i cannot',
        'i can\'t',
        'i am unable',
        'i\'m unable',
        'i don\'t have access',
        'i do not have access',
        'not allowed',
        'not permitted'
      ]
      const isRefusal = refusalPatterns.some(p => normalizedResponse.includes(p))
      return {
        passed: isRefusal,
        assertion,
        message: isRefusal
          ? 'Response is a refusal'
          : 'Response is not a refusal',
        actual: response.substring(0, 200) + (response.length > 200 ? '...' : '')
      }

    case 'isNotRefusal':
      const refusalPatterns2 = [
        'i cannot',
        'i can\'t',
        'i am unable',
        'i\'m unable',
        'i don\'t have access',
        'i do not have access',
        'not allowed',
        'not permitted'
      ]
      const isNotRefusal = !refusalPatterns2.some(p => normalizedResponse.includes(p))
      return {
        passed: isNotRefusal,
        assertion,
        message: isNotRefusal
          ? 'Response is not a refusal'
          : 'Response is a refusal',
        actual: response.substring(0, 200) + (response.length > 200 ? '...' : '')
      }

    default:
      return {
        passed: false,
        assertion,
        message: `Unknown assertion type: ${assertion.type}`,
        actual: undefined
      }
  }
}

/**
 * Run all assertions against a response
 */
export function runAssertions(response: string, assertions: Assertion[]): AssertionResult[] {
  return assertions.map(assertion => runAssertion(response, assertion))
}

/**
 * Check if all assertions passed
 */
export function allPassed(results: AssertionResult[]): boolean {
  return results.every(r => r.passed)
}

/**
 * Format assertion results for display
 */
export function formatResults(results: AssertionResult[]): string {
  return results.map(r => {
    const icon = r.passed ? '✓' : '✗'
    return `  ${icon} ${r.message}`
  }).join('\n')
}
