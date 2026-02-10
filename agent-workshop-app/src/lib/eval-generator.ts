// Eval-specific generator functions for the evaluation domain.
// Each function returns a TypeScript (or Python/YAML) source string
// that gets written into the generated project.

export function generateEvalExecutor(): string {
  return `import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import chalk from 'chalk';
import ora from 'ora';
import { SpecParser, type EvalSpec } from './spec-parser.js';
import { TaskRegistry, createDefaultRegistry } from './task-registry.js';
import { ResultsManager } from './results-manager.js';
import { ReportGenerator } from './report-generator.js';

export interface EvalContext {
  runId: string;
  targetDir: string;
  workingDir: string;
  verbose: boolean;
  apiKey?: string;
}

export class EvalExecutor {
  private specParser: SpecParser;
  private registry: TaskRegistry;
  private resultsManager: ResultsManager;
  private reportGenerator: ReportGenerator;
  private verbose: boolean;
  private apiKey?: string;

  constructor(options: { verbose?: boolean; apiKey?: string } = {}) {
    this.specParser = new SpecParser();
    this.registry = createDefaultRegistry();
    this.resultsManager = new ResultsManager();
    this.reportGenerator = new ReportGenerator();
    this.verbose = options.verbose || false;
    this.apiKey = options.apiKey;
  }

  async init(specPath: string): Promise<string> {
    const spinner = ora('Parsing eval spec...').start();

    try {
      // Parse and validate the spec
      const spec = this.specParser.parse(specPath);
      spinner.text = 'Creating eval run...';

      // Resolve target directory
      let targetDir: string;
      if (spec.target.repo) {
        if (spec.target.repo.startsWith('http') || spec.target.repo.startsWith('git@')) {
          // Git clone
          const { execSync } = await import('child_process');
          const tmpDir = path.join('.eval-runs', 'targets', spec.name);
          fs.mkdirSync(tmpDir, { recursive: true });
          execSync(\`git clone \${spec.target.repo} \${tmpDir}\`, { stdio: 'pipe' });
          if (spec.target.ref) {
            execSync(\`git checkout \${spec.target.ref}\`, { cwd: tmpDir, stdio: 'pipe' });
          }
          targetDir = path.resolve(tmpDir);
        } else {
          targetDir = path.resolve(spec.target.repo);
        }
      } else {
        targetDir = process.cwd();
      }

      if (!fs.existsSync(targetDir)) {
        throw new Error(\`Target directory not found: \${targetDir}\`);
      }

      // Create run
      const runId = this.resultsManager.createRun();

      // Compute spec hash for reproducibility
      const specContent = fs.readFileSync(specPath, 'utf-8');
      const specHash = crypto.createHash('sha256').update(specContent).digest('hex').slice(0, 16);

      // Check Docker availability
      let dockerAvailable = false;
      try {
        const { execSync } = await import('child_process');
        execSync('docker info', { stdio: 'pipe' });
        dockerAvailable = true;
      } catch {}

      // Write manifest
      const manifest = {
        runId,
        specName: spec.name,
        specVersion: spec.version,
        specHash,
        startedAt: new Date().toISOString(),
        status: 'initialized' as const,
        target: {
          repo: spec.target.repo,
          ref: spec.target.ref,
          dataset: spec.target.dataset,
          resolvedPath: targetDir,
        },
        environment: {
          node: process.version,
          platform: process.platform,
          arch: process.arch,
          docker: dockerAvailable,
        },
        taskCount: spec.tasks.length,
        taskIds: spec.tasks.map(t => t.id),
      };

      this.resultsManager.writeManifest(runId, manifest);

      spinner.succeed(\`Eval run initialized: \${chalk.cyan(runId)}\`);
      console.log(chalk.gray(\`  Spec: \${spec.name} v\${spec.version}\`));
      console.log(chalk.gray(\`  Target: \${targetDir}\`));
      console.log(chalk.gray(\`  Tasks: \${spec.tasks.length} (\${spec.tasks.map(t => t.id).join(', ')})\`));
      console.log(chalk.gray(\`  Spec hash: \${specHash}\`));

      return runId;
    } catch (error) {
      spinner.fail('Failed to initialize eval run');
      throw error;
    }
  }

  async run(runIdOrSpec?: string): Promise<void> {
    let runId: string;

    if (runIdOrSpec && runIdOrSpec.endsWith('.yaml') || runIdOrSpec?.endsWith('.yml') || runIdOrSpec?.endsWith('.json')) {
      // Initialize from spec file first
      runId = await this.init(runIdOrSpec);
    } else if (runIdOrSpec) {
      runId = runIdOrSpec;
    } else {
      // Find latest run
      const runs = this.resultsManager.listRuns();
      if (runs.length === 0) {
        throw new Error('No eval runs found. Use /eval-init <spec> first.');
      }
      runId = runs[0].runId;
    }

    const manifest = this.resultsManager.readManifest(runId);
    if (!manifest) {
      throw new Error(\`Run not found: \${runId}\`);
    }

    // Re-parse spec to get task definitions
    // Find the spec file by searching eval-specs/
    const specDir = 'eval-specs';
    let spec: EvalSpec | null = null;
    if (fs.existsSync(specDir)) {
      const specFiles = fs.readdirSync(specDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml') || f.endsWith('.json'));
      for (const f of specFiles) {
        try {
          const parsed = this.specParser.parse(path.join(specDir, f));
          if (parsed.name === manifest.specName) {
            spec = parsed;
            break;
          }
        } catch {}
      }
    }

    if (!spec) {
      throw new Error(\`Could not find spec "\${manifest.specName}" in eval-specs/\`);
    }

    // Update manifest status
    manifest.status = 'running';
    this.resultsManager.writeManifest(runId, manifest);

    console.log(chalk.cyan.bold(\`\\nRunning eval: \${spec.name} v\${spec.version}\`));
    console.log(chalk.gray(\`Run ID: \${runId}\\n\`));

    const ctx: EvalContext = {
      runId,
      targetDir: manifest.target.resolvedPath,
      workingDir: process.cwd(),
      verbose: this.verbose,
      apiKey: this.apiKey,
    };

    let totalCost = 0;
    let hasFailure = false;

    for (const task of spec.tasks) {
      const taskSpinner = ora(\`Running task: \${task.id} (\${task.type})\`).start();

      try {
        const handler = this.registry.get(task.type);
        if (!handler) {
          const result = {
            taskId: task.id,
            type: task.type,
            status: 'error' as const,
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            durationMs: 0,
            metrics: {},
            criteria: {},
            error: \`Unknown task type: \${task.type}. Register a handler with registry.register().\`,
          };
          this.resultsManager.writeTaskResult(runId, task.id, result);
          taskSpinner.warn(\`Task \${task.id}: unknown type "\${task.type}"\`);
          hasFailure = true;
          continue;
        }

        const result = await handler.execute(task, ctx);
        this.resultsManager.writeTaskResult(runId, task.id, result);

        if (result.estimatedCost) {
          totalCost += result.estimatedCost.amount;
        }

        if (result.status === 'pass') {
          taskSpinner.succeed(\`Task \${task.id}: \${chalk.green('PASS')} (\${result.durationMs}ms)\`);
        } else if (result.status === 'fail') {
          taskSpinner.fail(\`Task \${task.id}: \${chalk.red('FAIL')} (\${result.durationMs}ms)\`);
          hasFailure = true;
        } else if (result.status === 'skip') {
          taskSpinner.info(\`Task \${task.id}: \${chalk.yellow('SKIP')} - \${result.error || 'skipped'}\`);
        } else {
          taskSpinner.fail(\`Task \${task.id}: \${chalk.red('ERROR')} - \${result.error}\`);
          hasFailure = true;
        }

        // Show metrics in verbose mode
        if (this.verbose && Object.keys(result.metrics).length > 0) {
          for (const [key, value] of Object.entries(result.metrics)) {
            console.log(chalk.gray(\`    \${key}: \${value}\`));
          }
        }

        // Show cost if applicable
        if (result.estimatedCost) {
          console.log(chalk.gray(\`    Cost: $\${result.estimatedCost.amount.toFixed(4)}\`));
        }
      } catch (error) {
        const result = {
          taskId: task.id,
          type: task.type,
          status: 'error' as const,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: 0,
          metrics: {},
          criteria: {},
          error: error instanceof Error ? error.message : String(error),
        };
        this.resultsManager.writeTaskResult(runId, task.id, result);
        taskSpinner.fail(\`Task \${task.id}: \${chalk.red('ERROR')} - \${result.error}\`);
        hasFailure = true;
      }
    }

    // Update manifest
    manifest.status = hasFailure ? 'failed' : 'completed';
    manifest.completedAt = new Date().toISOString();
    if (totalCost > 0) {
      manifest.totalCost = { amount: totalCost, currency: 'USD' };
    }
    this.resultsManager.writeManifest(runId, manifest);

    console.log(chalk.cyan(\`\\nEval run \${manifest.status}: \${runId}\`));
    if (totalCost > 0) {
      console.log(chalk.gray(\`Total cost: $\${totalCost.toFixed(4)}\`));
    }
  }

  async report(runId?: string): Promise<void> {
    if (!runId) {
      const runs = this.resultsManager.listRuns();
      if (runs.length === 0) {
        throw new Error('No eval runs found.');
      }
      runId = runs[0].runId;
    }

    const manifest = this.resultsManager.readManifest(runId);
    if (!manifest) {
      throw new Error(\`Run not found: \${runId}\`);
    }

    const taskResults = this.resultsManager.readAllTaskResults(runId);

    // Find baselines from spec if available
    let baselines: Record<string, number> | undefined;
    const specDir = 'eval-specs';
    if (fs.existsSync(specDir)) {
      const specFiles = fs.readdirSync(specDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml') || f.endsWith('.json'));
      for (const f of specFiles) {
        try {
          const parsed = this.specParser.parse(path.join(specDir, f));
          if (parsed.name === manifest.specName && parsed.baselines) {
            baselines = parsed.baselines;
            break;
          }
        } catch {}
      }
    }

    const summaryJson = this.reportGenerator.generateJSON(manifest, taskResults, baselines);
    const summaryMd = this.reportGenerator.generateMarkdown(manifest, taskResults, baselines);

    this.resultsManager.writeSummary(runId, summaryJson, summaryMd);

    // Print the markdown report to console
    console.log(summaryMd);
    console.log(chalk.gray(\`\\nReport saved to .eval-runs/\${runId}/summary.json and summary.md\`));
  }

  async compare(runId1: string, runId2: string): Promise<void> {
    const manifest1 = this.resultsManager.readManifest(runId1);
    const manifest2 = this.resultsManager.readManifest(runId2);

    if (!manifest1 || !manifest2) {
      throw new Error('One or both runs not found.');
    }

    const results1 = this.resultsManager.readAllTaskResults(runId1);
    const results2 = this.resultsManager.readAllTaskResults(runId2);

    const summary1 = this.reportGenerator.generateJSON(manifest1, results1);
    const summary2 = this.reportGenerator.generateJSON(manifest2, results2);

    // Build comparison table
    console.log(chalk.cyan.bold('\\nEval Comparison'));
    console.log(chalk.gray(\`Run A: \${runId1}\`));
    console.log(chalk.gray(\`Run B: \${runId2}\\n\`));

    // Header
    const header = \`\${'Task'.padEnd(25)} \${'Status A'.padEnd(10)} \${'Status B'.padEnd(10)} \${'Delta'.padEnd(15)} \${'Notes'}\`;
    console.log(chalk.white.bold(header));
    console.log(chalk.gray('-'.repeat(80)));

    const s1Tasks = new Map(summary1.tasks.map(t => [t.taskId, t]));
    const s2Tasks = new Map(summary2.tasks.map(t => [t.taskId, t]));

    const allTaskIds = new Set([...s1Tasks.keys(), ...s2Tasks.keys()]);

    for (const taskId of allTaskIds) {
      const t1 = s1Tasks.get(taskId);
      const t2 = s2Tasks.get(taskId);

      const status1 = t1?.status || 'N/A';
      const status2 = t2?.status || 'N/A';

      let delta = '';
      let note = '';

      if (status1 === 'pass' && status2 === 'fail') {
        delta = chalk.red('REGRESSION');
        note = 'Was passing, now failing';
      } else if (status1 === 'fail' && status2 === 'pass') {
        delta = chalk.green('IMPROVEMENT');
        note = 'Was failing, now passing';
      } else if (status1 === status2) {
        delta = chalk.gray('unchanged');
      } else {
        delta = \`\${status1} -> \${status2}\`;
      }

      // Check metric changes
      if (t1 && t2) {
        const durationDelta = t2.durationMs - t1.durationMs;
        if (Math.abs(durationDelta) > 1000) {
          note += \` Duration: \${durationDelta > 0 ? '+' : ''}\${(durationDelta / 1000).toFixed(1)}s\`;
        }
      }

      const statusColor1 = status1 === 'pass' ? chalk.green(status1) : status1 === 'fail' ? chalk.red(status1) : chalk.yellow(status1);
      const statusColor2 = status2 === 'pass' ? chalk.green(status2) : status2 === 'fail' ? chalk.red(status2) : chalk.yellow(status2);

      console.log(\`\${taskId.padEnd(25)} \${statusColor1.padEnd(19)} \${statusColor2.padEnd(19)} \${delta.padEnd(24)} \${chalk.gray(note)}\`);
    }

    // Cost comparison
    if (summary1.totalCost.amount > 0 || summary2.totalCost.amount > 0) {
      console.log(chalk.gray('\\n--- Cost ---'));
      console.log(chalk.gray(\`Run A: $\${summary1.totalCost.amount.toFixed(4)}\`));
      console.log(chalk.gray(\`Run B: $\${summary2.totalCost.amount.toFixed(4)}\`));
      const costDelta = summary2.totalCost.amount - summary1.totalCost.amount;
      console.log(chalk.gray(\`Delta: \${costDelta >= 0 ? '+' : ''}$\${costDelta.toFixed(4)}\`));
    }

    // Baseline comparison
    if (summary2.baselineComparison) {
      console.log(chalk.cyan('\\n--- Baseline Comparison ---'));
      for (const [name, data] of Object.entries(summary2.baselineComparison)) {
        const deltaStr = data.delta >= 0 ? chalk.green(\`+\${data.delta.toFixed(2)}\`) : chalk.red(data.delta.toFixed(2));
        console.log(\`  \${name}: baseline=\${data.baseline.toFixed(2)} actual=\${data.actual.toFixed(2)} delta=\${deltaStr}\`);
      }
    }
  }

  async history(options: { spec?: string; limit?: number } = {}): Promise<void> {
    const runs = this.resultsManager.listRuns();
    let filtered = runs;

    if (options.spec) {
      filtered = filtered.filter(r => r.specName === options.spec);
    }

    const limit = options.limit || 20;
    filtered = filtered.slice(0, limit);

    if (filtered.length === 0) {
      console.log(chalk.yellow('No eval runs found.'));
      return;
    }

    console.log(chalk.cyan.bold('\\nEval History'));
    console.log(chalk.gray(\`Showing \${filtered.length} of \${runs.length} runs\\n\`));

    const header = \`\${'Run ID'.padEnd(20)} \${'Spec'.padEnd(20)} \${'Status'.padEnd(12)} \${'Tasks'.padEnd(8)} \${'Cost'.padEnd(10)} \${'Date'}\`;
    console.log(chalk.white.bold(header));
    console.log(chalk.gray('-'.repeat(90)));

    for (const run of filtered) {
      const statusColor = run.status === 'completed' ? chalk.green(run.status)
        : run.status === 'failed' ? chalk.red(run.status)
        : chalk.yellow(run.status);

      const cost = run.totalCost ? \`$\${run.totalCost.amount.toFixed(4)}\` : '-';
      const date = run.startedAt ? new Date(run.startedAt).toLocaleDateString() : '-';

      console.log(\`\${run.runId.padEnd(20)} \${(run.specName || '-').padEnd(20)} \${statusColor.padEnd(21)} \${String(run.taskCount || 0).padEnd(8)} \${cost.padEnd(10)} \${date}\`);
    }
  }
}
`;
}

