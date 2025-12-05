'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { Callout } from '@/components/docs/Callout';

export default function DevelopmentTemplatesPage() {
  return (
    <DocsLayout
      title="Development Templates"
      description="Templates for software engineering and development tasks."
    >
      <p>
        Development templates are designed for software engineering workflows
        including code review, testing, debugging, and general development assistance.
      </p>

      <h2>Development Agent</h2>
      <p>
        A full-stack development assistant with comprehensive file and command access.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Read source code and configuration</li>
        <li><code>write-file</code> - Create new files</li>
        <li><code>edit-file</code> - Modify existing code</li>
        <li><code>find-files</code> - Locate files by pattern</li>
        <li><code>search-files</code> - Search code contents</li>
        <li><code>run-command</code> - Execute builds, tests, scripts</li>
        <li><code>git-operations</code> - Version control</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Create a new React component for user authentication&quot;</li>
        <li>&quot;Fix the TypeScript errors in src/utils/&quot;</li>
        <li>&quot;Add unit tests for the UserService class&quot;</li>
        <li>&quot;Refactor this function to use async/await&quot;</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>General development tasks</li>
        <li>Feature implementation</li>
        <li>Bug fixing</li>
        <li>Code generation</li>
      </ul>

      <Callout type="info">
        <p>
          This template enables <code>run-command</code> (high risk). Use with
          appropriate permission settings.
        </p>
      </Callout>

      <hr className="my-8" />

      <h2>Code Review Agent</h2>
      <p>
        Specialized for automated code review with focus on quality and security.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Examine code</li>
        <li><code>find-files</code> - Locate relevant files</li>
        <li><code>search-files</code> - Find patterns and issues</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Review the changes in this PR for security issues&quot;</li>
        <li>&quot;Check src/api/ for potential vulnerabilities&quot;</li>
        <li>&quot;Analyze the codebase for performance bottlenecks&quot;</li>
        <li>&quot;Find all instances of deprecated API usage&quot;</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>Pull request reviews</li>
        <li>Security audits</li>
        <li>Code quality analysis</li>
        <li>Pattern detection</li>
      </ul>

      <Callout type="tip">
        <p>
          This template uses read-only tools by default, making it safe for
          automated review pipelines.
        </p>
      </Callout>

      <hr className="my-8" />

      <h2>Testing Agent</h2>
      <p>
        Focused on test generation, execution, and failure analysis.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Analyze code to test</li>
        <li><code>write-file</code> - Create test files</li>
        <li><code>find-files</code> - Locate test files</li>
        <li><code>search-files</code> - Find testable code</li>
        <li><code>run-command</code> - Execute test suites</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Generate unit tests for the PaymentService&quot;</li>
        <li>&quot;Run the test suite and fix any failures&quot;</li>
        <li>&quot;Add integration tests for the API endpoints&quot;</li>
        <li>&quot;Improve test coverage for src/utils/&quot;</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>Test generation</li>
        <li>Test maintenance</li>
        <li>Coverage improvement</li>
        <li>Debugging test failures</li>
      </ul>

      <hr className="my-8" />

      <h2>Modernization Agent</h2>
      <p>
        Specialized for analyzing legacy codebases and planning modernization.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Analyze legacy code</li>
        <li><code>find-files</code> - Map codebase structure</li>
        <li><code>search-files</code> - Find patterns and dependencies</li>
        <li><code>web-search</code> - Research modern alternatives</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Analyze this codebase and identify the tech stack&quot;</li>
        <li>&quot;Find all deprecated patterns that need updating&quot;</li>
        <li>&quot;Create a migration plan from jQuery to React&quot;</li>
        <li>&quot;Identify the riskiest parts of the codebase&quot;</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>Legacy code analysis</li>
        <li>Migration planning</li>
        <li>Dependency updates</li>
        <li>Technical debt assessment</li>
      </ul>

      <h2>Comparing Development Templates</h2>

      <table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Write Access</th>
            <th>Command Execution</th>
            <th>Primary Focus</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Development Agent</strong></td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Full-stack development</td>
          </tr>
          <tr>
            <td><strong>Code Review Agent</strong></td>
            <td>No</td>
            <td>No</td>
            <td>Analysis and review</td>
          </tr>
          <tr>
            <td><strong>Testing Agent</strong></td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Test automation</td>
          </tr>
          <tr>
            <td><strong>Modernization Agent</strong></td>
            <td>No</td>
            <td>No</td>
            <td>Analysis and planning</td>
          </tr>
        </tbody>
      </table>
    </DocsLayout>
  );
}
