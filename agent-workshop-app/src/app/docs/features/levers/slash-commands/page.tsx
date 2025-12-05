'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';

export default function SlashCommandsPage() {
  return (
    <DocsLayout
      title="Slash Commands"
      description="User-invoked prompt templates for common workflows."
    >
      <p>
        Slash commands are reusable prompt templates that users invoke by typing
        <code>/command-name</code>. They&apos;re ideal for standardizing repetitive
        workflows like code review, testing, and deployment.
      </p>

      <h2>How It Works</h2>
      <p>
        When a user types a slash command:
      </p>
      <ol>
        <li>The agent looks up the command in <code>.claude/commands/</code></li>
        <li>The template is loaded and placeholders are replaced with arguments</li>
        <li>The expanded prompt is sent to the agent for processing</li>
      </ol>

      <h2>File Location</h2>
      <p>
        Commands are stored as markdown files in the <code>.claude/commands/</code> directory:
      </p>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`.claude/
└── commands/
    ├── review-pr.md
    ├── test.md
    ├── deploy.md
    └── document.md`}
      </pre>
      <p>
        The filename (without <code>.md</code>) becomes the command name.
      </p>

      <h2>Command Structure</h2>
      <p>
        Each command file contains a prompt template:
      </p>

      <CodeBlock
        language="markdown"
        filename=".claude/commands/review-pr.md"
        code={`Review pull request #$1 for:

1. Code quality and best practices
2. Potential bugs or edge cases
3. Security vulnerabilities
4. Performance implications
5. Test coverage

Provide specific, actionable feedback with line references.`}
      />

      <h2>Placeholders</h2>
      <p>
        Commands support two types of placeholders:
      </p>

      <h3>Positional Arguments ($1, $2, $3...)</h3>
      <p>
        Replace specific positions with user-provided values.
      </p>
      <CodeBlock
        language="markdown"
        code={`# Usage: /deploy staging
Deploy to the $1 environment.
Run pre-deployment checks and notify the team.`}
      />

      <h3>All Arguments ($ARGUMENTS)</h3>
      <p>
        Replace with the entire argument string.
      </p>
      <CodeBlock
        language="markdown"
        code={`# Usage: /search user authentication flow
Search the codebase for: $ARGUMENTS
Summarize relevant files and their relationships.`}
      />

      <h2>Built-in Templates</h2>

      <h3>/review-pr</h3>
      <p>Review a pull request for quality and security.</p>
      <CodeBlock
        language="markdown"
        code={`Review pull request #$1 for:

1. Code quality and best practices
2. Potential bugs or edge cases
3. Security vulnerabilities
4. Performance implications
5. Test coverage

Provide specific, actionable feedback with line references.`}
      />

      <h3>/test</h3>
      <p>Run tests and fix failures.</p>
      <CodeBlock
        language="markdown"
        code={`Run the test suite and handle any failures:

1. Execute: npm test
2. Analyze any failing tests
3. Identify root causes
4. Implement fixes
5. Re-run to verify

Focus on: $ARGUMENTS`}
      />

      <h3>/deploy</h3>
      <p>Deploy to a specified environment.</p>
      <CodeBlock
        language="markdown"
        code={`Deploy to the $1 environment:

1. Run pre-deployment checks
2. Build the production bundle
3. Execute deployment scripts
4. Verify deployment success
5. Run smoke tests

Report any issues encountered.`}
      />

      <h3>/document</h3>
      <p>Generate documentation for code.</p>
      <CodeBlock
        language="markdown"
        code={`Generate documentation for: $ARGUMENTS

Include:
- Purpose and functionality
- Parameters and return values
- Usage examples
- Edge cases and limitations

Format as JSDoc/TSDoc comments.`}
      />

      <h3>/refactor</h3>
      <p>Refactor code with specific goals.</p>
      <CodeBlock
        language="markdown"
        code={`Refactor the following with these goals: $ARGUMENTS

1. Analyze current implementation
2. Identify improvement opportunities
3. Propose refactoring strategy
4. Implement changes incrementally
5. Verify behavior is preserved

Explain each change and its benefits.`}
      />

      <h2>Creating Custom Commands</h2>
      <p>
        To create a custom command:
      </p>
      <ol>
        <li>Create a new <code>.md</code> file in <code>.claude/commands/</code></li>
        <li>Write your prompt template using placeholders</li>
        <li>Save with the desired command name</li>
      </ol>

      <h3>Example: Custom /analyze Command</h3>
      <CodeBlock
        language="markdown"
        filename=".claude/commands/analyze.md"
        code={`Analyze $1 for:

## Performance
- Time complexity
- Space complexity
- Bottlenecks

## Maintainability
- Code clarity
- Documentation
- Test coverage

## Security
- Input validation
- Error handling
- Sensitive data exposure

Provide a summary with recommendations.`}
      />

      <Callout type="tip" title="Command naming">
        <p>
          Use lowercase names with hyphens for multi-word commands.
          Keep names short and descriptive: <code>/review-pr</code>, <code>/run-tests</code>, <code>/gen-docs</code>.
        </p>
      </Callout>

      <h2>Configuration in Agent Workshop</h2>
      <p>
        In the Levers Configuration step, the Slash Commands tab lets you:
      </p>
      <ul>
        <li><strong>Add from templates</strong> - Use pre-built command templates</li>
        <li><strong>Create custom</strong> - Write your own commands</li>
        <li><strong>Configure placeholders</strong> - Define expected arguments</li>
        <li><strong>Enable/disable</strong> - Toggle individual commands</li>
      </ul>

      <h2>Best Practices</h2>

      <h3>Be Specific</h3>
      <p>
        Vague commands produce vague results. Include specific steps, criteria, and
        expected outputs.
      </p>

      <h3>Use Numbered Steps</h3>
      <p>
        Breaking workflows into numbered steps helps the agent execute systematically.
      </p>

      <h3>Include Context Hints</h3>
      <p>
        Tell the agent what to focus on or ignore.
      </p>

      <h3>Test Your Commands</h3>
      <p>
        Try your commands with various arguments to ensure they work as expected.
      </p>
    </DocsLayout>
  );
}