export function generateTaskRegistry(): string {
  return `import { spawn } from 'child_process';
import * as path from 'path';
import type { EvalContext } from './eval-executor.js';

// ============================================================================
// Types
// ============================================================================

export interface EvalTask {
  id: string;
  type: string;
  command?: string;
  timeout?: number;
  criteria?: Record<string, any>;
  prompt_template?: string;
  context_files?: string[];
  parse_output?: 'json' | 'text';
  model?: string;
  max_tokens?: number;
  docker_registry?: string;
  config?: Record<string, any>;
}

export interface TaskResult {
  taskId: string;
  type: string;
  status: 'pass' | 'fail' | 'error' | 'skip';
  startedAt: string;
  completedAt: string;
  durationMs: number;
  command?: string;
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  metrics: Record<string, number>;
  criteria: Record<string, { expected: any; actual: any; passed: boolean }>;
  error?: string;
  judgment?: {
    scores: Record<string, number>;
    justifications: Record<string, string>;
    averageScore: number;
  };
  predictions?: Array<{ instanceId: string; patch: string; resolved: boolean }>;
  resolveRate?: number;
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens?: number;
  };
  estimatedCost?: {
    amount: number;
    currency: 'USD';
    model: string;
    breakdown?: { input: number; output: number; cacheRead?: number };
  };
}

export interface TaskHandler {
  type: string;
  execute(task: EvalTask, ctx: EvalContext): Promise<TaskResult>;
}

// ============================================================================
// Task Registry
// ============================================================================

export class TaskRegistry {
  private handlers: Map<string, TaskHandler> = new Map();

  register(handler: TaskHandler): void {
    this.handlers.set(handler.type, handler);
  }

  get(type: string): TaskHandler | undefined {
    return this.handlers.get(type);
  }

  has(type: string): boolean {
    return this.handlers.has(type);
  }

  listTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// ============================================================================
// Command execution helper
// ============================================================================

interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

function runCommand(command: string, cwd: string, timeout: number = 120): Promise<CommandResult> {
  return new Promise((resolve) => {
    const child = spawn(command, [], {
      shell: true,
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      resolve({ exitCode: 124, stdout, stderr: stderr + '\\nProcess timed out' });
    }, timeout * 1000);

    child.on('close', (code: number | null) => {
      clearTimeout(timer);
      resolve({ exitCode: code ?? 1, stdout, stderr });
    });

    child.on('error', (err: Error) => {
      clearTimeout(timer);
      resolve({ exitCode: 1, stdout, stderr: err.message });
    });
  });
}

// ============================================================================
// Built-in Handlers
// ============================================================================

export class BuildHandler implements TaskHandler {
  type = 'build';

  async execute(task: EvalTask, ctx: EvalContext): Promise<TaskResult> {
    const start = Date.now();
    const startedAt = new Date().toISOString();

    if (!task.command) {
      return {
        taskId: task.id, type: task.type, status: 'error',
        startedAt, completedAt: new Date().toISOString(), durationMs: Date.now() - start,
        metrics: {}, criteria: {}, error: 'No command specified for build task',
      };
    }

    const result = await runCommand(task.command, ctx.targetDir, task.timeout || 120);
    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - start;

    const criteria: Record<string, { expected: any; actual: any; passed: boolean }> = {};
    let allPassed = true;

    if (task.criteria?.exit_code !== undefined) {
      const passed = result.exitCode === task.criteria.exit_code;
      criteria['exit_code'] = { expected: task.criteria.exit_code, actual: result.exitCode, passed };
      if (!passed) allPassed = false;
    } else {
      // Default: expect exit code 0
      const passed = result.exitCode === 0;
      criteria['exit_code'] = { expected: 0, actual: result.exitCode, passed };
      if (!passed) allPassed = false;
    }

    return {
      taskId: task.id, type: task.type,
      status: allPassed ? 'pass' : 'fail',
      startedAt, completedAt, durationMs,
      command: task.command,
      exitCode: result.exitCode,
      stdout: result.stdout.slice(-10000),
      stderr: result.stderr.slice(-5000),
      metrics: { exit_code: result.exitCode },
      criteria,
    };
  }
}

export class TestHandler implements TaskHandler {
  type = 'test';

  async execute(task: EvalTask, ctx: EvalContext): Promise<TaskResult> {
    const start = Date.now();
    const startedAt = new Date().toISOString();

    if (!task.command) {
      return {
        taskId: task.id, type: task.type, status: 'error',
        startedAt, completedAt: new Date().toISOString(), durationMs: Date.now() - start,
        metrics: {}, criteria: {}, error: 'No command specified for test task',
      };
    }

    const result = await runCommand(task.command, ctx.targetDir, task.timeout || 300);
    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - start;

    const metrics: Record<string, number> = { exit_code: result.exitCode };
    const criteria: Record<string, { expected: any; actual: any; passed: boolean }> = {};
    let allPassed = true;

    // Try to parse JSON test output
    if (task.parse_output === 'json' || !task.parse_output) {
      try {
        // Look for JSON in stdout (handle test runners that add extra output)
        const jsonMatch = result.stdout.match(/\\{[\\s\\S]*\\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.numPassedTests !== undefined && parsed.numTotalTests !== undefined) {
            const passRate = parsed.numTotalTests > 0 ? parsed.numPassedTests / parsed.numTotalTests : 0;
            metrics['pass_rate'] = passRate;
            metrics['passed'] = parsed.numPassedTests;
            metrics['failed'] = parsed.numFailedTests || 0;
            metrics['total'] = parsed.numTotalTests;

            if (parsed.coverageMap?.total?.lines?.pct !== undefined) {
              metrics['coverage'] = parsed.coverageMap.total.lines.pct;
            }
          }
        }
      } catch {}
    }

    // Evaluate criteria
    if (task.criteria?.min_pass_rate !== undefined && metrics.pass_rate !== undefined) {
      const passed = metrics.pass_rate >= task.criteria.min_pass_rate;
      criteria['min_pass_rate'] = { expected: task.criteria.min_pass_rate, actual: metrics.pass_rate, passed };
      if (!passed) allPassed = false;
    }

    if (task.criteria?.exit_code !== undefined) {
      const passed = result.exitCode === task.criteria.exit_code;
      criteria['exit_code'] = { expected: task.criteria.exit_code, actual: result.exitCode, passed };
      if (!passed) allPassed = false;
    }

    if (task.criteria?.min_coverage !== undefined && metrics.coverage !== undefined) {
      const passed = metrics.coverage >= task.criteria.min_coverage;
      criteria['min_coverage'] = { expected: task.criteria.min_coverage, actual: metrics.coverage, passed };
      if (!passed) allPassed = false;
    }

    // If no criteria matched, default to exit code check
    if (Object.keys(criteria).length === 0) {
      const passed = result.exitCode === 0;
      criteria['exit_code'] = { expected: 0, actual: result.exitCode, passed };
      if (!passed) allPassed = false;
    }

    return {
      taskId: task.id, type: task.type,
      status: allPassed ? 'pass' : 'fail',
      startedAt, completedAt, durationMs,
      command: task.command,
      exitCode: result.exitCode,
      stdout: result.stdout.slice(-10000),
      stderr: result.stderr.slice(-5000),
      metrics, criteria,
    };
  }
}

export class LintHandler implements TaskHandler {
  type = 'lint';

  async execute(task: EvalTask, ctx: EvalContext): Promise<TaskResult> {
    const start = Date.now();
    const startedAt = new Date().toISOString();

    if (!task.command) {
      return {
        taskId: task.id, type: task.type, status: 'error',
        startedAt, completedAt: new Date().toISOString(), durationMs: Date.now() - start,
        metrics: {}, criteria: {}, error: 'No command specified for lint task',
      };
    }

    const result = await runCommand(task.command, ctx.targetDir, task.timeout || 120);
    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - start;

    const metrics: Record<string, number> = { exit_code: result.exitCode };
    const criteria: Record<string, { expected: any; actual: any; passed: boolean }> = {};
    let allPassed = true;

    // Try to parse ESLint JSON output
    try {
      const parsed = JSON.parse(result.stdout);
      if (Array.isArray(parsed)) {
        let errors = 0;
        let warnings = 0;
        for (const file of parsed) {
          errors += file.errorCount || 0;
          warnings += file.warningCount || 0;
        }
        metrics['errors'] = errors;
        metrics['warnings'] = warnings;
        metrics['files_checked'] = parsed.length;
      }
    } catch {}

    // Evaluate criteria
    if (task.criteria?.max_errors !== undefined && metrics.errors !== undefined) {
      const passed = metrics.errors <= task.criteria.max_errors;
      criteria['max_errors'] = { expected: task.criteria.max_errors, actual: metrics.errors, passed };
      if (!passed) allPassed = false;
    }

    if (task.criteria?.max_warnings !== undefined && metrics.warnings !== undefined) {
      const passed = metrics.warnings <= task.criteria.max_warnings;
      criteria['max_warnings'] = { expected: task.criteria.max_warnings, actual: metrics.warnings, passed };
      if (!passed) allPassed = false;
    }

    if (Object.keys(criteria).length === 0) {
      const passed = result.exitCode === 0;
      criteria['exit_code'] = { expected: 0, actual: result.exitCode, passed };
      if (!passed) allPassed = false;
    }

    return {
      taskId: task.id, type: task.type,
      status: allPassed ? 'pass' : 'fail',
      startedAt, completedAt, durationMs,
      command: task.command,
      exitCode: result.exitCode,
      stdout: result.stdout.slice(-10000),
      stderr: result.stderr.slice(-5000),
      metrics, criteria,
    };
  }
}

export class SecurityHandler implements TaskHandler {
  type = 'security';

  async execute(task: EvalTask, ctx: EvalContext): Promise<TaskResult> {
    const start = Date.now();
    const startedAt = new Date().toISOString();

    if (!task.command) {
      return {
        taskId: task.id, type: task.type, status: 'error',
        startedAt, completedAt: new Date().toISOString(), durationMs: Date.now() - start,
        metrics: {}, criteria: {}, error: 'No command specified for security task',
      };
    }

    const result = await runCommand(task.command, ctx.targetDir, task.timeout || 300);
    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - start;

    const metrics: Record<string, number> = { exit_code: result.exitCode };
    const criteria: Record<string, { expected: any; actual: any; passed: boolean }> = {};
    let allPassed = true;

    // Try to parse npm audit or similar JSON output
    try {
      const parsed = JSON.parse(result.stdout);
      if (parsed.metadata?.vulnerabilities) {
        const vulns = parsed.metadata.vulnerabilities;
        metrics['critical'] = vulns.critical || 0;
        metrics['high'] = vulns.high || 0;
        metrics['moderate'] = vulns.moderate || 0;
        metrics['low'] = vulns.low || 0;
        metrics['total_vulnerabilities'] = (vulns.critical || 0) + (vulns.high || 0) + (vulns.moderate || 0) + (vulns.low || 0);
      }
    } catch {}

    // Evaluate criteria
    if (task.criteria?.max_critical !== undefined && metrics.critical !== undefined) {
      const passed = metrics.critical <= task.criteria.max_critical;
      criteria['max_critical'] = { expected: task.criteria.max_critical, actual: metrics.critical, passed };
      if (!passed) allPassed = false;
    }

    if (task.criteria?.max_high !== undefined && metrics.high !== undefined) {
      const passed = metrics.high <= task.criteria.max_high;
      criteria['max_high'] = { expected: task.criteria.max_high, actual: metrics.high, passed };
      if (!passed) allPassed = false;
    }

    if (Object.keys(criteria).length === 0) {
      const passed = result.exitCode === 0;
      criteria['exit_code'] = { expected: 0, actual: result.exitCode, passed };
      if (!passed) allPassed = false;
    }

    return {
      taskId: task.id, type: task.type,
      status: allPassed ? 'pass' : 'fail',
      startedAt, completedAt, durationMs,
      command: task.command,
      exitCode: result.exitCode,
      stdout: result.stdout.slice(-10000),
      stderr: result.stderr.slice(-5000),
      metrics, criteria,
    };
  }
}

export class CustomHandler implements TaskHandler {
  type = 'custom';

  async execute(task: EvalTask, ctx: EvalContext): Promise<TaskResult> {
    const start = Date.now();
    const startedAt = new Date().toISOString();

    if (!task.command) {
      return {
        taskId: task.id, type: task.type, status: 'error',
        startedAt, completedAt: new Date().toISOString(), durationMs: Date.now() - start,
        metrics: {}, criteria: {}, error: 'No command specified for custom task',
      };
    }

    const result = await runCommand(task.command, ctx.targetDir, task.timeout || 120);
    const completedAt = new Date().toISOString();
    const durationMs = Date.now() - start;

    const metrics: Record<string, number> = { exit_code: result.exitCode };
    const criteria: Record<string, { expected: any; actual: any; passed: boolean }> = {};
    let allPassed = true;

    // Try to parse JSON output if configured
    if (task.parse_output === 'json') {
      try {
        const parsed = JSON.parse(result.stdout);
        if (typeof parsed === 'object' && parsed !== null) {
          for (const [key, value] of Object.entries(parsed)) {
            if (typeof value === 'number') {
              metrics[key] = value;
            }
          }
        }
      } catch {}
    }

    // Evaluate criteria
    if (task.criteria?.exit_code !== undefined) {
      const passed = result.exitCode === task.criteria.exit_code;
      criteria['exit_code'] = { expected: task.criteria.exit_code, actual: result.exitCode, passed };
      if (!passed) allPassed = false;
    } else {
      const passed = result.exitCode === 0;
      criteria['exit_code'] = { expected: 0, actual: result.exitCode, passed };
      if (!passed) allPassed = false;
    }

    return {
      taskId: task.id, type: task.type,
      status: allPassed ? 'pass' : 'fail',
      startedAt, completedAt, durationMs,
      command: task.command,
      exitCode: result.exitCode,
      stdout: result.stdout.slice(-10000),
      stderr: result.stderr.slice(-5000),
      metrics, criteria,
    };
  }
}

// ============================================================================
// Default Registry
// ============================================================================

export function createDefaultRegistry(): TaskRegistry {
  const registry = new TaskRegistry();
  registry.register(new BuildHandler());
  registry.register(new TestHandler());
  registry.register(new LintHandler());
  registry.register(new SecurityHandler());
  registry.register(new CustomHandler());

  // LLM Judge and Agent Eval handlers are registered dynamically
  // to avoid requiring their dependencies at startup
  try {
    const { LLMJudgeHandler } = require('./handlers/llm-judge-handler.js');
    registry.register(new LLMJudgeHandler());
  } catch {}

  try {
    const { AgentEvalHandler } = require('./handlers/agent-eval-handler.js');
    registry.register(new AgentEvalHandler());
  } catch {}

  return registry;
}
`;
}

