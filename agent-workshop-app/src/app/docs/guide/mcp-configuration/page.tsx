'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';
import { Callout } from '@/components/docs/Callout';
import Link from 'next/link';

export default function MCPConfigurationPage() {
  return (
    <DocsLayout
      title="MCP Configuration"
      description="Step 5: Connect external servers via Model Context Protocol."
    >
      <p>
        Model Context Protocol (MCP) servers extend your agent&apos;s capabilities by
        connecting to external services and data sources. This step is optional
        but powerful for integrating with external systems.
      </p>

      <Callout type="info" title="Optional step">
        <p>
          MCP configuration is optional. You can skip this step and add MCP servers
          later by editing the generated <code>.mcp.json</code> file.
        </p>
      </Callout>

      <h2>Transport Types</h2>
      <p>
        MCP supports four transport types for connecting to servers:
      </p>

      <h3>stdio (Standard I/O)</h3>
      <p>
        The most common transport type. Runs a local command and communicates via
        standard input/output. Typically used with npx packages.
      </p>
      <CodeBlock
        language="json"
        code={`{
  "name": "filesystem",
  "transport": "stdio",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/directory"],
  "env": {}
}`}
      />

      <h3>HTTP</h3>
      <p>
        Connects to a REST endpoint. Useful for remote MCP servers.
      </p>
      <CodeBlock
        language="json"
        code={`{
  "name": "remote-server",
  "transport": "http",
  "url": "https://api.example.com/mcp",
  "headers": {
    "Authorization": "Bearer \${API_TOKEN}"
  }
}`}
      />

      <h3>SSE (Server-Sent Events)</h3>
      <p>
        Uses Server-Sent Events for real-time communication.
      </p>
      <CodeBlock
        language="json"
        code={`{
  "name": "streaming-server",
  "transport": "sse",
  "url": "https://api.example.com/mcp/events"
}`}
      />

      <h3>SDK</h3>
      <p>
        Loads a JavaScript module directly. Useful for custom in-process servers.
      </p>
      <CodeBlock
        language="json"
        code={`{
  "name": "custom-server",
  "transport": "sdk",
  "serverModule": "./custom-mcp-server.js"
}`}
      />

      <h2>Available Server Templates</h2>

      <h3>Filesystem</h3>
      <table>
        <thead>
          <tr>
            <th>Server</th>
            <th>Description</th>
            <th>Configuration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Filesystem</strong></td>
            <td>Read/write files in specified directories</td>
            <td>Requires directory allowlist</td>
          </tr>
        </tbody>
      </table>

      <h3>Git &amp; Version Control</h3>
      <table>
        <thead>
          <tr>
            <th>Server</th>
            <th>Description</th>
            <th>Configuration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>GitHub</strong></td>
            <td>GitHub API operations (repos, issues, PRs)</td>
            <td>Requires <code>GITHUB_TOKEN</code></td>
          </tr>
          <tr>
            <td><strong>Git</strong></td>
            <td>Local Git repository operations</td>
            <td>No additional config needed</td>
          </tr>
        </tbody>
      </table>

      <h3>Databases</h3>
      <table>
        <thead>
          <tr>
            <th>Server</th>
            <th>Description</th>
            <th>Configuration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>PostgreSQL</strong></td>
            <td>Query PostgreSQL databases</td>
            <td>Requires connection string</td>
          </tr>
          <tr>
            <td><strong>SQLite</strong></td>
            <td>Query SQLite databases</td>
            <td>Requires database path</td>
          </tr>
        </tbody>
      </table>

      <h3>APIs &amp; Web</h3>
      <table>
        <thead>
          <tr>
            <th>Server</th>
            <th>Description</th>
            <th>Configuration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Brave Search</strong></td>
            <td>Web search via Brave API</td>
            <td>Requires <code>BRAVE_API_KEY</code></td>
          </tr>
          <tr>
            <td><strong>Fetch</strong></td>
            <td>Fetch web content</td>
            <td>No additional config needed</td>
          </tr>
          <tr>
            <td><strong>Puppeteer</strong></td>
            <td>Browser automation</td>
            <td>No additional config needed</td>
          </tr>
        </tbody>
      </table>

      <h3>Cloud Services</h3>
      <table>
        <thead>
          <tr>
            <th>Server</th>
            <th>Description</th>
            <th>Configuration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Google Drive</strong></td>
            <td>Access Google Drive files</td>
            <td>Requires OAuth credentials</td>
          </tr>
          <tr>
            <td><strong>AWS</strong></td>
            <td>AWS service integration</td>
            <td>Requires AWS credentials</td>
          </tr>
        </tbody>
      </table>

      <h3>Productivity</h3>
      <table>
        <thead>
          <tr>
            <th>Server</th>
            <th>Description</th>
            <th>Configuration</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Slack</strong></td>
            <td>Slack workspace integration</td>
            <td>Requires <code>SLACK_BOT_TOKEN</code></td>
          </tr>
        </tbody>
      </table>

      <h2>Environment Variables</h2>
      <p>
        MCP server configurations can reference environment variables using the
        <code>$&#123;VAR_NAME&#125;</code> syntax. These values are read from
        your <code>.env</code> file at runtime.
      </p>

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

      <h2>Adding Custom Servers</h2>
      <p>
        Click &quot;Add Custom Server&quot; to configure a server not in the templates list.
        You&apos;ll need to specify:
      </p>
      <ul>
        <li><strong>Name</strong> - Unique identifier for the server</li>
        <li><strong>Transport</strong> - How to connect (stdio, http, sse, sdk)</li>
        <li><strong>Command/URL</strong> - The command to run or URL to connect to</li>
        <li><strong>Arguments</strong> - Command-line arguments (for stdio)</li>
        <li><strong>Environment</strong> - Environment variables to set</li>
      </ul>

      <h2>Generated Configuration</h2>
      <p>
        MCP configuration is written to <code>.mcp.json</code> in your generated project:
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
