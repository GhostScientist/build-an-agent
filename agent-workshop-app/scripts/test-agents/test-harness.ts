import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import * as path from 'path'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp?: Date
  toolName?: string
}

/** Simplified history format for passing to agents */
export interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AgentResponse {
  text: string
  duration: number
  exitCode: number | null
  error?: string
  chat: ChatMessage[]
}

export interface HarnessOptions {
  timeout: number
  env: Record<string, string>
  verbose: boolean
}

const DEFAULT_OPTIONS: HarnessOptions = {
  timeout: 60000,
  env: {},
  verbose: false
}

/**
 * TestHarness spawns and communicates with generated agent CLIs
 * Sends prompts via command line arguments and captures stdout responses
 */
export class TestHarness extends EventEmitter {
  private agentDir: string
  private options: HarnessOptions
  private process: ChildProcess | null = null

  constructor(agentDir: string, options: Partial<HarnessOptions> = {}) {
    super()
    this.agentDir = agentDir
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  /**
   * Send a single query to the agent and get the response
   * @param prompt The user query
   * @param history Optional conversation history for multi-turn context
   */
  async query(prompt: string, history: HistoryMessage[] = []): Promise<AgentResponse> {
    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      const cliPath = path.join(this.agentDir, 'dist', 'cli.js')

      // Build environment with API keys
      const env = {
        ...process.env,
        ...this.options.env,
        // Ensure we don't get interactive prompts
        CI: 'true',
        FORCE_COLOR: '0'
      }

      if (this.options.verbose) {
        console.log(`[Harness] Spawning: node ${cliPath} "${prompt}"`)
        if (history.length > 0) {
          console.log(`[Harness] With ${history.length} history messages`)
        }
      }

      // Spawn the CLI with the query as an argument
      const child = spawn('node', [cliPath, prompt], {
        cwd: this.agentDir,
        env,
        stdio: ['pipe', 'pipe', 'pipe']
      })

      this.process = child
      let stdout = ''
      let stderr = ''

      // Write history to stdin if provided
      if (history.length > 0) {
        child.stdin?.write(JSON.stringify(history))
      }
      child.stdin?.end()

      child.stdout?.on('data', (data) => {
        const chunk = data.toString()
        stdout += chunk
        if (this.options.verbose) {
          process.stdout.write(chunk)
        }
      })

      child.stderr?.on('data', (data) => {
        const chunk = data.toString()
        stderr += chunk
        if (this.options.verbose) {
          process.stderr.write(chunk)
        }
      })

      // Set timeout
      const timeoutId = setTimeout(() => {
        child.kill('SIGTERM')
        reject(new Error(`Agent timed out after ${this.options.timeout}ms`))
      }, this.options.timeout)

      child.on('close', (code) => {
        clearTimeout(timeoutId)
        this.process = null

        const duration = Date.now() - startTime
        const cleanedOutput = this.cleanOutput(stdout)

        // Build chat transcript
        const chat: ChatMessage[] = [
          {
            role: 'user',
            content: prompt,
            timestamp: new Date(startTime)
          },
          {
            role: 'assistant',
            content: cleanedOutput,
            timestamp: new Date()
          }
        ]

        // Parse tool uses from output if present
        const toolRegex = /🔧 Using tool: (\w+)/g
        let toolMatch
        while ((toolMatch = toolRegex.exec(stdout)) !== null) {
          chat.push({
            role: 'tool',
            content: `Tool invoked: ${toolMatch[1]}`,
            timestamp: new Date(),
            toolName: toolMatch[1]
          })
        }

        resolve({
          text: cleanedOutput,
          duration,
          exitCode: code,
          error: stderr || undefined,
          chat
        })
      })

      child.on('error', (err) => {
        clearTimeout(timeoutId)
        this.process = null
        reject(err)
      })
    })
  }

  /**
   * Run multiple turns in sequence (for multi-turn tests)
   * Note: Each turn is a separate process invocation
   * Context persistence depends on agent's session management
   */
  async multiTurn(prompts: string[]): Promise<AgentResponse[]> {
    const responses: AgentResponse[] = []

    for (const prompt of prompts) {
      const response = await this.query(prompt)
      responses.push(response)

      // If agent exited with error, stop the sequence
      if (response.exitCode !== 0 && response.exitCode !== null) {
        break
      }
    }

    return responses
  }

  /**
   * Kill any running process
   */
  kill(): void {
    if (this.process) {
      this.process.kill('SIGTERM')
      this.process = null
    }
  }

  /**
   * Clean up agent output by removing ANSI codes, spinners, and other noise
   */
  private cleanOutput(output: string): string {
    return output
      // Remove ANSI escape codes
      .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
      // Remove carriage returns (spinner updates)
      .replace(/\r/g, '')
      // Remove common spinner characters
      .replace(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/g, '')
      // Remove "thinking..." patterns
      .replace(/thinking\.{1,3}/gi, '')
      // Collapse multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim whitespace
      .trim()
  }
}

/**
 * Build the agent if not already built
 */
export async function ensureBuilt(agentDir: string, verbose = false): Promise<boolean> {
  const { execSync } = await import('child_process')
  const fs = await import('fs')

  const distDir = path.join(agentDir, 'dist')
  const cliPath = path.join(distDir, 'cli.js')

  // Check if already built
  if (fs.existsSync(cliPath)) {
    if (verbose) console.log(`[Harness] Agent already built: ${agentDir}`)
    return true
  }

  // Check if node_modules exists
  const nodeModulesDir = path.join(agentDir, 'node_modules')
  if (!fs.existsSync(nodeModulesDir)) {
    if (verbose) console.log(`[Harness] Installing dependencies...`)
    try {
      execSync('npm install', { cwd: agentDir, stdio: verbose ? 'inherit' : 'pipe' })
    } catch (err) {
      console.error(`[Harness] npm install failed for ${agentDir}`)
      return false
    }
  }

  // Build the agent
  if (verbose) console.log(`[Harness] Building agent...`)
  try {
    execSync('npm run build', { cwd: agentDir, stdio: verbose ? 'inherit' : 'pipe' })
    return true
  } catch (err) {
    console.error(`[Harness] Build failed for ${agentDir}`)
    return false
  }
}

/**
 * Check if required API keys are available
 */
export function checkApiKeys(provider: 'claude' | 'openai' | 'copilot'): { available: boolean; key?: string } {
  if (provider === 'claude') {
    const key = process.env.ANTHROPIC_API_KEY
    return { available: !!key, key }
  } else if (provider === 'openai') {
    const key = process.env.OPENAI_API_KEY
    return { available: !!key, key }
  } else {
    const key = process.env.GITHUB_TOKEN
    return { available: !!key, key }
  }
}