export function generateResultsManager(): string {
  return `import * as fs from 'fs';
import * as path from 'path';

const EVAL_RUNS_DIR = '.eval-runs';

export class ResultsManager {
  private baseDir: string;

  constructor(baseDir: string = EVAL_RUNS_DIR) {
    this.baseDir = baseDir;
    fs.mkdirSync(this.baseDir, { recursive: true });
  }

  createRun(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const id = \`run-\${timestamp}-\${Math.random().toString(36).slice(2, 6)}\`;
    const runDir = path.join(this.baseDir, id);

    fs.mkdirSync(path.join(runDir, 'tasks'), { recursive: true });
    fs.mkdirSync(path.join(runDir, 'predictions'), { recursive: true });

    return id;
  }

  writeManifest(runId: string, manifest: any): void {
    const filePath = path.join(this.baseDir, runId, 'manifest.json');
    fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
  }

  readManifest(runId: string): any | null {
    const filePath = path.join(this.baseDir, runId, 'manifest.json');
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  writeTaskResult(runId: string, taskId: string, result: any): void {
    const filePath = path.join(this.baseDir, runId, 'tasks', \`\${taskId}.result.json\`);
    fs.writeFileSync(filePath, JSON.stringify(result, null, 2));
  }

  readTaskResult(runId: string, taskId: string): any | null {
    const filePath = path.join(this.baseDir, runId, 'tasks', \`\${taskId}.result.json\`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  readAllTaskResults(runId: string): any[] {
    const tasksDir = path.join(this.baseDir, runId, 'tasks');
    if (!fs.existsSync(tasksDir)) return [];

    return fs.readdirSync(tasksDir)
      .filter(f => f.endsWith('.result.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(tasksDir, f), 'utf-8')))
      .sort((a, b) => a.taskId.localeCompare(b.taskId));
  }

  writeSummary(runId: string, summaryJson: any, summaryMd: string): void {
    const dir = path.join(this.baseDir, runId);
    fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify(summaryJson, null, 2));
    fs.writeFileSync(path.join(dir, 'summary.md'), summaryMd);
  }

  listRuns(): any[] {
    if (!fs.existsSync(this.baseDir)) return [];

    return fs.readdirSync(this.baseDir)
      .filter(d => d.startsWith('run-') && fs.statSync(path.join(this.baseDir, d)).isDirectory())
      .sort((a, b) => b.localeCompare(a)) // Newest first
      .map(runId => {
        const manifest = this.readManifest(runId);
        return manifest ? { runId, ...manifest } : { runId, status: 'unknown' };
      });
  }
}
`;
}

