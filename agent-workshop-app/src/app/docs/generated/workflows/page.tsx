'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';

export default function WorkflowsPage() {
  return (
    <DocsLayout
      title="Workflow Commands"
      description="Using and creating domain-specific multi-step workflows."
    >
      <p>
        Workflows are pre-defined multi-step operations that automate complex tasks.
        They&apos;re defined as JSON files in the <code>.commands/</code> directory
        and can be executed via the CLI.
      </p>

      <h2>Domain-Specific Workflows</h2>
      <p>
        Based on your selected domain, the generator includes relevant workflow templates.
      </p>

      <h3>Development Domain</h3>
      <ul>
        <li><code>code-audit</code> - Security and quality audit</li>
        <li><code>test-suite</code> - Test generation and execution</li>
        <li><code>refactor-analysis</code> - Refactoring recommendations</li>
      </ul>

      <h3>Business Domain</h3>
      <ul>
        <li><code>invoice-batch</code> - Process multiple invoices</li>
        <li><code>contract-review</code> - Analyze contracts</li>
        <li><code>meeting-summary</code> - Summarize meeting notes</li>
      </ul>

      <h3>Creative Domain</h3>
      <ul>
        <li><code>content-calendar</code> - Plan content schedule</li>
        <li><code>blog-outline</code> - Generate blog structure</li>
        <li><code>campaign-brief</code> - Create marketing briefs</li>
      </ul>

      <h3>Data Domain</h3>
      <ul>
        <li><code>dataset-profile</code> - Analyze dataset characteristics</li>
        <li><code>chart-report</code> - Generate visualizations</li>
      </ul>

      <h3>Knowledge Domain</h3>
      <ul>
        <li><code>literature-review</code> - Systematic literature analysis</li>
        <li><code>experiment-log</code> - Document experiments</li>
      </ul>

      <h2>Running Workflows</h2>
      <p>
        Execute workflows using the CLI:
      </p>
      <CodeBlock
        language="bash"
        code={`# List available workflows
npm start -- workflow list

# Run a workflow
npm start -- workflow run code-audit

# Run with arguments
npm start -- workflow run code-audit --path ./src`}
      />

      <h2>Workflow Structure</h2>
      <p>
        Workflows are JSON files with the following structure:
      </p>
      <CodeBlock
        language="json"
        filename=".commands/code-audit.json"
        code={`{
  "name": "code-audit",
  "description": "Perform a comprehensive code audit",
  "steps": [
    {
      "name": "scan",
      "prompt": "Scan the codebase for security vulnerabilities and code smells",
      "tools": ["find-files", "search-files", "read-file"]
    },
    {
      "name": "analyze",
      "prompt": "Analyze the findings and categorize by severity",
      "dependsOn": ["scan"]
    },
    {
      "name": "report",
      "prompt": "Generate a detailed audit report with recommendations",
      "dependsOn": ["analyze"],
      "output": "AUDIT_REPORT.md"
    }
  ]
}`}
      />

      <h2>Workflow Properties</h2>

      <h3>Top Level</h3>
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>name</code></td>
            <td>string</td>
            <td>Unique identifier for the workflow</td>
          </tr>
          <tr>
            <td><code>description</code></td>
            <td>string</td>
            <td>Human-readable description</td>
          </tr>
          <tr>
            <td><code>steps</code></td>
            <td>array</td>
            <td>Ordered list of workflow steps</td>
          </tr>
        </tbody>
      </table>

      <h3>Step Properties</h3>
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>name</code></td>
            <td>string</td>
            <td>Step identifier</td>
          </tr>
          <tr>
            <td><code>prompt</code></td>
            <td>string</td>
            <td>Instructions for the agent</td>
          </tr>
          <tr>
            <td><code>tools</code></td>
            <td>array</td>
            <td>Recommended tools for this step (optional)</td>
          </tr>
          <tr>
            <td><code>dependsOn</code></td>
            <td>array</td>
            <td>Steps that must complete first (optional)</td>
          </tr>
          <tr>
            <td><code>output</code></td>
            <td>string</td>
            <td>File to save output to (optional)</td>
          </tr>
        </tbody>
      </table>

      <h2>Creating Custom Workflows</h2>

      <h3>Example: API Documentation Workflow</h3>
      <CodeBlock
        language="json"
        filename=".commands/api-docs.json"
        code={`{
  "name": "api-docs",
  "description": "Generate API documentation from source code",
  "steps": [
    {
      "name": "discover",
      "prompt": "Find all API endpoints in the codebase. Look for route definitions, controllers, and handler functions.",
      "tools": ["find-files", "search-files"]
    },
    {
      "name": "analyze",
      "prompt": "For each endpoint found, extract: HTTP method, path, parameters, request body schema, response schema, and any authentication requirements.",
      "dependsOn": ["discover"],
      "tools": ["read-file"]
    },
    {
      "name": "document",
      "prompt": "Generate OpenAPI/Swagger documentation based on the analysis. Include descriptions, examples, and error responses.",
      "dependsOn": ["analyze"],
      "output": "API_DOCUMENTATION.md"
    }
  ]
}`}
      />

      <h3>Example: Database Migration Workflow</h3>
      <CodeBlock
        language="json"
        filename=".commands/db-migrate.json"
        code={`{
  "name": "db-migrate",
  "description": "Plan and execute database migrations",
  "steps": [
    {
      "name": "analyze-schema",
      "prompt": "Analyze current database schema and identify required changes based on the model files.",
      "tools": ["read-file", "database-query"]
    },
    {
      "name": "generate-migration",
      "prompt": "Generate migration scripts for the schema changes. Include both up and down migrations.",
      "dependsOn": ["analyze-schema"],
      "tools": ["write-file"]
    },
    {
      "name": "validate",
      "prompt": "Validate the migration scripts by checking for potential data loss or conflicts.",
      "dependsOn": ["generate-migration"]
    },
    {
      "name": "execute",
      "prompt": "Execute the migration in a transaction. Report success or rollback on failure.",
      "dependsOn": ["validate"],
      "tools": ["database-query", "run-command"]
    }
  ]
}`}
      />

      <Callout type="tip" title="Workflow design">
        <p>
          Keep steps focused and atomic. Each step should do one thing well.
          Use <code>dependsOn</code> to ensure proper sequencing.
        </p>
      </Callout>

      <h2>Workflow Best Practices</h2>

      <h3>Clear Step Names</h3>
      <p>
        Use descriptive names that indicate what the step does: <code>analyze</code>,
        <code>validate</code>, <code>generate</code>.
      </p>

      <h3>Explicit Dependencies</h3>
      <p>
        Always specify <code>dependsOn</code> when step order matters. Don&apos;t rely
        on array order alone.
      </p>

      <h3>Tool Hints</h3>
      <p>
        Include <code>tools</code> arrays to guide the agent toward appropriate tools
        for each step.
      </p>

      <h3>Output Files</h3>
      <p>
        Use <code>output</code> for steps that generate artifacts. This creates
        a clear record of the workflow results.
      </p>

      <h3>Error Handling</h3>
      <p>
        Include validation steps before destructive operations. The agent will
        report issues encountered during execution.
      </p>
    </DocsLayout>
  );
}
