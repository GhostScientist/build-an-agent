'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { Callout } from '@/components/docs/Callout';
import Link from 'next/link';

export default function ConceptsPage() {
  return (
    <DocsLayout
      title="Core Concepts"
      description="Learn modern agent engineering through small, measurable experiments."
    >
      <h2 id="learning-path">Learning path: build, observe, evaluate</h2>
      <p>
        Start with one task and one agent, not a multi-agent architecture. A model proposes
        actions; the runtime manages the loop; tools execute actions; your application must
        enforce permissions, limits, and review. A good agent is a measured system, not just
        a convincing prompt.
      </p>
      <p>
        Use either builder for these exercises. Work in a disposable directory with synthetic
        data and no production credentials. Keep the generated source open beside your terminal.
        These are guided experiments, not an automated course or a built-in evaluation dashboard.
      </p>
      <ol>
        <li>
          <strong>Establish a baseline.</strong> Pick a bounded task, such as answering questions
          about three local documents. Write five questions, expected evidence, and a rule for
          when the agent should abstain. Try a plain model prompt first. Deliverable: a small
          test set and baseline results.
        </li>
        <li>
          <strong>Inspect the agent loop.</strong> Generate a restrictive, read-only agent.
          Find instructions, tool schemas, execution handlers, and the SDK call in the source
          (or the prompt and MCP configuration for Tiny Agents). Follow one question from input
          to tool result to answer. Deliverable: a diagram of what runs locally and what leaves
          the machine.
        </li>
        <li>
          <strong>Test boundaries before adding power.</strong> Attempt an out-of-scope file
          read and a disabled write in your isolated workspace. Put an instruction to ignore
          the task in a test document and verify it is treated as untrusted data. Permission
          settings are not a sandbox. Deliverable: observed allow/deny results and any gaps
          you must fix before using real data.
        </li>
        <li>
          <strong>Add one tool or MCP server.</strong> Understand its schema, credentials,
          process/network access, and failure modes. Test malformed arguments, missing files,
          server outages, and tool-output injection. MCP connects tools; it does not establish
          trust. Deliverable: a least-privilege tool contract and failure checklist.
        </li>
        <li>
          <strong>Measure quality and cost.</strong> Repeat your baseline cases, record model
          and SDK versions, tool calls, errors, elapsed time, and provider-reported usage.
          Redact secrets and personal data from logs. Score correctness, source attribution,
          abstention, and policy compliance separately. Deliverable: a comparison table,
          including failures rather than only the best run.
        </li>
        <li>
          <strong>Compare before scaling.</strong> Change one variable: instructions, retrieval,
          model, or runtime. Repeat the same cases. Add a workflow or multiple agents only
          when the simpler baseline fails for a specific reason. Before deployment, implement
          step/time/spend limits, cancellation, safe retries, and human approval for irreversible
          actions. Deliverable: an evidence-backed decision and a list of remaining risks.
        </li>
      </ol>
      <Callout type="info" title="What is not generated for you">
        <p>
          Scaffolding does not provide a production sandbox, durable job orchestration,
          a universal tracing system, automated eval scoring, or a spend-control dashboard.
          SDK support for handoffs, tracing, structured output, and guardrails is not the same
          as those features being wired into this project.
        </p>
      </Callout>
      <p>
        Continue with the <Link href="/docs/quick-start" className="text-blue-600 hover:underline">Quick Start</Link>,
        compare <Link href="/docs/guide/sdk-configuration" className="text-blue-600 hover:underline">provider capabilities</Link>,
        and review <Link href="/docs/best-practices/security" className="text-blue-600 hover:underline">security guidance</Link>.
      </p>

      <h2>Domains</h2>
      <p>
        A <strong>domain</strong> represents the area of expertise for your agent. Agent Workshop
        supports five domains:
      </p>

      <table>
        <thead>
          <tr>
            <th>Domain</th>
            <th>Description</th>
            <th>Example Use Cases</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Development</strong></td>
            <td>Software engineering tasks</td>
            <td>Code review, testing, debugging, modernization</td>
          </tr>
          <tr>
            <td><strong>Business</strong></td>
            <td>Business process automation</td>
            <td>Document processing, reports, data entry</td>
          </tr>
          <tr>
            <td><strong>Creative</strong></td>
            <td>Content creation</td>
            <td>Blog writing, social media, copywriting</td>
          </tr>
          <tr>
            <td><strong>Data</strong></td>
            <td>Data analysis and ML</td>
            <td>Visualization, analysis, ML pipelines</td>
          </tr>
          <tr>
            <td><strong>Knowledge</strong></td>
            <td>Research and synthesis</td>
            <td>Literature review, citations, research</td>
          </tr>
        </tbody>
      </table>

      <p>
        Your domain choice influences which templates are shown and which tools are recommended.
      </p>

      <h2>Templates</h2>
      <p>
        A <strong>template</strong> is a pre-configured starting point for your agent. Templates include:
      </p>
      <ul>
        <li>Default tool selections appropriate for the use case</li>
        <li>Sample prompts demonstrating the agent&apos;s capabilities</li>
        <li>Custom instructions that shape the agent&apos;s behavior</li>
      </ul>

      <p>
        Agent Workshop includes 17 templates across all domains. See the{' '}
        <Link href="/docs/templates" className="text-blue-600 hover:underline">
          Templates Reference
        </Link>{' '}
        for the complete list.
      </p>

      <h2>Tools</h2>
      <p>
        <strong>Tools</strong> are the capabilities your agent can use to interact with the world.
        Each tool has a risk level:
      </p>

      <table>
        <thead>
          <tr>
            <th>Risk Level</th>
            <th>Description</th>
            <th>Examples</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-sm">Low</span></td>
            <td>Read-only operations</td>
            <td>read-file, find-files, search-files, web-search</td>
          </tr>
          <tr>
            <td><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-sm">Medium</span></td>
            <td>Write operations with safeguards</td>
            <td>write-file, edit-file, git-operations, database-query</td>
          </tr>
          <tr>
            <td><span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-sm">High</span></td>
            <td>Unrestricted system access</td>
            <td>run-command</td>
          </tr>
        </tbody>
      </table>

      <Callout type="warning" title="Security consideration">
        <p>
          High-risk tools like <code>run-command</code> can execute arbitrary shell commands.
          Only enable these when necessary and understand the implications.
        </p>
      </Callout>

      <h2>Permission Levels</h2>
      <p>
        Permission levels control which tools are enabled by default:
      </p>

      <ul>
        <li>
          <strong>Restrictive</strong> - Only read-only tools (read-file, find-files, search-files, web-search)
        </li>
        <li>
          <strong>Balanced</strong> - Read operations plus controlled writes (adds write-file, git-operations, web-fetch, api-client)
        </li>
        <li>
          <strong>Permissive</strong> - All tools enabled including run-command
        </li>
      </ul>

      <h2>MCP Servers</h2>
      <p>
        <strong>Model Context Protocol (MCP)</strong> servers extend your agent&apos;s capabilities
        by connecting to external services. MCP servers can provide:
      </p>
      <ul>
        <li>Additional tools (e.g., GitHub operations, database queries)</li>
        <li>Data sources (e.g., Google Drive, AWS)</li>
        <li>Custom integrations</li>
      </ul>

      <p>
        Agent Workshop supports four transport types for MCP:
      </p>
      <ul>
        <li><strong>stdio</strong> - Local command execution (most common)</li>
        <li><strong>http</strong> - REST endpoints</li>
        <li><strong>sse</strong> - Server-Sent Events</li>
        <li><strong>sdk</strong> - In-process JavaScript modules</li>
      </ul>

      <h2>The 5 Levers (Claude Code)</h2>
      <p>
        Claude Code provides five control mechanisms called &quot;levers&quot; that shape agent behavior.
        These are configured in the <strong>target project</strong> where you run your agent,
        not bundled with the generated agent itself.
      </p>

      <table>
        <thead>
          <tr>
            <th>Lever</th>
            <th>File Location</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Memory</strong></td>
            <td><code>CLAUDE.md</code></td>
            <td>Persistent context loaded every conversation</td>
          </tr>
          <tr>
            <td><strong>Slash Commands</strong></td>
            <td><code>.claude/commands/*.md</code></td>
            <td>User-invoked prompt templates</td>
          </tr>
          <tr>
            <td><strong>Skills</strong></td>
            <td><code>.claude/skills/*/SKILL.md</code></td>
            <td>Model-invoked capabilities</td>
          </tr>
          <tr>
            <td><strong>Subagents</strong></td>
            <td><code>.claude/agents/*.md</code></td>
            <td>Specialized delegate agents</td>
          </tr>
          <tr>
            <td><strong>Hooks</strong></td>
            <td><code>.claude/settings.json</code></td>
            <td>Event-driven automation</td>
          </tr>
        </tbody>
      </table>

      <Callout type="info" title="Levers are project-specific">
        <p>
          These files are created in the project where you use Claude Code (or your generated agent),
          not in the agent itself. This allows you to customize behavior per-project.
        </p>
      </Callout>

      <p>
        See{' '}
        <Link href="/docs/features/levers" className="text-blue-600 hover:underline">
          The 5 Levers
        </Link>{' '}
        for detailed documentation on each lever.
      </p>

      <h2>Generated Project</h2>
      <p>
        When you complete the wizard, Agent Workshop generates a complete TypeScript project
        that includes:
      </p>

      <ul>
        <li><strong>CLI entry point</strong> - Interactive command-line interface</li>
        <li><strong>Agent logic</strong> - Core agent implementation with tool bindings</li>
        <li><strong>Configuration</strong> - Settings management and environment variables</li>
        <li><strong>Permissions</strong> - Security boundary enforcement</li>
        <li><strong>MCP integration</strong> - External server connections</li>
        <li><strong>Workflow commands</strong> - Domain-specific operations</li>
      </ul>

      <p>
        The generated code is fully customizable. See{' '}
        <Link href="/docs/generated/project-structure" className="text-blue-600 hover:underline">
          Project Structure
        </Link>{' '}
        for details on each file.
      </p>

      <h2>SDK Providers</h2>
      <p>
        Agent Workshop supports several AI providers:
      </p>

      <h3>Claude Agent SDK</h3>
      <ul>
        <li>Built by Anthropic specifically for agent development</li>
        <li>Native streaming support</li>
        <li>Built-in file operation tools</li>
        <li>Models: Claude Sonnet 4.5, Haiku 4.5, Opus 4.1</li>
      </ul>

      <h3>OpenAI Agents SDK</h3>
      <ul>
        <li>Built by OpenAI for agent development</li>
        <li>Function calling with tool use</li>
        <li>Streaming support</li>
        <li>Models: GPT-5.1, GPT-5 mini, GPT-4.1, and more</li>
      </ul>

      <h3>GitHub Copilot SDK</h3>
      <ul>
        <li>Drives the same agent runtime as Copilot CLI</li>
        <li>No API key &mdash; authenticates with your Copilot subscription</li>
        <li>Built-in file, search and shell tools (no generated wrappers)</li>
        <li>Models: Auto, Claude Sonnet 4.5, GPT-5, GPT-5.4, GPT-5.2 Codex</li>
        <li>Requires a supported Node.js version matching the generated package.json</li>
      </ul>

      <Callout type="info">
        <p>
          These SDKs produce functionally similar agents. Choose based on your preferred
          AI provider, model availability, and whether you already have an API key or a
          Copilot subscription.
        </p>
      </Callout>
    </DocsLayout>
  );
}