export function generateSpecParser(): string {
  return `import * as fs from 'fs';
import * as yaml from 'js-yaml';

export interface EvalSpec {
  name: string;
  version: string;
  target: {
    repo?: string;
    ref?: string;
    dataset?: string;
    subset?: number;
  };
  tasks: EvalTask[];
  baselines?: Record<string, number>;
}

export interface EvalTask {
  id: string;
  type: string;
  command?: string;
  timeout?: number;
  criteria?: Record<string, any>;
  prompt_template?: string;
  context_files?: string[];
  parse_output?: 'json' | 'text';
  model?: string;
  max_tokens?: number;
  docker_registry?: string;
  config?: Record<string, any>;
}

export class SpecParser {
  parse(filePath: string): EvalSpec {
    if (!fs.existsSync(filePath)) {
      throw new Error(\`Spec file not found: \${filePath}\`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    let data: any;

    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
      data = yaml.load(content);
    } else if (filePath.endsWith('.json')) {
      data = JSON.parse(content);
    } else {
      throw new Error(\`Unsupported spec format. Use .yaml, .yml, or .json\`);
    }

    return this.validate(data);
  }

  private validate(data: any): EvalSpec {
    if (!data || typeof data !== 'object') {
      throw new Error('Spec must be a YAML/JSON object');
    }

    if (!data.name || typeof data.name !== 'string') {
      throw new Error('Spec must have a "name" field (string)');
    }

    if (!data.version || typeof data.version !== 'string') {
      throw new Error('Spec must have a "version" field (string)');
    }

    if (!data.target || typeof data.target !== 'object') {
      throw new Error('Spec must have a "target" field (object with repo or dataset)');
    }

    if (!data.tasks || !Array.isArray(data.tasks) || data.tasks.length === 0) {
      throw new Error('Spec must have a "tasks" array with at least one task');
    }

    for (let i = 0; i < data.tasks.length; i++) {
      const task = data.tasks[i];
      if (!task.id || typeof task.id !== 'string') {
        throw new Error(\`Task \${i} must have an "id" field (string)\`);
      }
      if (!task.type || typeof task.type !== 'string') {
        throw new Error(\`Task "\${task.id}" must have a "type" field (string)\`);
      }
    }

    return data as EvalSpec;
  }
}
`;
}

export function generateReportGenerator(): string {
  return `export class ReportGenerator {
  generateJSON(manifest: any, taskResults: any[], baselines?: Record<string, number>): any {
    const passCount = taskResults.filter(t => t.status === 'pass').length;
    const failCount = taskResults.filter(t => t.status === 'fail').length;
    const errorCount = taskResults.filter(t => t.status === 'error').length;
    const totalDurationMs = taskResults.reduce((sum, t) => sum + (t.durationMs || 0), 0);

    // Aggregate metrics across tasks
    const aggregateMetrics: Record<string, number> = {};
    for (const result of taskResults) {
      for (const [key, value] of Object.entries(result.metrics || {})) {
        if (typeof value === 'number') {
          aggregateMetrics[\`\${result.taskId}.\${key}\`] = value;
        }
      }
    }

    // Calculate total cost
    let totalCostAmount = 0;
    const costBreakdown: Record<string, number> = {};
    for (const result of taskResults) {
      if (result.estimatedCost?.amount) {
        totalCostAmount += result.estimatedCost.amount;
        costBreakdown[result.taskId] = result.estimatedCost.amount;
      }
    }

    // Baseline comparison
    let baselineComparison: Record<string, { baseline: number; actual: number; delta: number }> | undefined;
    if (baselines) {
      baselineComparison = {};
      // Use resolve rate if available, otherwise pass rate
      const resolveResults = taskResults.filter(t => t.resolveRate !== undefined);
      const actual = resolveResults.length > 0
        ? resolveResults[0].resolveRate
        : passCount / Math.max(taskResults.length, 1);

      for (const [name, baseline] of Object.entries(baselines)) {
        baselineComparison[name] = {
          baseline,
          actual: actual || 0,
          delta: (actual || 0) - baseline,
        };
      }
    }

    const overallStatus = failCount > 0 || errorCount > 0
      ? (passCount > 0 ? 'mixed' : 'fail')
      : 'pass';

    return {
      runId: manifest.runId,
      specName: manifest.specName,
      completedAt: manifest.completedAt || new Date().toISOString(),
      overallStatus,
      tasks: taskResults.map(t => ({
        taskId: t.taskId,
        type: t.type,
        status: t.status,
        durationMs: t.durationMs,
        metrics: t.metrics || {},
        cost: t.estimatedCost?.amount,
      })),
      aggregateMetrics,
      passCount,
      failCount,
      errorCount,
      totalDurationMs,
      totalCost: { amount: totalCostAmount, currency: 'USD', breakdown: costBreakdown },
      baselineComparison,
    };
  }

  generateMarkdown(manifest: any, taskResults: any[], baselines?: Record<string, number>): string {
    const summary = this.generateJSON(manifest, taskResults, baselines);
    const lines: string[] = [];

    lines.push(\`# Eval Report: \${summary.specName}\`);
    lines.push(\`\`);
    lines.push(\`**Run ID:** \${summary.runId}\`);
    lines.push(\`**Date:** \${summary.completedAt}\`);
    lines.push(\`**Overall Status:** \${summary.overallStatus.toUpperCase()}\`);
    lines.push(\`\`);

    // Summary stats
    lines.push(\`## Summary\`);
    lines.push(\`\`);
    lines.push(\`| Metric | Value |\`);
    lines.push(\`|--------|-------|\`);
    lines.push(\`| Tasks Run | \${taskResults.length} |\`);
    lines.push(\`| Passed | \${summary.passCount} |\`);
    lines.push(\`| Failed | \${summary.failCount} |\`);
    lines.push(\`| Errors | \${summary.errorCount} |\`);
    lines.push(\`| Total Duration | \${(summary.totalDurationMs / 1000).toFixed(1)}s |\`);
    if (summary.totalCost.amount > 0) {
      lines.push(\`| Total Cost | $\${summary.totalCost.amount.toFixed(4)} |\`);
    }
    lines.push(\`\`);

    // Task details
    lines.push(\`## Tasks\`);
    lines.push(\`\`);
    lines.push(\`| Task | Type | Status | Duration | Cost |\`);
    lines.push(\`|------|------|--------|----------|------|\`);

    for (const task of summary.tasks) {
      const statusIcon = task.status === 'pass' ? '\\u2705' : task.status === 'fail' ? '\\u274c' : task.status === 'skip' ? '\\u23ed' : '\\u26a0\\ufe0f';
      const cost = task.cost ? \`$\${task.cost.toFixed(4)}\` : '-';
      lines.push(\`| \${task.taskId} | \${task.type} | \${statusIcon} \${task.status} | \${(task.durationMs / 1000).toFixed(1)}s | \${cost} |\`);
    }
    lines.push(\`\`);

    // Criteria details
    lines.push(\`## Criteria Results\`);
    lines.push(\`\`);
    for (const result of taskResults) {
      if (Object.keys(result.criteria || {}).length > 0) {
        lines.push(\`### \${result.taskId}\`);
        lines.push(\`\`);
        for (const [name, crit] of Object.entries(result.criteria as Record<string, any>)) {
          const icon = crit.passed ? '\\u2705' : '\\u274c';
          lines.push(\`- \${icon} **\${name}**: expected=\${crit.expected}, actual=\${crit.actual}\`);
        }
        lines.push(\`\`);
      }
    }

    // Baseline comparison
    if (summary.baselineComparison) {
      lines.push(\`## Baseline Comparison\`);
      lines.push(\`\`);
      lines.push(\`| Baseline | Score | Actual | Delta |\`);
      lines.push(\`|----------|-------|--------|-------|\`);
      for (const [name, data] of Object.entries(summary.baselineComparison)) {
        const deltaStr = data.delta >= 0 ? \`+\${data.delta.toFixed(3)}\` : data.delta.toFixed(3);
        lines.push(\`| \${name} | \${data.baseline.toFixed(3)} | \${data.actual.toFixed(3)} | \${deltaStr} |\`);
      }
      lines.push(\`\`);
    }

    // Cost breakdown
    if (summary.totalCost.amount > 0) {
      lines.push(\`## Cost Breakdown\`);
      lines.push(\`\`);
      lines.push(\`| Task | Cost |\`);
      lines.push(\`|------|------|\`);
      for (const [taskId, cost] of Object.entries(summary.totalCost.breakdown as Record<string, number>)) {
        lines.push(\`| \${taskId} | $\${cost.toFixed(4)} |\`);
      }
      lines.push(\`| **Total** | **$\${summary.totalCost.amount.toFixed(4)}** |\`);
      lines.push(\`\`);
    }

    return lines.join('\\n');
  }
}
`;
}

