'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';

export default function HooksPage() {
  return (
    <DocsLayout
      title="Hooks"
      description="Event-driven automation that runs shell commands on agent actions."
    >
      <p>
        Hooks are automated shell commands that run in response to agent events.
        They enable automatic code formatting, linting, testing, and validation
        without manual intervention.
      </p>

      <h2>How It Works</h2>
      <p>
        When an agent performs an action:
      </p>
      <ol>
        <li>The event type is determined (PreToolUse, PostToolUse, etc.)</li>
        <li>Matching hooks are identified based on event and tool matcher</li>
        <li>The hook&apos;s shell command is executed</li>
        <li>The agent receives the command output</li>
      </ol>

      <h2>File Location</h2>
      <p>
        Hooks are configured in <code>.claude/settings.json</code>:
      </p>
      <CodeBlock
        language="json"
        filename=".claude/settings.json"
        code={`{
  "hooks": {
    "PostToolUse": [
      {
        "name": "prettier-on-write",
        "matcher": "Write",
        "command": "npx prettier --write $CLAUDE_FILE_PATH",
        "timeout": 30000
      }
    ]
  }
}`}
      />

      <h2>Hook Events</h2>

      <table>
        <thead>
          <tr>
            <th>Event</th>
            <th>When It Fires</th>
            <th>Common Use Cases</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>PreToolUse</code></td>
            <td>Before a tool executes</td>
            <td>Validation, blocking dangerous operations</td>
          </tr>
          <tr>
            <td><code>PostToolUse</code></td>
            <td>After a tool completes</td>
            <td>Formatting, linting, testing</td>
          </tr>
          <tr>
            <td><code>Notification</code></td>
            <td>When agent sends a notification</td>
            <td>Alerts, logging, integrations</td>
          </tr>
          <tr>
            <td><code>Stop</code></td>
            <td>When agent stops execution</td>
            <td>Cleanup, final validation</td>
          </tr>
        </tbody>
      </table>

      <h2>Hook Configuration</h2>

      <h3>name</h3>
      <p>
        Identifier for the hook. Used in logs and debugging.
      </p>

      <h3>matcher (optional)</h3>
      <p>
        Tool name to match. If specified, the hook only runs for that tool.
        Common matchers: <code>Write</code>, <code>Edit</code>, <code>Bash</code>.
      </p>

      <h3>command</h3>
      <p>
        Shell command to execute. Can include environment variables.
      </p>

      <h3>timeout</h3>
      <p>
        Maximum execution time in milliseconds. Default: 30000 (30 seconds).
      </p>

      <h2>Environment Variables</h2>
      <p>
        Hooks have access to context variables:
      </p>
      <ul>
        <li><code>$CLAUDE_FILE_PATH</code> - The file being operated on</li>
        <li><code>$CLAUDE_TOOL_NAME</code> - The tool being executed</li>
      </ul>

      <h2>Built-in Hook Templates</h2>

      <h3>prettier-on-write</h3>
      <p>Auto-format files after writing.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "prettier-on-write",
  "event": "PostToolUse",
  "matcher": "Write",
  "command": "npx prettier --write $CLAUDE_FILE_PATH",
  "timeout": 30000
}`}
      />

      <h3>eslint-on-write</h3>
      <p>Run ESLint after writing.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "eslint-on-write",
  "event": "PostToolUse",
  "matcher": "Write",
  "command": "npx eslint --fix $CLAUDE_FILE_PATH",
  "timeout": 30000
}`}
      />

      <h3>typecheck-on-write</h3>
      <p>Run TypeScript type checking.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "typecheck-on-write",
  "event": "PostToolUse",
  "matcher": "Write",
  "command": "npx tsc --noEmit",
  "timeout": 60000
}`}
      />

      <h3>test-on-write</h3>
      <p>Run related tests after writing.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "test-on-write",
  "event": "PostToolUse",
  "matcher": "Write",
  "command": "npm test -- --findRelatedTests $CLAUDE_FILE_PATH",
  "timeout": 120000
}`}
      />

      <h3>block-secrets</h3>
      <p>Prevent committing files with secrets.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "block-secrets",
  "event": "PreToolUse",
  "matcher": "Bash",
  "command": "if echo \\"$CLAUDE_TOOL_INPUT\\" | grep -q 'git commit'; then git diff --cached --name-only | xargs grep -l 'API_KEY\\\\|SECRET\\\\|PASSWORD' && exit 1 || exit 0; fi",
  "timeout": 10000
}`}
      />

      <Callout type="warning" title="PreToolUse blocking">
        <p>
          <code>PreToolUse</code> hooks can block operations. If the command exits
          with a non-zero status, the tool execution is prevented.
        </p>
      </Callout>

      <h2>Complete Settings Example</h2>
      <CodeBlock
        language="json"
        filename=".claude/settings.json"
        code={`{
  "hooks": {
    "PreToolUse": [
      {
        "name": "block-secrets",
        "matcher": "Bash",
        "command": "echo 'Checking for secrets...'",
        "timeout": 10000
      }
    ],
    "PostToolUse": [
      {
        "name": "prettier-on-write",
        "matcher": "Write",
        "command": "npx prettier --write $CLAUDE_FILE_PATH",
        "timeout": 30000
      },
      {
        "name": "eslint-on-write",
        "matcher": "Write",
        "command": "npx eslint --fix $CLAUDE_FILE_PATH",
        "timeout": 30000
      }
    ],
    "Stop": [
      {
        "name": "final-check",
        "command": "npm run lint && npm test",
        "timeout": 180000
      }
    ]
  }
}`}
      />

      <h2>Configuration in Agent Workshop</h2>
      <p>
        In the Levers Configuration step, the Hooks tab lets you:
      </p>
      <ul>
        <li><strong>Add from templates</strong> - Use pre-built hook templates</li>
        <li><strong>Create custom</strong> - Define your own hooks</li>
        <li><strong>Select event</strong> - Choose when the hook fires</li>
        <li><strong>Configure matcher</strong> - Specify which tools trigger the hook</li>
        <li><strong>Set command</strong> - Define the shell command to run</li>
        <li><strong>Adjust timeout</strong> - Set execution time limit</li>
        <li><strong>Enable/disable</strong> - Toggle individual hooks</li>
      </ul>

      <h2>Best Practices</h2>

      <h3>Keep Commands Fast</h3>
      <p>
        Slow hooks disrupt the workflow. Use appropriate timeouts and optimize
        commands for speed.
      </p>

      <h3>Use Matchers Appropriately</h3>
      <p>
        Don&apos;t run formatting on non-code files. Use matchers to target specific
        tools and file types.
      </p>

      <h3>Handle Failures Gracefully</h3>
      <p>
        Consider what happens if a hook fails. For <code>PostToolUse</code>, failures
        are usually warnings. For <code>PreToolUse</code>, failures block operations.
      </p>

      <h3>Test Hooks Thoroughly</h3>
      <p>
        Test your hook commands manually before enabling them. Broken hooks can
        disrupt agent operation.
      </p>

      <h3>Be Careful with PreToolUse</h3>
      <p>
        <code>PreToolUse</code> hooks can block legitimate operations. Only use
        them for critical safety checks.
      </p>
    </DocsLayout>
  );
}
