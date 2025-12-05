'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';

export default function CommonPatternsPage() {
  return (
    <DocsLayout
      title="Common Patterns"
      description="Proven patterns for effective agent development and usage."
    >
      <p>
        This guide covers common patterns and approaches for getting the most
        out of your generated agents.
      </p>

      <h2>Effective Prompting</h2>

      <h3>Be Specific</h3>
      <p>
        Vague prompts produce vague results. Compare:
      </p>
      <CodeBlock
        language="text"
        code={`# Bad
Review this code

# Good
Review src/auth/login.ts for:
1. Security vulnerabilities (especially injection attacks)
2. Error handling completeness
3. Input validation
Provide specific line numbers for any issues found.`}
      />

      <h3>Provide Context</h3>
      <p>
        Give the agent relevant context:
      </p>
      <CodeBlock
        language="text"
        code={`# Bad
Fix the bug

# Good
The login form at src/components/LoginForm.tsx throws
"Cannot read property 'email' of undefined" when submitted
with empty fields. The form should show validation errors
instead of crashing.`}
      />

      <h3>Break Down Complex Tasks</h3>
      <p>
        Split large tasks into steps:
      </p>
      <CodeBlock
        language="text"
        code={`# Bad
Refactor the entire authentication system

# Good
Let's refactor authentication step by step:
1. First, analyze the current auth implementation
2. Then, identify issues and improvement opportunities
3. Finally, implement changes one module at a time
Start with step 1: analyze src/auth/ and summarize the current implementation.`}
      />

      <h2>Memory (CLAUDE.md) Patterns</h2>

      <h3>Project Context Template</h3>
      <CodeBlock
        language="markdown"
        code={`# Project Context

## Overview
[Brief description of what this project does]

## Tech Stack
- Frontend: [framework]
- Backend: [framework]
- Database: [database]
- Infrastructure: [cloud/hosting]

## Key Directories
- \`src/\` - Main source code
- \`tests/\` - Test files
- \`docs/\` - Documentation
- \`scripts/\` - Build and deployment scripts`}
      />

      <h3>Coding Standards Template</h3>
      <CodeBlock
        language="markdown"
        code={`# Coding Standards

## Style
- Use TypeScript strict mode
- Prefer const over let
- Use async/await over callbacks
- Maximum line length: 100 characters

## Naming
- Components: PascalCase (UserProfile.tsx)
- Functions: camelCase (getUserById)
- Constants: UPPER_SNAKE_CASE (MAX_RETRY_COUNT)
- Files: kebab-case (user-profile.tsx)

## Testing
- Unit tests required for utility functions
- Integration tests for API endpoints
- Use Jest and React Testing Library`}
      />

      <h2>Slash Command Patterns</h2>

      <h3>Review Command Template</h3>
      <CodeBlock
        language="markdown"
        code={`Review $1 for:

## Security
- [ ] Input validation
- [ ] Authentication checks
- [ ] Authorization checks
- [ ] Injection vulnerabilities
- [ ] Sensitive data exposure

## Quality
- [ ] Error handling
- [ ] Edge cases
- [ ] Code duplication
- [ ] Complexity

## Performance
- [ ] N+1 queries
- [ ] Unnecessary computations
- [ ] Memory leaks

Provide specific findings with line numbers.`}
      />

      <h3>Testing Command Template</h3>
      <CodeBlock
        language="markdown"
        code={`Generate tests for $1:

1. Identify all public functions and methods
2. For each function:
   - Write happy path tests
   - Write edge case tests
   - Write error handling tests
3. Use Jest and follow existing test patterns
4. Run the tests and fix any failures

Output the test file to the appropriate location.`}
      />

      <h2>Workflow Patterns</h2>

      <h3>Analysis Workflow</h3>
      <CodeBlock
        language="json"
        code={`{
  "name": "analyze",
  "description": "Comprehensive codebase analysis",
  "steps": [
    {
      "name": "inventory",
      "prompt": "Create an inventory of all files and their purposes"
    },
    {
      "name": "dependencies",
      "prompt": "Map dependencies between modules",
      "dependsOn": ["inventory"]
    },
    {
      "name": "issues",
      "prompt": "Identify potential issues and improvements",
      "dependsOn": ["dependencies"]
    },
    {
      "name": "report",
      "prompt": "Generate a summary report",
      "dependsOn": ["issues"],
      "output": "ANALYSIS_REPORT.md"
    }
  ]
}`}
      />

      <h3>Migration Workflow</h3>
      <CodeBlock
        language="json"
        code={`{
  "name": "migrate",
  "description": "Safe migration workflow",
  "steps": [
    {
      "name": "backup",
      "prompt": "Document current state before changes"
    },
    {
      "name": "plan",
      "prompt": "Create detailed migration plan",
      "dependsOn": ["backup"]
    },
    {
      "name": "implement",
      "prompt": "Implement changes incrementally",
      "dependsOn": ["plan"]
    },
    {
      "name": "verify",
      "prompt": "Verify changes and run tests",
      "dependsOn": ["implement"]
    }
  ]
}`}
      />

      <h2>Tool Usage Patterns</h2>

      <h3>Search Before Write</h3>
      <p>
        Always understand existing code before making changes:
      </p>
      <CodeBlock
        language="text"
        code={`Before adding the new feature:
1. Search for similar implementations in the codebase
2. Understand the existing patterns
3. Follow the established conventions
4. Then implement the change`}
      />

      <h3>Read-Analyze-Act</h3>
      <p>
        Structure complex tasks:
      </p>
      <ol>
        <li><strong>Read</strong> - Gather all relevant information</li>
        <li><strong>Analyze</strong> - Understand the situation</li>
        <li><strong>Act</strong> - Make targeted changes</li>
      </ol>

      <h2>Error Handling Patterns</h2>

      <h3>Graceful Degradation</h3>
      <p>
        When a tool fails, have fallback strategies:
      </p>
      <CodeBlock
        language="text"
        code={`If web-search fails:
1. Try searching local documentation
2. Check cached information in CLAUDE.md
3. Ask user for guidance`}
      />

      <h3>Clear Error Reporting</h3>
      <p>
        Configure agents to report errors clearly:
      </p>
      <CodeBlock
        language="markdown"
        code={`# In CLAUDE.md

## Error Handling
When encountering errors:
1. Report the specific error message
2. Explain what was being attempted
3. Suggest potential solutions
4. Ask for guidance if unclear`}
      />

      <h2>Performance Patterns</h2>

      <h3>Minimize Tool Calls</h3>
      <p>
        Batch related operations:
      </p>
      <CodeBlock
        language="text"
        code={`# Bad - Multiple tool calls
Read file A, then read file B, then read file C

# Good - Batched request
Read files A, B, and C and summarize their relationships`}
      />

      <h3>Use Targeted Searches</h3>
      <p>
        Be specific with search patterns:
      </p>
      <CodeBlock
        language="text"
        code={`# Bad - Broad search
Search for "error" in all files

# Good - Targeted search
Search for "AuthenticationError" in src/auth/`}
      />

      <Callout type="tip" title="Iterate and improve">
        <p>
          Start with simple patterns and iterate. Monitor how your agent performs
          and adjust configurations based on real usage.
        </p>
      </Callout>
    </DocsLayout>
  );
}