export function generateLLMJudgeHandler(): string {
  return `import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import Anthropic from '@anthropic-ai/sdk';
import type { EvalContext } from '../eval-executor.js';
import type { EvalTask, TaskResult, TaskHandler } from '../task-registry.js';

// Model pricing per million tokens (USD)
const MODEL_PRICING: Record<string, { input: number; output: number; cacheRead?: number }> = {
  'claude-sonnet-4-20250514':  { input: 3.0,  output: 15.0, cacheRead: 0.30 },
  'claude-opus-4-20250514':    { input: 15.0, output: 75.0, cacheRead: 1.50 },
  'claude-haiku-3-5-20241022': { input: 0.80, output: 4.0,  cacheRead: 0.08 },
};

function calculateCost(model: string, usage: { inputTokens: number; outputTokens: number; cacheReadTokens?: number }) {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['claude-sonnet-4-20250514'];
  const inputCost = (usage.inputTokens * pricing.input) / 1_000_000;
  const outputCost = (usage.outputTokens * pricing.output) / 1_000_000;
  const cacheReadCost = usage.cacheReadTokens && pricing.cacheRead
    ? (usage.cacheReadTokens * pricing.cacheRead) / 1_000_000
    : 0;

  return {
    amount: inputCost + outputCost + cacheReadCost,
    currency: 'USD' as const,
    model,
    breakdown: { input: inputCost, output: outputCost, cacheRead: cacheReadCost },
  };
}

export class LLMJudgeHandler implements TaskHandler {
  type = 'llm-judge';

  async execute(task: EvalTask, ctx: EvalContext): Promise<TaskResult> {
    const start = Date.now();
    const startedAt = new Date().toISOString();

    const model = task.model || 'claude-sonnet-4-20250514';

    if (!task.prompt_template) {
      return {
        taskId: task.id, type: task.type, status: 'error',
        startedAt, completedAt: new Date().toISOString(), durationMs: Date.now() - start,
        metrics: {}, criteria: {}, error: 'No prompt_template specified for llm-judge task',
      };
    }

    // Gather context files
    let contextContent = '';
    if (task.context_files && task.context_files.length > 0) {
      for (const pattern of task.context_files) {
        const matches = await glob(pattern, { cwd: ctx.targetDir, nodir: true });
        for (const match of matches.slice(0, 50)) { // Limit files
          const filePath = path.join(ctx.targetDir, match);
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            contextContent += \`\\n--- File: \${match} ---\\n\${content.slice(0, 5000)}\\n\`;
          } catch {}
        }
      }
    }

    // Build the prompt
    const fullPrompt = \`\${task.prompt_template}

## Codebase Context:
\${contextContent || 'No context files found.'}

## Instructions:
Respond with a JSON object containing:
- "scores": an object with category names as keys and numeric scores (1-5) as values
- "justifications": an object with the same category names as keys and brief explanations as values

Example:
{
  "scores": { "architecture": 4, "code-quality": 3, "documentation": 2 },
  "justifications": { "architecture": "Well-structured...", "code-quality": "Mostly clean...", "documentation": "Lacking..." }
}

Respond ONLY with the JSON object, no other text.\`;

    try {
      const client = new Anthropic({ apiKey: ctx.apiKey || process.env.ANTHROPIC_API_KEY });

      const response = await client.messages.create({
        model,
        max_tokens: 4096,
        temperature: 0,
        messages: [{ role: 'user', content: fullPrompt }],
      });

      const completedAt = new Date().toISOString();
      const durationMs = Date.now() - start;

      // Extract token usage
      const tokenUsage = {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheReadTokens: (response.usage as any).cache_read_input_tokens,
      };

      const estimatedCost = calculateCost(model, tokenUsage);

      // Parse the response
      const responseText = response.content
        .filter(c => c.type === 'text')
        .map(c => (c as any).text)
        .join('');

      let scores: Record<string, number> = {};
      let justifications: Record<string, string> = {};

      try {
        const jsonMatch = responseText.match(/\\{[\\s\\S]*\\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          scores = parsed.scores || {};
          justifications = parsed.justifications || {};
        }
      } catch {
        return {
          taskId: task.id, type: task.type, status: 'error',
          startedAt, completedAt, durationMs,
          metrics: {}, criteria: {},
          error: 'Failed to parse LLM judge response as JSON',
          tokenUsage, estimatedCost,
        };
      }

      // Calculate average score
      const scoreValues = Object.values(scores).filter(v => typeof v === 'number');
      const averageScore = scoreValues.length > 0
        ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
        : 0;

      // Build metrics
      const metrics: Record<string, number> = { average_score: averageScore };
      for (const [key, value] of Object.entries(scores)) {
        metrics[\`score_\${key}\`] = value;
      }

      // Evaluate criteria
      const criteria: Record<string, { expected: any; actual: any; passed: boolean }> = {};
      let allPassed = true;

      if (task.criteria?.min_average_score !== undefined) {
        const passed = averageScore >= task.criteria.min_average_score;
        criteria['min_average_score'] = { expected: task.criteria.min_average_score, actual: averageScore, passed };
        if (!passed) allPassed = false;
      }

      // Check individual score criteria
      for (const [key, value] of Object.entries(task.criteria || {})) {
        if (key.startsWith('min_') && key !== 'min_average_score') {
          const category = key.slice(4);
          if (scores[category] !== undefined) {
            const passed = scores[category] >= value;
            criteria[key] = { expected: value, actual: scores[category], passed };
            if (!passed) allPassed = false;
          }
        }
      }

      if (Object.keys(criteria).length === 0) {
        allPassed = averageScore >= 3.0;
        criteria['min_average_score'] = { expected: 3.0, actual: averageScore, passed: allPassed };
      }

      return {
        taskId: task.id, type: task.type,
        status: allPassed ? 'pass' : 'fail',
        startedAt, completedAt, durationMs,
        metrics, criteria,
        judgment: { scores, justifications, averageScore },
        tokenUsage, estimatedCost,
      };
    } catch (error) {
      return {
        taskId: task.id, type: task.type, status: 'error',
        startedAt, completedAt: new Date().toISOString(), durationMs: Date.now() - start,
        metrics: {}, criteria: {},
        error: \`LLM Judge failed: \${error instanceof Error ? error.message : String(error)}\`,
      };
    }
  }
}
`;
}

export function generateAgentEvalHandler(): string {
  return `import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { EvalContext } from '../eval-executor.js';
import type { EvalTask, TaskResult, TaskHandler } from '../task-registry.js';

export class AgentEvalHandler implements TaskHandler {
  type = 'agent-eval';

  async execute(task: EvalTask, ctx: EvalContext): Promise<TaskResult> {
    const start = Date.now();
    const startedAt = new Date().toISOString();

    // Check for Python and Docker availability
    const pythonAvailable = await this.checkCommand('python3 --version');
    const dockerAvailable = await this.checkCommand('docker info');

    if (!pythonAvailable || !dockerAvailable) {
      return {
        taskId: task.id, type: task.type, status: 'skip',
        startedAt, completedAt: new Date().toISOString(), durationMs: Date.now() - start,
        metrics: {}, criteria: {},
        error: \`\${!pythonAvailable ? 'Python' : 'Docker'} not available. Agent-eval requires both Python and Docker.\`,
      };
    }

    // Check for harness directory
    const harnessDir = path.join(ctx.workingDir, 'harness');
    if (!fs.existsSync(path.join(harnessDir, 'run_task.py'))) {
      return {
        taskId: task.id, type: task.type, status: 'error',
        startedAt, completedAt: new Date().toISOString(), durationMs: Date.now() - start,
        metrics: {}, criteria: {},
        error: 'harness/run_task.py not found. Ensure the Python harness is set up.',
      };
    }

    const model = task.model || 'claude-sonnet-4-20250514';
    const maxTokens = task.max_tokens || 200000;
    const timeout = task.timeout || 600;

    try {
      // Run the Python harness
      const result = await this.runPythonHarness({
        harnessDir,
        model,
        maxTokens,
        timeout,
        dataset: task.config?.dataset || 'princeton-nlp/SWE-bench_Verified',
        subset: task.config?.subset || 20,
        dockerRegistry: task.docker_registry || 'ghcr.io/epoch-research',
        apiKey: ctx.apiKey,
        outputDir: path.join(ctx.workingDir, '.eval-runs', ctx.runId, 'predictions'),
      });

      const completedAt = new Date().toISOString();
      const durationMs = Date.now() - start;

      // Parse predictions output
      let predictions: Array<{ instanceId: string; patch: string; resolved: boolean }> = [];
      const predictionsFile = path.join(ctx.workingDir, '.eval-runs', ctx.runId, 'predictions', 'predictions.jsonl');
      if (fs.existsSync(predictionsFile)) {
        const lines = fs.readFileSync(predictionsFile, 'utf-8').trim().split('\\n');
        for (const line of lines) {
          try {
            const p = JSON.parse(line);
            predictions.push({
              instanceId: p.instance_id || p.instanceId,
              patch: p.model_patch || p.patch || '',
              resolved: p.resolved || false,
            });
          } catch {}
        }
      }

      const resolvedCount = predictions.filter(p => p.resolved).length;
      const resolveRate = predictions.length > 0 ? resolvedCount / predictions.length : 0;

      const metrics: Record<string, number> = {
        resolve_rate: resolveRate,
        resolved: resolvedCount,
        total: predictions.length,
        exit_code: result.exitCode,
      };

      if (result.tokenUsage) {
        metrics['input_tokens'] = result.tokenUsage.inputTokens;
        metrics['output_tokens'] = result.tokenUsage.outputTokens;
      }

      // Evaluate criteria
      const criteria: Record<string, { expected: any; actual: any; passed: boolean }> = {};
      let allPassed = true;

      if (task.criteria?.min_resolve_rate !== undefined) {
        const passed = resolveRate >= task.criteria.min_resolve_rate;
        criteria['min_resolve_rate'] = { expected: task.criteria.min_resolve_rate, actual: resolveRate, passed };
        if (!passed) allPassed = false;
      }

      return {
        taskId: task.id, type: task.type,
        status: result.exitCode !== 0 ? 'error' : (allPassed ? 'pass' : 'fail'),
        startedAt, completedAt, durationMs,
        metrics, criteria,
        predictions,
        resolveRate,
        tokenUsage: result.tokenUsage,
        estimatedCost: result.estimatedCost,
        stdout: result.stdout.slice(-10000),
        stderr: result.stderr.slice(-5000),
        error: result.exitCode !== 0 ? \`Python harness exited with code \${result.exitCode}\` : undefined,
      };
    } catch (error) {
      return {
        taskId: task.id, type: task.type, status: 'error',
        startedAt, completedAt: new Date().toISOString(), durationMs: Date.now() - start,
        metrics: {}, criteria: {},
        error: \`Agent eval failed: \${error instanceof Error ? error.message : String(error)}\`,
      };
    }
  }

  private checkCommand(cmd: string): Promise<boolean> {
    return new Promise((resolve) => {
      const child = spawn(cmd, [], { shell: true, stdio: 'pipe' });
      child.on('close', (code) => resolve(code === 0));
      child.on('error', () => resolve(false));
    });
  }

  private runPythonHarness(options: {
    harnessDir: string;
    model: string;
    maxTokens: number;
    timeout: number;
    dataset: string;
    subset: number;
    dockerRegistry: string;
    apiKey?: string;
    outputDir: string;
  }): Promise<{ exitCode: number; stdout: string; stderr: string; tokenUsage?: any; estimatedCost?: any }> {
    return new Promise((resolve) => {
      const args = [
        'run_task.py',
        '--model', options.model,
        '--max-tokens', String(options.maxTokens),
        '--dataset', options.dataset,
        '--subset', String(options.subset),
        '--docker-registry', options.dockerRegistry,
        '--output-dir', options.outputDir,
      ];

      const env = { ...process.env };
      if (options.apiKey) {
        env['ANTHROPIC_API_KEY'] = options.apiKey;
      }

      const child = spawn('python3', args, {
        cwd: options.harnessDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        env,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
      child.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

      const timer = setTimeout(() => {
        child.kill('SIGTERM');
        resolve({ exitCode: 124, stdout, stderr: stderr + '\\nProcess timed out' });
      }, options.timeout * 1000);

      child.on('close', (code: number | null) => {
        clearTimeout(timer);

        // Try to extract token usage and cost from stdout (last JSON line)
        let tokenUsage: any;
        let estimatedCost: any;
        try {
          const lastLine = stdout.trim().split('\\n').pop();
          if (lastLine) {
            const parsed = JSON.parse(lastLine);
            tokenUsage = parsed.token_usage;
            estimatedCost = parsed.estimated_cost;
          }
        } catch {}

        resolve({ exitCode: code ?? 1, stdout, stderr, tokenUsage, estimatedCost });
      });

      child.on('error', (err: Error) => {
        clearTimeout(timer);
        resolve({ exitCode: 1, stdout, stderr: err.message });
      });
    });
  }
}
`;
}

