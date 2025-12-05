'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';

export default function SkillsPage() {
  return (
    <DocsLayout
      title="Skills"
      description="Model-invoked capabilities loaded contextually when relevant."
    >
      <p>
        Skills are specialized knowledge modules that the agent loads automatically
        when they&apos;re relevant to the current task. Unlike slash commands (user-invoked),
        skills are model-invoked based on context.
      </p>

      <h2>How It Works</h2>
      <p>
        Skills provide progressive disclosure of capabilities:
      </p>
      <ol>
        <li>The agent analyzes the current task</li>
        <li>It identifies which skills are relevant</li>
        <li>Relevant skills are loaded into context</li>
        <li>The agent applies the skill&apos;s knowledge and uses its recommended tools</li>
      </ol>

      <p>
        This keeps the agent&apos;s context lean while ensuring specialized knowledge
        is available when needed.
      </p>

      <h2>File Location</h2>
      <p>
        Skills are stored in subdirectories of <code>.claude/skills/</code>:
      </p>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
{`.claude/
└── skills/
    ├── code-review/
    │   └── SKILL.md
    ├── testing-patterns/
    │   └── SKILL.md
    └── api-design/
        └── SKILL.md`}
      </pre>
      <p>
        Each skill lives in its own directory with a <code>SKILL.md</code> file.
      </p>

      <h2>Skill Structure</h2>
      <p>
        A skill file contains instructions, recommended tools, and reference materials:
      </p>

      <CodeBlock
        language="markdown"
        filename=".claude/skills/code-review/SKILL.md"
        code={`# Code Review Skill

## When to Use
Apply this skill when reviewing code for quality, security, or performance.

## Instructions

### Quality Checks
1. Verify consistent naming conventions
2. Check for code duplication
3. Assess function complexity (cyclomatic)
4. Review error handling patterns

### Security Review
1. Check for injection vulnerabilities
2. Verify input validation
3. Review authentication/authorization
4. Check for sensitive data exposure

### Performance Review
1. Identify N+1 queries
2. Check for unnecessary computations
3. Review memory allocation patterns
4. Assess caching opportunities

## Recommended Tools
- read-file: Examine source code
- find-files: Locate related files
- search-files: Find patterns across codebase

## Output Format
Provide findings as:
- **Critical**: Must fix before merge
- **Warning**: Should address soon
- **Suggestion**: Nice to have improvements`}
      />

      <h2>Skill Components</h2>

      <h3>When to Use</h3>
      <p>
        Describes the conditions that trigger this skill. Helps the model decide
        when the skill is relevant.
      </p>

      <h3>Instructions</h3>
      <p>
        Detailed guidance on how to apply the skill. Include checklists, procedures,
        and domain knowledge.
      </p>

      <h3>Recommended Tools</h3>
      <p>
        Which tools to use when applying this skill. Helps the agent choose the
        right tools for the task.
      </p>

      <h3>Output Format</h3>
      <p>
        How to structure the skill&apos;s output. Ensures consistent, useful results.
      </p>

      <h2>Built-in Skill Templates</h2>

      <h3>code-review</h3>
      <p>Code quality, security, and performance review patterns.</p>
      <ul>
        <li><strong>Tools</strong>: read-file, find-files, search-files</li>
        <li><strong>Focus</strong>: Quality, security, performance</li>
      </ul>

      <h3>testing-patterns</h3>
      <p>Unit, integration, and end-to-end testing best practices.</p>
      <ul>
        <li><strong>Tools</strong>: read-file, write-file, run-command</li>
        <li><strong>Focus</strong>: Test structure, assertions, mocking</li>
      </ul>

      <h3>api-design</h3>
      <p>RESTful API design patterns and conventions.</p>
      <ul>
        <li><strong>Tools</strong>: read-file, write-file, web-search</li>
        <li><strong>Focus</strong>: Endpoints, validation, documentation</li>
      </ul>

      <h2>Creating Custom Skills</h2>

      <h3>Example: Database Optimization Skill</h3>
      <CodeBlock
        language="markdown"
        filename=".claude/skills/db-optimization/SKILL.md"
        code={`# Database Optimization Skill

## When to Use
Apply when analyzing or improving database queries and schema.

## Instructions

### Query Analysis
1. Identify slow queries (EXPLAIN ANALYZE)
2. Check for missing indexes
3. Review join patterns
4. Assess query complexity

### Schema Review
1. Verify normalization level
2. Check foreign key constraints
3. Review index coverage
4. Assess data types appropriateness

### Optimization Strategies
1. Add covering indexes
2. Rewrite subqueries as joins
3. Implement query caching
4. Consider denormalization for read-heavy tables

## Recommended Tools
- database-query: Execute analysis queries
- read-file: Review migration files
- write-file: Create optimization scripts

## Output Format
- Current state: Query/schema analysis
- Issues found: With severity ratings
- Recommendations: Prioritized action items
- Implementation: SQL scripts for fixes`}
      />

      <Callout type="info" title="Skills vs. Memory">
        <p>
          Use <strong>Memory</strong> for always-relevant context (project structure, standards).
          Use <strong>Skills</strong> for task-specific expertise that should only load when needed.
        </p>
      </Callout>

      <h2>Configuration in Agent Workshop</h2>
      <p>
        In the Levers Configuration step, the Skills tab lets you:
      </p>
      <ul>
        <li><strong>Add from templates</strong> - Use pre-built skill templates</li>
        <li><strong>Create custom</strong> - Write your own skills</li>
        <li><strong>Configure tools</strong> - Specify recommended tools per skill</li>
        <li><strong>Add references</strong> - Link to documentation or code</li>
        <li><strong>Enable/disable</strong> - Toggle individual skills</li>
      </ul>

      <h2>Best Practices</h2>

      <h3>Be Specific About Triggers</h3>
      <p>
        The &quot;When to Use&quot; section is crucial. Vague triggers lead to skills being
        loaded unnecessarily or not at all.
      </p>

      <h3>Include Actionable Steps</h3>
      <p>
        Instructions should be concrete and actionable, not abstract principles.
      </p>

      <h3>Match Tools to Tasks</h3>
      <p>
        Only list tools that are actually useful for the skill. Don&apos;t include
        tools just because they&apos;re available.
      </p>

      <h3>Keep Skills Focused</h3>
      <p>
        Each skill should cover one domain. Don&apos;t create a &quot;do everything&quot; skill.
      </p>
    </DocsLayout>
  );
}
