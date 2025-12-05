'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';

export default function SubagentsPage() {
  return (
    <DocsLayout
      title="Subagents"
      description="Specialized delegate agents with focused expertise."
    >
      <p>
        Subagents are specialized agents that the main agent can delegate tasks to.
        They have their own system prompts, tool access, and can use different models.
        This enables focused expertise while preserving the main agent&apos;s context.
      </p>

      <h2>How It Works</h2>
      <p>
        When the main agent encounters a task suited for delegation:
      </p>
      <ol>
        <li>It identifies the appropriate subagent based on the task</li>
        <li>The subagent is spawned with its own context and tools</li>
        <li>The subagent completes the task and returns results</li>
        <li>The main agent incorporates the results and continues</li>
      </ol>

      <h2>Benefits</h2>
      <ul>
        <li><strong>Context preservation</strong> - Main agent context isn&apos;t consumed by specialized tasks</li>
        <li><strong>Focused expertise</strong> - Subagents have specialized system prompts</li>
        <li><strong>Different permissions</strong> - Subagents can have different tool access</li>
        <li><strong>Model flexibility</strong> - Use faster/cheaper models for simple tasks</li>
      </ul>

      <h2>File Location</h2>
      <p>
        Subagents are defined in <code>.claude/agents/</code>:
      </p>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`.claude/
└── agents/
    ├── test-runner.md
    ├── code-reviewer.md
    ├── security-auditor.md
    └── documentation-writer.md`}
      </pre>

      <h2>Subagent Structure</h2>
      <p>
        Each subagent file defines its configuration:
      </p>

      <CodeBlock
        language="markdown"
        filename=".claude/agents/test-runner.md"
        code={`# Test Runner

## Description
Specialist in running and debugging tests. Handles test execution,
failure analysis, and fix implementation.

## System Prompt
You are a test automation specialist. Your responsibilities:

1. Execute test suites efficiently
2. Analyze test failures thoroughly
3. Identify root causes of failures
4. Implement fixes with minimal changes
5. Verify fixes don't break other tests

Always:
- Run the full relevant test suite after fixes
- Explain what caused each failure
- Document any test environment issues

## Tools
- Bash
- Read
- Write
- Edit

## Model
sonnet

## Permission Mode
default`}
      />

      <h2>Configuration Options</h2>

      <h3>System Prompt</h3>
      <p>
        The role definition and instructions for the subagent. This shapes its
        behavior and focus.
      </p>

      <h3>Tools</h3>
      <p>
        Which tools the subagent can use. Common options:
      </p>
      <ul>
        <li><code>Read</code> - Read files</li>
        <li><code>Write</code> - Create files</li>
        <li><code>Edit</code> - Modify files</li>
        <li><code>Bash</code> - Run shell commands</li>
        <li><code>Glob</code> - Find files by pattern</li>
        <li><code>Grep</code> - Search file contents</li>
      </ul>

      <h3>Model</h3>
      <p>
        Which AI model to use:
      </p>
      <ul>
        <li><code>sonnet</code> - Claude Sonnet (balanced)</li>
        <li><code>opus</code> - Claude Opus (most capable)</li>
        <li><code>haiku</code> - Claude Haiku (fastest, cheapest)</li>
        <li><code>inherit</code> - Use same model as main agent</li>
      </ul>

      <h3>Permission Mode</h3>
      <p>
        Security level for the subagent:
      </p>
      <ul>
        <li><code>default</code> - Normal permission checks</li>
        <li><code>bypassPermissions</code> - Skip permission checks (use with caution)</li>
        <li><code>planMode</code> - Planning only, no execution</li>
      </ul>

      <Callout type="warning" title="Permission modes">
        <p>
          Use <code>bypassPermissions</code> carefully. It allows the subagent to
          execute without confirmation, which can be risky for destructive operations.
        </p>
      </Callout>

      <h2>Built-in Subagent Templates</h2>

      <h3>test-runner</h3>
      <p>Test automation specialist.</p>
      <ul>
        <li><strong>Model</strong>: sonnet</li>
        <li><strong>Tools</strong>: Bash, Read, Write, Edit</li>
        <li><strong>Focus</strong>: Test execution, failure analysis, fixes</li>
      </ul>

      <h3>code-reviewer</h3>
      <p>Thorough code review expert.</p>
      <ul>
        <li><strong>Model</strong>: sonnet</li>
        <li><strong>Tools</strong>: Read, Glob, Grep</li>
        <li><strong>Focus</strong>: Quality, patterns, improvements</li>
      </ul>

      <h3>security-auditor</h3>
      <p>Security-focused analysis specialist.</p>
      <ul>
        <li><strong>Model</strong>: opus (higher capability for security)</li>
        <li><strong>Tools</strong>: Read, Glob, Grep, Bash</li>
        <li><strong>Focus</strong>: Vulnerabilities, compliance, best practices</li>
      </ul>

      <h3>documentation-writer</h3>
      <p>Technical documentation expert.</p>
      <ul>
        <li><strong>Model</strong>: sonnet</li>
        <li><strong>Tools</strong>: Read, Write, Glob</li>
        <li><strong>Focus</strong>: Clear docs, examples, API references</li>
      </ul>

      <h2>Creating Custom Subagents</h2>

      <h3>Example: Database Migration Subagent</h3>
      <CodeBlock
        language="markdown"
        filename=".claude/agents/db-migrator.md"
        code={`# Database Migrator

## Description
Handles database schema changes, migration creation, and data transformations.

## System Prompt
You are a database migration specialist. Your responsibilities:

1. Analyze current schema state
2. Design migration strategies
3. Create forward and rollback migrations
4. Handle data transformations safely
5. Verify migration success

Guidelines:
- Always create reversible migrations
- Test migrations on sample data first
- Document breaking changes
- Consider performance for large tables
- Use transactions where possible

## Tools
- Read
- Write
- Bash
- Grep

## Model
sonnet

## Permission Mode
default`}
      />

      <h2>Configuration in Agent Workshop</h2>
      <p>
        In the Levers Configuration step, the Subagents tab lets you:
      </p>
      <ul>
        <li><strong>Add from templates</strong> - Use pre-built subagent templates</li>
        <li><strong>Create custom</strong> - Define your own subagents</li>
        <li><strong>Configure system prompt</strong> - Define role and instructions</li>
        <li><strong>Select tools</strong> - Choose which tools the subagent can use</li>
        <li><strong>Choose model</strong> - Select the AI model</li>
        <li><strong>Set permissions</strong> - Configure security level</li>
        <li><strong>Enable/disable</strong> - Toggle individual subagents</li>
      </ul>

      <h2>Best Practices</h2>

      <h3>Keep Subagents Focused</h3>
      <p>
        Each subagent should have a clear, narrow focus. Don&apos;t create &quot;generalist&quot;
        subagents that do everything.
      </p>

      <h3>Match Model to Task</h3>
      <p>
        Use Haiku for simple, fast tasks. Use Opus for complex analysis requiring
        high capability. Sonnet is a good default.
      </p>

      <h3>Minimize Tool Access</h3>
      <p>
        Only give subagents the tools they need. A code reviewer doesn&apos;t need
        write access.
      </p>

      <h3>Document Delegation Criteria</h3>
      <p>
        The description should make clear when to delegate to this subagent.
      </p>
    </DocsLayout>
  );
}
