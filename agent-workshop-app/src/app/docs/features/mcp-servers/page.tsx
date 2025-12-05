'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';

export default function MCPServersPage() {
  return (
    <DocsLayout
      title="MCP Servers Reference"
      description="Complete reference for Model Context Protocol server configurations."
    >
      <p>
        Model Context Protocol (MCP) servers extend your agent with additional tools
        and data sources. This reference covers all available server templates and
        configuration options.
      </p>

      <h2>Transport Types</h2>

      <h3>stdio</h3>
      <p>
        Standard I/O transport runs a local command and communicates via stdin/stdout.
        Most common for npx-based MCP servers.
      </p>
      <CodeBlock
        language="json"
        code={`{
  "name": "server-name",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@package/server"],
  "env": {
    "API_KEY": "\${API_KEY}"
  }
}`}
      />

      <h3>http</h3>
      <p>
        HTTP transport connects to a REST endpoint.
      </p>
      <CodeBlock
        language="json"
        code={`{
  "name": "server-name",
  "transport": "http",
  "url": "https://api.example.com/mcp",
  "headers": {
    "Authorization": "Bearer \${TOKEN}"
  }
}`}
      />

      <h3>sse</h3>
      <p>
        Server-Sent Events transport for real-time streaming.
      </p>
      <CodeBlock
        language="json"
        code={`{
  "name": "server-name",
  "transport": "sse",
  "url": "https://api.example.com/events"
}`}
      />

      <h3>sdk</h3>
      <p>
        SDK transport loads a JavaScript module directly.
      </p>
      <CodeBlock
        language="json"
        code={`{
  "name": "server-name",
  "transport": "sdk",
  "serverModule": "./path/to/server.js"
}`}
      />

      <h2>Available Server Templates</h2>

      <h3>Filesystem</h3>
      <p>Read and write files in specified directories.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "filesystem",
  "transport": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "/path/to/allowed/directory"
  ]
}`}
      />
      <table>
        <tbody>
          <tr><td><strong>Package</strong></td><td>@modelcontextprotocol/server-filesystem</td></tr>
          <tr><td><strong>Category</strong></td><td>Filesystem</td></tr>
          <tr><td><strong>Configuration</strong></td><td>Specify allowed directories as arguments</td></tr>
        </tbody>
      </table>

      <h3>GitHub</h3>
      <p>GitHub API operations including repos, issues, and PRs.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "github",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": {
    "GITHUB_TOKEN": "\${GITHUB_TOKEN}"
  }
}`}
      />
      <table>
        <tbody>
          <tr><td><strong>Package</strong></td><td>@modelcontextprotocol/server-github</td></tr>
          <tr><td><strong>Category</strong></td><td>Git</td></tr>
          <tr><td><strong>Required Env</strong></td><td>GITHUB_TOKEN</td></tr>
        </tbody>
      </table>

      <h3>Git</h3>
      <p>Local Git repository operations.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "git",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-git"]
}`}
      />
      <table>
        <tbody>
          <tr><td><strong>Package</strong></td><td>@modelcontextprotocol/server-git</td></tr>
          <tr><td><strong>Category</strong></td><td>Git</td></tr>
          <tr><td><strong>Required Env</strong></td><td>None</td></tr>
        </tbody>
      </table>

      <h3>PostgreSQL</h3>
      <p>Query and manage PostgreSQL databases.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "postgres",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres"],
  "env": {
    "DATABASE_URL": "\${DATABASE_URL}"
  }
}`}
      />
      <table>
        <tbody>
          <tr><td><strong>Package</strong></td><td>@modelcontextprotocol/server-postgres</td></tr>
          <tr><td><strong>Category</strong></td><td>Database</td></tr>
          <tr><td><strong>Required Env</strong></td><td>DATABASE_URL (connection string)</td></tr>
        </tbody>
      </table>

      <h3>SQLite</h3>
      <p>Query SQLite databases.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "sqlite",
  "transport": "stdio",
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-sqlite",
    "--db-path",
    "/path/to/database.db"
  ]
}`}
      />
      <table>
        <tbody>
          <tr><td><strong>Package</strong></td><td>@modelcontextprotocol/server-sqlite</td></tr>
          <tr><td><strong>Category</strong></td><td>Database</td></tr>
          <tr><td><strong>Configuration</strong></td><td>--db-path argument for database location</td></tr>
        </tbody>
      </table>

      <h3>Brave Search</h3>
      <p>Web search via Brave Search API.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "brave-search",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-brave-search"],
  "env": {
    "BRAVE_API_KEY": "\${BRAVE_API_KEY}"
  }
}`}
      />
      <table>
        <tbody>
          <tr><td><strong>Package</strong></td><td>@modelcontextprotocol/server-brave-search</td></tr>
          <tr><td><strong>Category</strong></td><td>API/Web</td></tr>
          <tr><td><strong>Required Env</strong></td><td>BRAVE_API_KEY</td></tr>
        </tbody>
      </table>

      <h3>Fetch</h3>
      <p>Fetch and parse web content.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "fetch",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-fetch"]
}`}
      />
      <table>
        <tbody>
          <tr><td><strong>Package</strong></td><td>@modelcontextprotocol/server-fetch</td></tr>
          <tr><td><strong>Category</strong></td><td>API/Web</td></tr>
          <tr><td><strong>Required Env</strong></td><td>None</td></tr>
        </tbody>
      </table>

      <h3>Puppeteer</h3>
      <p>Browser automation for web scraping and testing.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "puppeteer",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
}`}
      />
      <table>
        <tbody>
          <tr><td><strong>Package</strong></td><td>@modelcontextprotocol/server-puppeteer</td></tr>
          <tr><td><strong>Category</strong></td><td>API/Web</td></tr>
          <tr><td><strong>Required Env</strong></td><td>None (Chrome/Chromium required)</td></tr>
        </tbody>
      </table>

      <h3>Google Drive</h3>
      <p>Access and manage Google Drive files.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "google-drive",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@anthropic/mcp-server-gdrive"],
  "env": {
    "GOOGLE_APPLICATION_CREDENTIALS": "\${GOOGLE_APPLICATION_CREDENTIALS}"
  }
}`}
      />
      <table>
        <tbody>
          <tr><td><strong>Package</strong></td><td>@anthropic/mcp-server-gdrive</td></tr>
          <tr><td><strong>Category</strong></td><td>Cloud</td></tr>
          <tr><td><strong>Required Env</strong></td><td>GOOGLE_APPLICATION_CREDENTIALS (OAuth)</td></tr>
        </tbody>
      </table>

      <h3>AWS</h3>
      <p>AWS service integration.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "aws",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@anthropic/mcp-server-aws"],
  "env": {
    "AWS_ACCESS_KEY_ID": "\${AWS_ACCESS_KEY_ID}",
    "AWS_SECRET_ACCESS_KEY": "\${AWS_SECRET_ACCESS_KEY}",
    "AWS_REGION": "\${AWS_REGION}"
  }
}`}
      />
      <table>
        <tbody>
          <tr><td><strong>Package</strong></td><td>@anthropic/mcp-server-aws</td></tr>
          <tr><td><strong>Category</strong></td><td>Cloud</td></tr>
          <tr><td><strong>Required Env</strong></td><td>AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION</td></tr>
        </tbody>
      </table>

      <h3>Slack</h3>
      <p>Slack workspace integration.</p>
      <CodeBlock
        language="json"
        code={`{
  "name": "slack",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-slack"],
  "env": {
    "SLACK_BOT_TOKEN": "\${SLACK_BOT_TOKEN}"
  }
}`}
      />
      <table>
        <tbody>
          <tr><td><strong>Package</strong></td><td>@modelcontextprotocol/server-slack</td></tr>
          <tr><td><strong>Category</strong></td><td>Productivity</td></tr>
          <tr><td><strong>Required Env</strong></td><td>SLACK_BOT_TOKEN</td></tr>
        </tbody>
      </table>

      <h2>Generated Configuration</h2>
      <p>
        MCP servers are configured in <code>.mcp.json</code> at the project root:
      </p>

      <CodeBlock
        language="json"
        filename=".mcp.json"
        code={`{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./data"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "\${GITHUB_TOKEN}"
      }
    }
  }
}`}
      />

      <Callout type="info" title="Environment variables">
        <p>
          Environment variable references like <code>$&#123;GITHUB_TOKEN&#125;</code> are
          resolved at runtime from your <code>.env</code> file.
        </p>
      </Callout>

      <h2>Creating Custom Servers</h2>
      <p>
        To add a custom MCP server:
      </p>
      <ol>
        <li>Determine the transport type (stdio, http, sse, sdk)</li>
        <li>Configure the command/URL and arguments</li>
        <li>Set required environment variables</li>
        <li>Add to <code>.mcp.json</code></li>
      </ol>

      <Callout type="tip" title="MCP ecosystem">
        <p>
          The MCP ecosystem is growing. Check the{' '}
          <a
            href="https://github.com/modelcontextprotocol/servers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            MCP Servers repository
          </a>{' '}
          for the latest available servers.
        </p>
      </Callout>
    </DocsLayout>
  );
}
