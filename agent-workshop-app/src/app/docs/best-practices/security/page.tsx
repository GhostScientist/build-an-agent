'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';

export default function SecurityGuidelinesPage() {
  return (
    <DocsLayout
      title="Security Guidelines"
      description="Best practices for secure agent configuration and operation."
    >
      <p>
        Security is critical when building AI agents that interact with your
        systems. This guide covers best practices for safe agent configuration
        and operation.
      </p>

      <h2>Permission Levels</h2>
      <p>
        Choose the appropriate permission level for your use case:
      </p>

      <h3>Restrictive</h3>
      <p>
        Read-only access. Best for:
      </p>
      <ul>
        <li>Code review and analysis</li>
        <li>Research and information gathering</li>
        <li>Auditing and compliance checks</li>
        <li>Untrusted environments</li>
      </ul>

      <h3>Balanced</h3>
      <p>
        Read and controlled write access. Best for:
      </p>
      <ul>
        <li>Development assistance</li>
        <li>Documentation generation</li>
        <li>Report creation</li>
        <li>Most production use cases</li>
      </ul>

      <h3>Permissive</h3>
      <p>
        Full access including command execution. Best for:
      </p>
      <ul>
        <li>Trusted development environments</li>
        <li>Automated testing</li>
        <li>Local development only</li>
      </ul>

      <Callout type="warning" title="Avoid permissive in production">
        <p>
          The <code>permissive</code> level enables <code>run-command</code> which
          can execute arbitrary shell commands. Use with extreme caution.
        </p>
      </Callout>

      <h2>Tool Selection</h2>

      <h3>Principle of Least Privilege</h3>
      <p>
        Only enable tools your agent actually needs:
      </p>
      <ul>
        <li>Start with the minimum set of tools</li>
        <li>Add tools as specific needs arise</li>
        <li>Regularly audit enabled tools</li>
        <li>Disable unused tools</li>
      </ul>

      <h3>High-Risk Tools</h3>
      <p>
        These tools require extra consideration:
      </p>

      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Risk</th>
            <th>Consideration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>run-command</code></td>
            <td>High</td>
            <td>Can execute any shell command</td>
          </tr>
          <tr>
            <td><code>write-file</code></td>
            <td>Medium</td>
            <td>Can overwrite files</td>
          </tr>
          <tr>
            <td><code>edit-file</code></td>
            <td>Medium</td>
            <td>Can modify existing files</td>
          </tr>
          <tr>
            <td><code>database-query</code></td>
            <td>Medium</td>
            <td>Can execute SQL queries</td>
          </tr>
          <tr>
            <td><code>api-client</code></td>
            <td>Medium</td>
            <td>Can make external requests</td>
          </tr>
        </tbody>
      </table>

      <h2>Path Restrictions</h2>
      <p>
        Configure path restrictions in the permission system:
      </p>

      <CodeBlock
        language="typescript"
        code={`// src/permissions.ts
const restrictedPaths = [
  // System directories
  '/etc',
  '/usr',
  '/bin',
  '/sbin',

  // User sensitive directories
  process.env.HOME + '/.ssh',
  process.env.HOME + '/.aws',
  process.env.HOME + '/.config',

  // Application sensitive
  '.env',
  'credentials.json',
  'secrets/',
];`}
      />

      <h2>Command Restrictions</h2>
      <p>
        If <code>run-command</code> is enabled, restrict dangerous commands:
      </p>

      <CodeBlock
        language="typescript"
        code={`// src/permissions.ts
const blockedCommands = [
  // Destructive commands
  'rm -rf',
  'rmdir',
  'mkfs',

  // Privilege escalation
  'sudo',
  'su',
  'chmod 777',

  // Network exposure
  'nc -l',
  'ssh-keygen',

  // Sensitive data access
  'cat /etc/passwd',
  'cat /etc/shadow',
];`}
      />

      <h2>Environment Variables</h2>

      <h3>Never Commit Secrets</h3>
      <ul>
        <li>Use <code>.env</code> files (gitignored)</li>
        <li>Use <code>.env.example</code> as template</li>
        <li>Never hardcode API keys</li>
      </ul>

      <h3>Validate Environment</h3>
      <CodeBlock
        language="typescript"
        code={`// Validate required environment variables
const requiredEnvVars = [
  'ANTHROPIC_API_KEY', // or OPENAI_API_KEY
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(\`Missing required environment variable: \${envVar}\`);
  }
}`}
      />

      <h2>Hooks for Security</h2>
      <p>
        Use hooks to enforce security policies:
      </p>

      <h3>Block Secrets in Commits</h3>
      <CodeBlock
        language="json"
        code={`{
  "name": "block-secrets",
  "event": "PreToolUse",
  "matcher": "Bash",
  "command": "if echo \\"$CLAUDE_TOOL_INPUT\\" | grep -qE 'git (commit|push)'; then git diff --cached | grep -qE '(API_KEY|SECRET|PASSWORD|TOKEN)=' && exit 1; fi",
  "timeout": 10000
}`}
      />

      <h3>Validate File Types</h3>
      <CodeBlock
        language="json"
        code={`{
  "name": "validate-write",
  "event": "PreToolUse",
  "matcher": "Write",
  "command": "if echo \\"$CLAUDE_FILE_PATH\\" | grep -qE '\\\\.(env|pem|key)$'; then exit 1; fi",
  "timeout": 5000
}`}
      />

      <h2>MCP Server Security</h2>

      <h3>Use Environment Variables</h3>
      <p>
        Never hardcode credentials in MCP configurations:
      </p>
      <CodeBlock
        language="json"
        code={`{
  "env": {
    "GITHUB_TOKEN": "\${GITHUB_TOKEN}",
    "DATABASE_URL": "\${DATABASE_URL}"
  }
}`}
      />

      <h3>Audit Server Permissions</h3>
      <p>
        MCP servers may have their own permissions. Verify:
      </p>
      <ul>
        <li>What data the server can access</li>
        <li>What actions it can perform</li>
        <li>Whether it requires network access</li>
      </ul>

      <h2>Audit and Monitoring</h2>

      <h3>Log Tool Usage</h3>
      <p>
        Track what tools are being used and with what parameters:
      </p>
      <CodeBlock
        language="typescript"
        code={`// Add logging to tool execution
const originalExecute = tool.execute;
tool.execute = async (params) => {
  console.log(\`[AUDIT] Tool: \${tool.name}, Params: \${JSON.stringify(params)}\`);
  const result = await originalExecute(params);
  console.log(\`[AUDIT] Result: \${tool.name} completed\`);
  return result;
};`}
      />

      <h3>Review Conversations</h3>
      <p>
        Periodically review agent conversations for:
      </p>
      <ul>
        <li>Unexpected tool usage patterns</li>
        <li>Access to sensitive areas</li>
        <li>Prompt injection attempts</li>
      </ul>

      <h2>Security Checklist</h2>

      <Callout type="tip" title="Before deployment">
        <p>Verify the following:</p>
        <ul className="mt-2 list-disc list-inside">
          <li>Permission level matches use case</li>
          <li>Only necessary tools are enabled</li>
          <li>Path restrictions are configured</li>
          <li>Command restrictions are in place</li>
          <li>Secrets are in environment variables</li>
          <li><code>.env</code> is gitignored</li>
          <li>MCP servers use env vars for credentials</li>
          <li>Hooks validate sensitive operations</li>
        </ul>
      </Callout>
    </DocsLayout>
  );
}