export function generatePythonHarness(): { files: Array<{ path: string; content: string }> } {
  return {
    files: [
      {
        path: 'harness/run_task.py',
        content: `#!/usr/bin/env python3
"""Eval harness entry point — runs agent-eval tasks against Docker containers.

Usage:
    python run_task.py --model claude-sonnet-4-20250514 --dataset princeton-nlp/SWE-bench_Verified --subset 5 --output-dir ./predictions
"""

import argparse
import json
import os
import sys

def main():
    parser = argparse.ArgumentParser(description='Run agent-eval tasks')
    parser.add_argument('--model', default='claude-sonnet-4-20250514', help='Model to use')
    parser.add_argument('--max-tokens', type=int, default=200000, help='Max tokens per turn')
    parser.add_argument('--dataset', default='princeton-nlp/SWE-bench_Verified', help='HuggingFace dataset')
    parser.add_argument('--subset', type=int, default=20, help='Number of instances')
    parser.add_argument('--docker-registry', default='ghcr.io/epoch-research', help='Docker image registry')
    parser.add_argument('--output-dir', default='./predictions', help='Output directory for predictions')
    parser.add_argument('--instance', default=None, help='Single instance ID to run')
    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)

    api_key = os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        print('Error: ANTHROPIC_API_KEY not set', file=sys.stderr)
        sys.exit(1)

    try:
        from docker_utils import DockerManager
        from agent import AgentLoop
    except ImportError as e:
        print(f'Error importing harness modules: {e}', file=sys.stderr)
        print('Install requirements: pip install -r requirements.txt', file=sys.stderr)
        sys.exit(1)

    try:
        # Load dataset instances
        from datasets import load_dataset
        ds = load_dataset(args.dataset, split='test')
        instances = list(ds)[:args.subset]

        if args.instance:
            instances = [i for i in instances if i['instance_id'] == args.instance]

        if not instances:
            print('No instances found', file=sys.stderr)
            sys.exit(1)

        docker_mgr = DockerManager(registry=args.docker_registry)
        total_usage = {'input_tokens': 0, 'output_tokens': 0}
        predictions = []

        for instance in instances:
            instance_id = instance['instance_id']
            print(f'Running instance: {instance_id}', file=sys.stderr)

            container = None
            try:
                # Create container
                container = docker_mgr.create_container(instance)

                # Run agent loop
                agent = AgentLoop(
                    model=args.model,
                    max_tokens=args.max_tokens,
                    api_key=api_key,
                    container=container,
                )
                result = agent.run(instance)

                # Extract patch
                patch = docker_mgr.extract_patch(container)

                prediction = {
                    'instance_id': instance_id,
                    'model_patch': patch,
                    'model_name_or_path': args.model,
                    'resolved': False,  # Will be graded separately
                }

                # Grade if test patch available
                if instance.get('test_patch'):
                    passed = docker_mgr.run_tests(container, instance['test_patch'])
                    prediction['resolved'] = passed

                predictions.append(prediction)

                total_usage['input_tokens'] += result.get('input_tokens', 0)
                total_usage['output_tokens'] += result.get('output_tokens', 0)

            except Exception as e:
                print(f'Error on {instance_id}: {e}', file=sys.stderr)
                predictions.append({
                    'instance_id': instance_id,
                    'model_patch': '',
                    'model_name_or_path': args.model,
                    'resolved': False,
                    'error': str(e),
                })
            finally:
                if container:
                    docker_mgr.cleanup(container)

        # Write predictions JSONL
        predictions_path = os.path.join(args.output_dir, 'predictions.jsonl')
        with open(predictions_path, 'w') as f:
            for pred in predictions:
                f.write(json.dumps(pred) + '\\n')

        # Output summary as last JSON line (picked up by TypeScript)
        summary = {
            'token_usage': {
                'inputTokens': total_usage['input_tokens'],
                'outputTokens': total_usage['output_tokens'],
            },
            'predictions_count': len(predictions),
            'resolved_count': sum(1 for p in predictions if p.get('resolved')),
        }
        print(json.dumps(summary))

    except Exception as e:
        print(f'Fatal error: {e}', file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
`,
      },
      {
        path: 'harness/docker_utils.py',
        content: `"""Docker container lifecycle management for SWE-bench-style evaluations."""

import subprocess
import tempfile
import os


class DockerManager:
    """Manages Docker containers for agent evaluation tasks."""

    def __init__(self, registry: str = 'ghcr.io/epoch-research'):
        self.registry = registry
        self._verify_docker()

    def _verify_docker(self):
        try:
            subprocess.run(['docker', 'info'], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            raise RuntimeError('Docker is not available. Install and start Docker.')

    def create_container(self, instance: dict) -> str:
        """Create a sandboxed container for the instance."""
        instance_id = instance['instance_id']
        repo = instance.get('repo', '').replace('/', '__')
        image = f"{self.registry}/{repo}:{instance_id.split('-')[-1]}"

        # Pull image
        subprocess.run(['docker', 'pull', image], capture_output=True)

        # Create container with /testbed working directory
        result = subprocess.run(
            ['docker', 'create', '--workdir', '/testbed', image],
            capture_output=True, text=True, check=True,
        )
        container_id = result.stdout.strip()

        # Start container
        subprocess.run(['docker', 'start', container_id], capture_output=True, check=True)

        # Apply base patch if available
        if instance.get('patch'):
            self._apply_patch(container_id, instance['patch'])

        return container_id

    def _apply_patch(self, container_id: str, patch: str):
        """Apply a patch inside the container."""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.patch', delete=False) as f:
            f.write(patch)
            f.flush()
            subprocess.run(
                ['docker', 'cp', f.name, f'{container_id}:/tmp/patch.diff'],
                capture_output=True, check=True,
            )
        subprocess.run(
            ['docker', 'exec', container_id, 'bash', '-c',
             'cd /testbed && git apply /tmp/patch.diff'],
            capture_output=True,
        )
        os.unlink(f.name)

    def exec_command(self, container_id: str, command: str, timeout: int = 120) -> dict:
        """Execute a command in the container and return stdout/stderr/exit_code."""
        try:
            result = subprocess.run(
                ['docker', 'exec', container_id, 'bash', '-c', command],
                capture_output=True, text=True, timeout=timeout,
            )
            # Truncate output to 30K chars
            return {
                'stdout': result.stdout[:30000],
                'stderr': result.stderr[:30000],
                'exit_code': result.returncode,
            }
        except subprocess.TimeoutExpired:
            return {'stdout': '', 'stderr': 'Command timed out', 'exit_code': 124}

    def extract_patch(self, container_id: str) -> str:
        """Extract the git diff from the container."""
        result = subprocess.run(
            ['docker', 'exec', container_id, 'bash', '-c', 'cd /testbed && git diff'],
            capture_output=True, text=True,
        )
        return result.stdout

    def run_tests(self, container_id: str, test_patch: str) -> bool:
        """Apply test patch and run tests. Returns True if tests pass."""
        # Apply test patch
        with tempfile.NamedTemporaryFile(mode='w', suffix='.patch', delete=False) as f:
            f.write(test_patch)
            f.flush()
            subprocess.run(
                ['docker', 'cp', f.name, f'{container_id}:/tmp/test.patch'],
                capture_output=True, check=True,
            )
        os.unlink(f.name)

        result = subprocess.run(
            ['docker', 'exec', container_id, 'bash', '-c',
             'cd /testbed && git apply /tmp/test.patch && python -m pytest --tb=short -q'],
            capture_output=True, text=True, timeout=300,
        )
        return result.returncode == 0

    def cleanup(self, container_id: str):
        """Stop and remove the container."""
        subprocess.run(['docker', 'stop', container_id], capture_output=True)
        subprocess.run(['docker', 'rm', '-f', container_id], capture_output=True)
`,
      },
      {
        path: 'harness/agent.py',
        content: `"""Agentic loop for SWE-bench-style evaluation.

Uses Anthropic API directly with bash + str_replace_editor tools.
Based on Anthropic's published harness architecture.
"""

import json
import os
from typing import Any

try:
    import anthropic
except ImportError:
    raise ImportError('pip install anthropic')


SYSTEM_PROMPT = """You are an autonomous AI assistant tasked with resolving a GitHub issue.
You have access to a codebase in /testbed. Use the bash and str_replace_editor tools to:
1. Explore the repository structure
2. Understand the issue
3. Make the necessary code changes to resolve the issue

IMPORTANT:
- Always use absolute paths starting with /testbed/
- Do not use interactive commands (no vim, nano, less, etc.)
- Make minimal, targeted changes
- Test your changes when possible
"""


class AgentLoop:
    """Run an agent loop with bash + str_replace_editor tools."""

    def __init__(self, model: str, max_tokens: int, api_key: str, container: str):
        self.model = model
        self.max_tokens = max_tokens
        self.client = anthropic.Anthropic(api_key=api_key)
        self.container = container
        self.total_input_tokens = 0
        self.total_output_tokens = 0

    def run(self, instance: dict) -> dict:
        """Run the agent loop on an instance. Returns usage stats."""
        from tools import get_tool_definitions, execute_tool
        from docker_utils import DockerManager

        problem_statement = instance.get('problem_statement', '')
        messages = [
            {'role': 'user', 'content': f'Please resolve the following GitHub issue:\\n\\n{problem_statement}'}
        ]

        tools = get_tool_definitions()

        # No step limit — run until the model stops calling tools
        while True:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=min(self.max_tokens, 8192),
                temperature=0,
                system=SYSTEM_PROMPT,
                messages=messages,
                tools=tools,
            )

            self.total_input_tokens += response.usage.input_tokens
            self.total_output_tokens += response.usage.output_tokens

            # Check if the model is done (no tool use)
            has_tool_use = any(block.type == 'tool_use' for block in response.content)

            if not has_tool_use or response.stop_reason == 'end_turn':
                break

            # Process tool calls
            messages.append({'role': 'assistant', 'content': response.content})
            tool_results = []

            for block in response.content:
                if block.type == 'tool_use':
                    result = execute_tool(block.name, block.input, self.container)
                    tool_results.append({
                        'type': 'tool_result',
                        'tool_use_id': block.id,
                        'content': result[:30000],  # Truncate output
                    })

            messages.append({'role': 'user', 'content': tool_results})

        return {
            'input_tokens': self.total_input_tokens,
            'output_tokens': self.total_output_tokens,
        }
`,
      },
      {
        path: 'harness/tools.py',
        content: `"""Tool definitions for the SWE-bench agent harness.

Implements bash and str_replace_editor tools matching Anthropic's published schemas.
"""

import subprocess
from typing import Any


def get_tool_definitions() -> list:
    """Return tool definitions for the Anthropic API."""
    return [
        {
            'name': 'bash',
            'description': 'Execute a bash command in the container. Use for running tests, exploring files, etc.',
            'input_schema': {
                'type': 'object',
                'properties': {
                    'command': {
                        'type': 'string',
                        'description': 'The bash command to execute',
                    },
                },
                'required': ['command'],
            },
        },
        {
            'name': 'str_replace_editor',
            'description': 'Edit files using exact string replacement. Supports: view, create, str_replace, and insert commands.',
            'input_schema': {
                'type': 'object',
                'properties': {
                    'command': {
                        'type': 'string',
                        'enum': ['view', 'create', 'str_replace', 'insert'],
                        'description': 'The operation to perform',
                    },
                    'path': {
                        'type': 'string',
                        'description': 'Absolute path to the file (must start with /testbed/)',
                    },
                    'old_str': {
                        'type': 'string',
                        'description': 'For str_replace: the exact string to replace (must match exactly once)',
                    },
                    'new_str': {
                        'type': 'string',
                        'description': 'For str_replace/create: the replacement string or file content',
                    },
                    'insert_line': {
                        'type': 'integer',
                        'description': 'For insert: line number to insert after',
                    },
                    'view_range': {
                        'type': 'array',
                        'items': {'type': 'integer'},
                        'description': 'For view: [start_line, end_line] range',
                    },
                },
                'required': ['command', 'path'],
            },
        },
    ]


def execute_tool(tool_name: str, tool_input: dict, container_id: str) -> str:
    """Execute a tool call and return the result string."""
    if tool_name == 'bash':
        return _execute_bash(tool_input.get('command', ''), container_id)
    elif tool_name == 'str_replace_editor':
        return _execute_editor(tool_input, container_id)
    else:
        return f'Unknown tool: {tool_name}'


def _execute_bash(command: str, container_id: str) -> str:
    """Execute a bash command in the Docker container."""
    try:
        result = subprocess.run(
            ['docker', 'exec', container_id, 'bash', '-c', command],
            capture_output=True, text=True, timeout=120,
        )
        output = ''
        if result.stdout:
            output += result.stdout
        if result.stderr:
            output += ('\\n' if output else '') + result.stderr
        if result.returncode != 0:
            output += f'\\n[Exit code: {result.returncode}]'
        return output[:30000] or '[No output]'
    except subprocess.TimeoutExpired:
        return '[Command timed out after 120 seconds]'


def _execute_editor(tool_input: dict, container_id: str) -> str:
    """Execute a str_replace_editor command in the Docker container."""
    command = tool_input.get('command')
    path = tool_input.get('path', '')

    if not path.startswith('/testbed/'):
        return f'Error: path must start with /testbed/, got: {path}'

    if command == 'view':
        view_range = tool_input.get('view_range')
        if view_range:
            cmd = f"sed -n '{view_range[0]},{view_range[1]}p' '{path}' | cat -n"
        else:
            cmd = f"cat -n '{path}'"
        return _execute_bash(cmd, container_id)

    elif command == 'create':
        new_str = tool_input.get('new_str', '')
        escaped = new_str.replace("'", "'\\\\''")
        cmd = f"cat > '{path}' << 'HEREDOC_END'\\n{new_str}\\nHEREDOC_END"
        return _execute_bash(cmd, container_id)

    elif command == 'str_replace':
        old_str = tool_input.get('old_str', '')
        new_str = tool_input.get('new_str', '')

        # Verify old_str appears exactly once
        count_cmd = f"grep -cF '{_escape_for_shell(old_str)}' '{path}'"
        count_result = _execute_bash(count_cmd, container_id)
        try:
            count = int(count_result.strip().split('\\n')[0])
        except (ValueError, IndexError):
            count = 0

        if count == 0:
            return f'Error: old_str not found in {path}'
        if count > 1:
            return f'Error: old_str found {count} times in {path}. Must match exactly once.'

        # Use Python inside the container for reliable replacement
        py_cmd = f\"\"\"python3 -c "
import sys
path = '{path}'
with open(path) as f:
    content = f.read()
old = '''{_escape_triple_quotes(old_str)}'''
new = '''{_escape_triple_quotes(new_str)}'''
content = content.replace(old, new, 1)
with open(path, 'w') as f:
    f.write(content)
print('OK')
"\"\"\"
        return _execute_bash(py_cmd, container_id)

    elif command == 'insert':
        insert_line = tool_input.get('insert_line', 0)
        new_str = tool_input.get('new_str', '')
        escaped = new_str.replace("'", "'\\\\''")
        cmd = f"sed -i '{insert_line}a\\\\{escaped}' '{path}'"
        return _execute_bash(cmd, container_id)

    else:
        return f'Unknown editor command: {command}'


def _escape_for_shell(s: str) -> str:
    return s.replace("'", "'\\\\''")


def _escape_triple_quotes(s: str) -> str:
    return s.replace("'''", "'\\\\'\\\\'\\\\'")
`,
      },
      {
        path: 'harness/requirements.txt',
        content: `anthropic>=0.39.0
docker>=7.0.0
datasets>=2.14.0
rich>=13.0.0
`,
      },
    ],
  };
}

