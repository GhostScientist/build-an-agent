'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';

export default function GeneratorAPIPage() {
  return (
    <DocsLayout
      title="Generator API"
      description="How the code generation system works."
    >
      <p>
        The generator transforms an <code>AgentConfig</code> into a complete
        TypeScript project. This reference documents the generation process
        and output structure.
      </p>

      <h2>Generation Process</h2>

      <h3>1. Configuration Validation</h3>
      <p>
        The generator validates the configuration before generating:
      </p>
      <ul>
        <li>Required fields are present</li>
        <li>SDK provider is valid</li>
        <li>Tool configurations are consistent</li>
        <li>MCP server configurations are valid</li>
      </ul>

      <h3>2. Dependency Resolution</h3>
      <p>
        Based on enabled tools and features, the generator determines required
        npm dependencies:
      </p>
      <CodeBlock
        language="typescript"
        code={`// Base dependencies (always included)
const baseDeps = {
  'commander': '^11.1.0',
  'chalk': '^5.3.0',
  'ora': '^8.0.1',
  'inquirer': '^9.2.12',
  'dotenv': '^16.3.1'
};

// SDK-specific dependencies
const sdkDeps = {
  claude: { '@anthropic-ai/claude-code': '^0.1.53' },
  openai: { '@openai/agents': '^0.1.0', 'zod': '^3.0.0' }
};

// Tool-specific dependencies
const toolDeps = {
  'find-files': { 'glob': '^10.3.10' },
  'web-fetch': { 'axios': '^1.6.0', 'cheerio': '^1.0.0' },
  'database-query': { 'better-sqlite3': '^9.0.0' },
  'doc-ingest': { 'pdf-parse': '^1.1.1', 'mammoth': '^1.6.0' }
};`}
      />

      <h3>3. File Generation</h3>
      <p>
        The generator creates files based on the configuration:
      </p>

      <h4>Core Files</h4>
      <ul>
        <li><code>package.json</code> - With resolved dependencies</li>
        <li><code>tsconfig.json</code> - TypeScript configuration</li>
        <li><code>src/cli.ts</code> - CLI entry point</li>
        <li><code>src/agent.ts</code> - Agent implementation</li>
        <li><code>src/config.ts</code> - Configuration management</li>
        <li><code>src/permissions.ts</code> - Permission system</li>
      </ul>

      <h4>Conditional Files</h4>
      <ul>
        <li><code>src/mcp-config.ts</code> - If MCP servers configured</li>
        <li><code>src/planner.ts</code> - If planning mode enabled</li>
        <li><code>src/workflows.ts</code> - If workflows configured</li>
      </ul>

      <h4>Lever Files</h4>
      <ul>
        <li><code>CLAUDE.md</code> - If memory enabled</li>
        <li><code>.claude/commands/*.md</code> - For each slash command</li>
        <li><code>.claude/skills/*/SKILL.md</code> - For each skill</li>
        <li><code>.claude/agents/*.md</code> - For each subagent</li>
        <li><code>.claude/settings.json</code> - If hooks configured</li>
      </ul>

      <h4>Domain Workflows</h4>
      <p>
        Based on domain, the generator includes relevant workflow files:
      </p>
      <CodeBlock
        language="typescript"
        code={`const domainWorkflows = {
  development: ['code-audit', 'test-suite', 'refactor-analysis'],
  business: ['invoice-batch', 'contract-review', 'meeting-summary'],
  creative: ['content-calendar', 'blog-outline', 'campaign-brief'],
  data: ['dataset-profile', 'chart-report'],
  knowledge: ['literature-review', 'experiment-log']
};`}
      />

      <h2>Generated Project Structure</h2>

      <CodeBlock
        language="bash"
        code={`{projectName}/
├── package.json
├── tsconfig.json
├── src/
│   ├── cli.ts
│   ├── agent.ts
│   ├── config.ts
│   ├── permissions.ts
│   ├── mcp-config.ts
│   ├── planner.ts
│   └── workflows.ts
├── .claude/
│   ├── CLAUDE.md
│   ├── commands/
│   ├── agents/
│   ├── skills/
│   └── settings.json
├── .commands/
├── .plans/
├── .mcp.json
├── .env.example
├── .gitignore
├── README.md
├── LICENSE
└── scripts/
    └── publish.sh`}
      />

      <h2>Output Format</h2>

      <h3>GeneratedProject Type</h3>
      <CodeBlock
        language="typescript"
        code={`interface GeneratedProject {
  files: GeneratedFile[];
  metadata: ProjectMetadata;
  config: AgentConfig;
}

interface GeneratedFile {
  path: string;
  content: string;
  type: FileType;
  template?: string;
}

type FileType =
  | 'source'
  | 'config'
  | 'documentation'
  | 'workflow'
  | 'lever';

interface ProjectMetadata {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  buildInstructions: string[];
  deploymentOptions: string[];
}`}
      />

      <h2>Tool Generation</h2>
      <p>
        Each enabled tool generates corresponding implementation code:
      </p>

      <CodeBlock
        language="typescript"
        code={`// Example: read-file tool generation
const readFileTool = {
  name: 'read-file',
  description: 'Read the contents of a file',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file to read'
      }
    },
    required: ['path']
  },
  execute: async ({ path }) => {
    const content = await fs.readFile(path, 'utf-8');
    return { content };
  }
};`}
      />

      <h2>Customization Points</h2>

      <Callout type="tip" title="Extending the generator">
        <p>
          The generated code is designed for customization. Key extension points:
        </p>
        <ul className="mt-2 list-disc list-inside">
          <li>Add tools in <code>src/agent.ts</code></li>
          <li>Modify permissions in <code>src/permissions.ts</code></li>
          <li>Add CLI commands in <code>src/cli.ts</code></li>
          <li>Extend workflows in <code>.commands/</code></li>
        </ul>
      </Callout>

      <h2>Build Scripts</h2>

      <CodeBlock
        language="json"
        code={`{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "start": "node dist/cli.js",
    "test": "node dist/cli.js --help"
  }
}`}
      />
    </DocsLayout>
  );
}
