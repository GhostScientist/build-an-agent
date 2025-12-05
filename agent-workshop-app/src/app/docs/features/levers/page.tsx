'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { Callout } from '@/components/docs/Callout';
import Link from 'next/link';
import { FileText, Terminal, Lightbulb, Users, Zap } from 'lucide-react';

export default function LeversOverviewPage() {
  return (
    <DocsLayout
      title="The 5 Levers of Control"
      description="Powerful mechanisms for shaping agent behavior without modifying code."
    >
      <p>
        Levers are Claude Code control mechanisms that let you customize agent behavior
        through configuration files rather than code changes. Each lever serves a distinct
        purpose in the agent&apos;s operation.
      </p>

      <Callout type="info" title="Where do levers live?">
        <p>
          Levers are configured in the <strong>target project</strong> where you run your
          agent (or Claude Code), not bundled with the generated agent itself. This means
          you can customize behavior per-project without modifying the agent code.
        </p>
      </Callout>

      <h2>Overview</h2>

      <div className="grid grid-cols-1 gap-4 not-prose my-6">
        <Link href="/docs/features/levers/memory" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Memory</h3>
              <p className="text-sm text-gray-500">CLAUDE.md</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Persistent context loaded at the start of every conversation. Define project
            structure, coding standards, and security boundaries.
          </p>
        </Link>

        <Link href="/docs/features/levers/slash-commands" className="block p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Slash Commands</h3>
              <p className="text-sm text-gray-500">.claude/commands/*.md</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            User-invoked prompt templates for common workflows. Type /command to expand
            a reusable prompt with placeholders for arguments.
          </p>
        </Link>

        <Link href="/docs/features/levers/skills" className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Skills</h3>
              <p className="text-sm text-gray-500">.claude/skills/*/SKILL.md</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Model-invoked capabilities loaded contextually. The agent loads relevant skills
            automatically based on the current task.
          </p>
        </Link>

        <Link href="/docs/features/levers/subagents" className="block p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Subagents</h3>
              <p className="text-sm text-gray-500">.claude/agents/*.md</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Specialized delegate agents with focused expertise. Delegate complex tasks
            while preserving the main agent&apos;s context.
          </p>
        </Link>

        <Link href="/docs/features/levers/hooks" className="block p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Hooks</h3>
              <p className="text-sm text-gray-500">.claude/settings.json</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Event-driven automation that runs shell commands in response to agent actions.
            Auto-format, lint, test, or validate on tool use.
          </p>
        </Link>
      </div>

      <h2>Comparison Table</h2>

      <table>
        <thead>
          <tr>
            <th>Lever</th>
            <th>Invoked By</th>
            <th>When</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Memory</strong></td>
            <td>System</td>
            <td>Every conversation start</td>
            <td>Persistent context</td>
          </tr>
          <tr>
            <td><strong>Slash Commands</strong></td>
            <td>User</td>
            <td>When user types /command</td>
            <td>Reusable prompts</td>
          </tr>
          <tr>
            <td><strong>Skills</strong></td>
            <td>Model</td>
            <td>When contextually relevant</td>
            <td>Specialized knowledge</td>
          </tr>
          <tr>
            <td><strong>Subagents</strong></td>
            <td>Model</td>
            <td>For delegated tasks</td>
            <td>Focused expertise</td>
          </tr>
          <tr>
            <td><strong>Hooks</strong></td>
            <td>Events</td>
            <td>On tool use</td>
            <td>Automated validation</td>
          </tr>
        </tbody>
      </table>

      <h2>When to Use Each Lever</h2>

      <h3>Use Memory When...</h3>
      <ul>
        <li>You have project-specific context the agent should always know</li>
        <li>You need to define coding standards or conventions</li>
        <li>You want to set security boundaries</li>
        <li>You have deployment or build procedures to document</li>
      </ul>

      <h3>Use Slash Commands When...</h3>
      <ul>
        <li>You have repetitive workflows (PR review, deployment, testing)</li>
        <li>You want users to trigger specific actions</li>
        <li>You need parameterized prompts</li>
        <li>You want to standardize common operations</li>
      </ul>

      <h3>Use Skills When...</h3>
      <ul>
        <li>You have domain expertise to encode</li>
        <li>You want capabilities loaded only when relevant</li>
        <li>You need to associate specific tools with specific knowledge</li>
        <li>You want progressive disclosure of capabilities</li>
      </ul>

      <h3>Use Subagents When...</h3>
      <ul>
        <li>Tasks require focused, specialized expertise</li>
        <li>You want to preserve main agent context</li>
        <li>You need different permission levels for different tasks</li>
        <li>You want parallel execution of complex workflows</li>
      </ul>

      <h3>Use Hooks When...</h3>
      <ul>
        <li>You want automatic code formatting</li>
        <li>You need to validate changes before they&apos;re accepted</li>
        <li>You want to run tests after modifications</li>
        <li>You need to prevent certain actions (e.g., committing secrets)</li>
      </ul>

      <Callout type="tip" title="Start simple">
        <p>
          For most agents, start with just <strong>Memory</strong> to provide project context.
          Add other levers as you identify specific needs. Over-configuration can make
          your agent harder to maintain.
        </p>
      </Callout>

      <h2>File Structure</h2>
      <p>
        When using Claude Code or a generated agent, create these files in your <strong>target project</strong>:
      </p>

      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`your-project/              # The project where you work
├── CLAUDE.md              # Memory - project context
├── .claude/
│   ├── commands/          # Slash Commands
│   │   ├── review-pr.md
│   │   ├── test.md
│   │   └── deploy.md
│   ├── skills/            # Skills
│   │   └── code-review/
│   │       └── SKILL.md
│   ├── agents/            # Subagents
│   │   ├── test-runner.md
│   │   └── security-auditor.md
│   └── settings.json      # Hooks
└── ... your project files`}
      </pre>

      <p className="mt-4">
        These files are read by Claude Code (or your generated agent) at runtime
        and customize behavior for that specific project.
      </p>
    </DocsLayout>
  );
}