export function generateSampleEvalSpec(): string {
  return `name: "sample-eval"
version: "1.0"
target:
  repo: "./target-codebase"
  ref: "main"
tasks:
  - id: build
    type: build
    command: "npm run build"
    timeout: 120
    criteria:
      exit_code: 0

  - id: tests
    type: test
    command: "npm test -- --reporter json"
    timeout: 300
    criteria:
      min_pass_rate: 0.8

  - id: lint
    type: lint
    command: "npx eslint . --format json"
    criteria:
      max_errors: 0

  - id: security
    type: security
    command: "npm audit --json"
    criteria:
      max_critical: 0

  - id: architecture-quality
    type: llm-judge
    model: "claude-sonnet-4-20250514"
    prompt_template: |
      Review the following codebase and rate it on a 1-5 scale for each category:
      - architecture: How well-structured is the code? Is there clear separation of concerns?
      - code-quality: Is the code clean, readable, and maintainable?
      - documentation: Is the code well-documented with meaningful comments and README?
      - error-handling: Does the code handle errors gracefully?
    context_files:
      - "src/**/*.ts"
    criteria:
      min_average_score: 3.0
`;
}

export function generateAgentEvalSpec(): string {
  return `name: "swe-bench-mini"
version: "1.0"
target:
  dataset: "princeton-nlp/SWE-bench_Verified"
  subset: 20
tasks:
  - id: agent-solve
    type: agent-eval
    model: "claude-sonnet-4-20250514"
    max_tokens: 200000
    docker_registry: "ghcr.io/epoch-research"
    timeout: 600
    criteria:
      min_resolve_rate: 0.40
    config:
      dataset: "princeton-nlp/SWE-bench_Verified"
      subset: 20
baselines:
  anthropic-internal: 0.49
  swe-agent: 0.42
`;
}

export function generateVitestConfig(): string {
  return `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/eval/**/*.ts'],
      exclude: ['src/eval/**/*.test.ts', 'src/eval/handlers/**'],
    },
  },
});
`;
}

