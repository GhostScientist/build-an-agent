'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';

export default function MemoryPage() {
  return (
    <DocsLayout
      title="Memory (CLAUDE.md)"
      description="Persistent context loaded at the start of every conversation."
    >
      <p>
        Memory is a markdown file that provides persistent context to your agent.
        The contents of <code>CLAUDE.md</code> are automatically loaded at the start
        of every conversation, giving your agent knowledge about your project.
      </p>

      <h2>How It Works</h2>
      <p>
        When your agent starts a conversation, it reads <code>CLAUDE.md</code> and
        includes its contents in the system prompt. This means the agent always has
        access to:
      </p>
      <ul>
        <li>Project structure and architecture</li>
        <li>Coding standards and conventions</li>
        <li>Security boundaries and restrictions</li>
        <li>Build and deployment procedures</li>
        <li>Team-specific guidelines</li>
      </ul>

      <h2>File Location</h2>
      <p>
        Memory is stored at the root of your project:
      </p>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`my-agent/
├── CLAUDE.md        # ← Memory file
├── package.json
└── src/
    └── ...`}
      </pre>

      <h2>Structure</h2>
      <p>
        A typical CLAUDE.md file contains several sections:
      </p>

      <CodeBlock
        language="markdown"
        filename="CLAUDE.md"
        code={`# Project Context

This is a Node.js CLI application that processes financial documents.
The agent helps users extract data from invoices, receipts, and statements.

## Codebase Structure

- \`src/\` - Main source code
  - \`cli.ts\` - Entry point and command handling
  - \`agent.ts\` - Core agent logic
  - \`extractors/\` - Document extraction modules
- \`data/\` - Sample documents for testing
- \`output/\` - Generated reports and exports

## Team Standards

- Use TypeScript strict mode
- Follow ESLint configuration
- Write JSDoc comments for public functions
- Use semantic commit messages

## Security Policy

**Restricted areas:**
- Never modify files in \`/etc\` or system directories
- Do not access credentials outside \`.env\`
- Do not make external API calls without user confirmation

**Data handling:**
- Treat all financial data as sensitive
- Do not log PII to console
- Sanitize output before display

## Build & Deployment

\`\`\`bash
# Development
npm run dev

# Production build
npm run build

# Run tests
npm test
\`\`\``}
      />

      <h2>Sections Explained</h2>

      <h3>Project Context</h3>
      <p>
        High-level description of what the project is and what the agent should help with.
        This sets the overall tone and focus for the agent.
      </p>

      <h3>Codebase Structure</h3>
      <p>
        Map of important directories and files. Helps the agent navigate the project
        and understand where different types of code live.
      </p>

      <h3>Team Standards</h3>
      <p>
        Coding conventions, style guides, and practices the agent should follow.
        This ensures generated code matches your team&apos;s expectations.
      </p>

      <h3>Security Policy</h3>
      <p>
        Boundaries and restrictions. Define what the agent should never do and how
        it should handle sensitive data.
      </p>

      <Callout type="warning" title="Security boundaries">
        <p>
          Security policies in CLAUDE.md are guidelines, not hard enforcement.
          For strict security, use permission levels and hooks.
        </p>
      </Callout>

      <h3>Build &amp; Deployment</h3>
      <p>
        Common commands and procedures. The agent can reference these when helping
        with builds, tests, or deployments.
      </p>

      <h2>Best Practices</h2>

      <h3>Keep It Focused</h3>
      <p>
        Memory is loaded every conversation. Keep content relevant and concise.
        Don&apos;t include documentation that belongs elsewhere.
      </p>

      <h3>Use Clear Headings</h3>
      <p>
        Well-structured markdown helps the agent find relevant information quickly.
        Use consistent heading levels.
      </p>

      <h3>Update Regularly</h3>
      <p>
        Keep CLAUDE.md in sync with your project. Outdated information can mislead
        the agent.
      </p>

      <h3>Be Specific About Restrictions</h3>
      <p>
        Vague security policies are easy to misinterpret. Be explicit about what
        the agent should and shouldn&apos;t do.
      </p>

      <h2>Configuration in Agent Workshop</h2>
      <p>
        In the Levers Configuration step, the Memory tab lets you configure:
      </p>
      <ul>
        <li><strong>Enable/disable</strong> - Toggle memory on or off</li>
        <li><strong>Predefined sections</strong> - Project Context, Codebase Structure, Team Standards, Security Policy</li>
        <li><strong>Custom sections</strong> - Add your own sections with custom titles and content</li>
      </ul>

      <h2>Example: Development Agent</h2>
      <CodeBlock
        language="markdown"
        code={`# Project Context

Full-stack web application using Next.js, TypeScript, and PostgreSQL.
Agent assists with feature development, bug fixes, and code review.

## Codebase Structure

- \`app/\` - Next.js app router pages
- \`components/\` - React components
- \`lib/\` - Utilities and helpers
- \`prisma/\` - Database schema and migrations
- \`tests/\` - Jest test files

## Team Standards

- Components use TypeScript FC pattern
- State management via React Query
- Tailwind CSS for styling
- Zod for runtime validation

## Security Policy

- Validate all user input with Zod
- Use parameterized queries (Prisma handles this)
- Never expose API keys in client code
- Sanitize HTML output to prevent XSS`}
      />

      <h2>Example: Research Agent</h2>
      <CodeBlock
        language="markdown"
        code={`# Project Context

Research assistant for academic literature review.
Helps synthesize papers, track citations, and generate summaries.

## Research Standards

- Always cite sources with author, year, and page
- Use APA citation format
- Distinguish between primary and secondary sources
- Note confidence level for claims

## Output Formats

- Literature summaries: 200-300 words with key findings
- Citation lists: Alphabetical by author
- Synthesis reports: Structured with methodology, findings, implications

## Quality Guidelines

- Cross-reference claims across multiple sources
- Flag contradictory findings
- Note limitations and gaps in literature
- Avoid over-generalizing from limited sources`}
      />
    </DocsLayout>
  );
}