export function generateReportGeneratorTests(): string {
  return `import { describe, it, expect } from 'vitest';
import { ReportGenerator } from '../report-generator.js';

describe('ReportGenerator', () => {
  const generator = new ReportGenerator();

  function makeManifest(overrides: Record<string, any> = {}) {
    return {
      runId: 'run-test-001',
      specName: 'test-spec',
      completedAt: '2025-01-01T00:00:00.000Z',
      ...overrides,
    };
  }

  function makeResult(overrides: Record<string, any> = {}) {
    return {
      taskId: 'task-1',
      type: 'test',
      status: 'pass' as const,
      startedAt: '2025-01-01T00:00:00.000Z',
      completedAt: '2025-01-01T00:00:01.000Z',
      durationMs: 1000,
      metrics: {},
      criteria: {},
      ...overrides,
    };
  }

  describe('generateJSON', () => {
    it('returns pass when all tasks pass', () => {
      const results = [makeResult(), makeResult({ taskId: 'task-2' })];
      const summary = generator.generateJSON(makeManifest(), results);
      expect(summary.overallStatus).toBe('pass');
      expect(summary.passCount).toBe(2);
      expect(summary.failCount).toBe(0);
    });

    it('returns mixed when some pass and some fail', () => {
      const results = [
        makeResult(),
        makeResult({ taskId: 'task-2', status: 'fail' }),
      ];
      const summary = generator.generateJSON(makeManifest(), results);
      expect(summary.overallStatus).toBe('mixed');
    });

    it('returns fail when all tasks fail', () => {
      const results = [
        makeResult({ status: 'fail' }),
        makeResult({ taskId: 'task-2', status: 'error' }),
      ];
      const summary = generator.generateJSON(makeManifest(), results);
      expect(summary.overallStatus).toBe('fail');
    });

    it('computes totalDurationMs correctly', () => {
      const results = [
        makeResult({ durationMs: 1500 }),
        makeResult({ taskId: 'task-2', durationMs: 2500 }),
      ];
      const summary = generator.generateJSON(makeManifest(), results);
      expect(summary.totalDurationMs).toBe(4000);
    });

    it('aggregates cost across tasks', () => {
      const results = [
        makeResult({ estimatedCost: { amount: 0.05, currency: 'USD' } }),
        makeResult({ taskId: 'task-2', estimatedCost: { amount: 0.10, currency: 'USD' } }),
      ];
      const summary = generator.generateJSON(makeManifest(), results);
      expect(summary.totalCost.amount).toBeCloseTo(0.15);
      expect(summary.totalCost.breakdown['task-1']).toBeCloseTo(0.05);
      expect(summary.totalCost.breakdown['task-2']).toBeCloseTo(0.10);
    });

    it('computes baseline comparison deltas', () => {
      const results = [makeResult(), makeResult({ taskId: 'task-2' })];
      const baselines = { 'baseline-a': 0.8 };
      const summary = generator.generateJSON(makeManifest(), results, baselines);
      expect(summary.baselineComparison).toBeDefined();
      expect(summary.baselineComparison['baseline-a'].baseline).toBe(0.8);
      // 2 pass out of 2 → actual = 1.0, delta = 0.2
      expect(summary.baselineComparison['baseline-a'].actual).toBe(1.0);
      expect(summary.baselineComparison['baseline-a'].delta).toBeCloseTo(0.2);
    });
  });

  describe('generateMarkdown', () => {
    it('includes report header and summary table', () => {
      const results = [makeResult()];
      const md = generator.generateMarkdown(makeManifest(), results);
      expect(md).toContain('# Eval Report: test-spec');
      expect(md).toContain('**Run ID:** run-test-001');
      expect(md).toContain('## Summary');
      expect(md).toContain('| Metric | Value |');
    });

    it('includes tasks table with correct columns', () => {
      const results = [makeResult()];
      const md = generator.generateMarkdown(makeManifest(), results);
      expect(md).toContain('## Tasks');
      expect(md).toContain('| Task | Type | Status | Duration | Cost |');
    });

    it('includes cost breakdown when costs exist', () => {
      const results = [
        makeResult({ estimatedCost: { amount: 0.05, currency: 'USD' } }),
      ];
      const md = generator.generateMarkdown(makeManifest(), results);
      expect(md).toContain('## Cost Breakdown');
    });
  });
});
`;
}

export function generateTaskRegistryTests(): string {
  return `import { describe, it, expect } from 'vitest';
import {
  TaskRegistry,
  createDefaultRegistry,
  BuildHandler,
} from '../task-registry.js';

describe('TaskRegistry', () => {
  it('register and get a handler', () => {
    const registry = new TaskRegistry();
    const handler = new BuildHandler();
    registry.register(handler);

    expect(registry.get('build')).toBe(handler);
  });

  it('returns undefined for unknown type', () => {
    const registry = new TaskRegistry();
    expect(registry.get('nonexistent')).toBeUndefined();
  });

  it('has() returns correct boolean', () => {
    const registry = new TaskRegistry();
    registry.register(new BuildHandler());
    expect(registry.has('build')).toBe(true);
    expect(registry.has('nonexistent')).toBe(false);
  });

  it('listTypes() returns registered types', () => {
    const registry = new TaskRegistry();
    registry.register(new BuildHandler());
    const types = registry.listTypes();
    expect(types).toContain('build');
  });
});

describe('createDefaultRegistry', () => {
  it('includes all 5 built-in handler types', () => {
    const registry = createDefaultRegistry();
    const types = registry.listTypes();
    expect(types).toContain('build');
    expect(types).toContain('test');
    expect(types).toContain('lint');
    expect(types).toContain('security');
    expect(types).toContain('custom');
  });
});

describe('BuildHandler.execute', () => {
  it('returns error when no command is provided', async () => {
    const handler = new BuildHandler();
    const task = { id: 'test-task', type: 'build' };
    const ctx = {
      runId: 'run-1',
      targetDir: '/tmp',
      workingDir: '/tmp',
      verbose: false,
    };
    const result = await handler.execute(task, ctx);
    expect(result.status).toBe('error');
    expect(result.error).toContain('No command specified');
  });
});
`;
}

export function generateSpecParserTests(): string {
  return `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SpecParser } from '../spec-parser.js';

describe('SpecParser', () => {
  let tmpDir: string;
  let parser: SpecParser;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-parser-'));
    parser = new SpecParser();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const validSpec = {
    name: 'test-eval',
    version: '1.0',
    target: { repo: './repo' },
    tasks: [
      { id: 'build', type: 'build', command: 'npm run build' },
    ],
  };

  it('parses a valid YAML spec', () => {
    const filePath = path.join(tmpDir, 'spec.yaml');
    const yaml = \`name: "test-eval"
version: "1.0"
target:
  repo: "./repo"
tasks:
  - id: build
    type: build
    command: "npm run build"
\`;
    fs.writeFileSync(filePath, yaml);
    const spec = parser.parse(filePath);
    expect(spec.name).toBe('test-eval');
    expect(spec.version).toBe('1.0');
    expect(spec.tasks).toHaveLength(1);
    expect(spec.tasks[0].id).toBe('build');
  });

  it('parses a valid JSON spec', () => {
    const filePath = path.join(tmpDir, 'spec.json');
    fs.writeFileSync(filePath, JSON.stringify(validSpec));
    const spec = parser.parse(filePath);
    expect(spec.name).toBe('test-eval');
    expect(spec.tasks).toHaveLength(1);
  });

  it('throws on non-existent file', () => {
    expect(() => parser.parse('/nonexistent/spec.yaml')).toThrow('Spec file not found');
  });

  it('throws on unsupported extension', () => {
    const filePath = path.join(tmpDir, 'spec.txt');
    fs.writeFileSync(filePath, 'hello');
    expect(() => parser.parse(filePath)).toThrow('Unsupported spec format');
  });

  it('rejects spec missing required name field', () => {
    const filePath = path.join(tmpDir, 'bad.json');
    fs.writeFileSync(filePath, JSON.stringify({ version: '1.0', target: {}, tasks: [{ id: 'a', type: 'b' }] }));
    expect(() => parser.parse(filePath)).toThrow('"name"');
  });

  it('rejects spec with empty tasks array', () => {
    const filePath = path.join(tmpDir, 'empty-tasks.json');
    fs.writeFileSync(filePath, JSON.stringify({ name: 'x', version: '1.0', target: {}, tasks: [] }));
    expect(() => parser.parse(filePath)).toThrow('tasks');
  });

  it('rejects task without id', () => {
    const filePath = path.join(tmpDir, 'no-id.json');
    fs.writeFileSync(filePath, JSON.stringify({ name: 'x', version: '1.0', target: {}, tasks: [{ type: 'build' }] }));
    expect(() => parser.parse(filePath)).toThrow('"id"');
  });

  it('rejects task without type', () => {
    const filePath = path.join(tmpDir, 'no-type.json');
    fs.writeFileSync(filePath, JSON.stringify({ name: 'x', version: '1.0', target: {}, tasks: [{ id: 'a' }] }));
    expect(() => parser.parse(filePath)).toThrow('"type"');
  });
});
`;
}

export function generateResultsManagerTests(): string {
  return `import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ResultsManager } from '../results-manager.js';

describe('ResultsManager', () => {
  let tmpDir: string;
  let manager: ResultsManager;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'results-mgr-'));
    manager = new ResultsManager(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('createRun', () => {
    it('returns an id starting with run-', () => {
      const id = manager.createRun();
      expect(id).toMatch(/^run-/);
    });

    it('creates tasks and predictions subdirectories', () => {
      const id = manager.createRun();
      const runDir = path.join(tmpDir, id);
      expect(fs.existsSync(path.join(runDir, 'tasks'))).toBe(true);
      expect(fs.existsSync(path.join(runDir, 'predictions'))).toBe(true);
    });
  });

  describe('manifest read/write', () => {
    it('roundtrips manifest data', () => {
      const id = manager.createRun();
      const manifest = { runId: id, specName: 'test', status: 'initialized' };
      manager.writeManifest(id, manifest);
      const read = manager.readManifest(id);
      expect(read).toEqual(manifest);
    });

    it('returns null for missing manifest', () => {
      expect(manager.readManifest('nonexistent-run')).toBeNull();
    });
  });

  describe('task result read/write', () => {
    it('roundtrips task result data', () => {
      const id = manager.createRun();
      const result = { taskId: 'build', status: 'pass', durationMs: 100 };
      manager.writeTaskResult(id, 'build', result);
      const read = manager.readTaskResult(id, 'build');
      expect(read).toEqual(result);
    });

    it('returns null for missing task result', () => {
      const id = manager.createRun();
      expect(manager.readTaskResult(id, 'nonexistent')).toBeNull();
    });
  });

  describe('readAllTaskResults', () => {
    it('returns results sorted by taskId', () => {
      const id = manager.createRun();
      manager.writeTaskResult(id, 'zeta', { taskId: 'zeta', status: 'pass' });
      manager.writeTaskResult(id, 'alpha', { taskId: 'alpha', status: 'fail' });
      manager.writeTaskResult(id, 'mid', { taskId: 'mid', status: 'pass' });

      const all = manager.readAllTaskResults(id);
      expect(all).toHaveLength(3);
      expect(all[0].taskId).toBe('alpha');
      expect(all[1].taskId).toBe('mid');
      expect(all[2].taskId).toBe('zeta');
    });
  });

  describe('writeSummary', () => {
    it('creates both summary.json and summary.md', () => {
      const id = manager.createRun();
      manager.writeSummary(id, { overall: 'pass' }, '# Report');
      const dir = path.join(tmpDir, id);
      expect(fs.existsSync(path.join(dir, 'summary.json'))).toBe(true);
      expect(fs.existsSync(path.join(dir, 'summary.md'))).toBe(true);

      const json = JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf-8'));
      expect(json.overall).toBe('pass');

      const md = fs.readFileSync(path.join(dir, 'summary.md'), 'utf-8');
      expect(md).toBe('# Report');
    });
  });

  describe('listRuns', () => {
    it('returns runs newest-first', () => {
      // Create runs with slightly different names to ensure ordering
      const id1 = manager.createRun();
      const id2 = manager.createRun();

      const runs = manager.listRuns();
      expect(runs.length).toBeGreaterThanOrEqual(2);
      // Newest first (lexicographic reverse)
      const ids = runs.map(r => r.runId);
      expect(ids.indexOf(id2)).toBeLessThan(ids.indexOf(id1));
    });
  });
});
`;
}
