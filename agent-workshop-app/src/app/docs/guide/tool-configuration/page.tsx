'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { Callout } from '@/components/docs/Callout';
import Link from 'next/link';

export default function ToolConfigurationPage() {
  return (
    <DocsLayout
      title="Tool Configuration"
      description="Step 4: Enable the capabilities your agent needs."
    >
      <p>
        Tools give your agent the ability to interact with the world. Each tool
        has an associated risk level that indicates its potential impact.
      </p>

      <h2>Risk Levels</h2>
      <table>
        <thead>
          <tr>
            <th>Level</th>
            <th>Description</th>
            <th>Examples</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-sm font-medium">Low</span></td>
            <td>Read-only operations with no side effects</td>
            <td>read-file, find-files, web-search</td>
          </tr>
          <tr>
            <td><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">Medium</span></td>
            <td>Write operations with safeguards</td>
            <td>write-file, edit-file, database-query</td>
          </tr>
          <tr>
            <td><span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-sm font-medium">High</span></td>
            <td>Unrestricted system access</td>
            <td>run-command</td>
          </tr>
        </tbody>
      </table>

      <h2>Available Tools</h2>

      <h3>File Operations</h3>
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Risk</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>read-file</code></td>
            <td><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Low</span></td>
            <td>Read contents of files</td>
          </tr>
          <tr>
            <td><code>write-file</code></td>
            <td><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">Medium</span></td>
            <td>Create new files</td>
          </tr>
          <tr>
            <td><code>edit-file</code></td>
            <td><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">Medium</span></td>
            <td>Modify existing files</td>
          </tr>
          <tr>
            <td><code>find-files</code></td>
            <td><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Low</span></td>
            <td>Search files by glob patterns</td>
          </tr>
          <tr>
            <td><code>search-files</code></td>
            <td><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Low</span></td>
            <td>Search file contents</td>
          </tr>
        </tbody>
      </table>

      <h3>Command Execution</h3>
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Risk</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>run-command</code></td>
            <td><span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">High</span></td>
            <td>Execute shell commands</td>
          </tr>
          <tr>
            <td><code>git-operations</code></td>
            <td><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">Medium</span></td>
            <td>Git version control operations</td>
          </tr>
        </tbody>
      </table>

      <Callout type="warning" title="High-risk tool warning">
        <p>
          The <code>run-command</code> tool can execute arbitrary shell commands.
          Only enable this when necessary and ensure you understand the security implications.
        </p>
      </Callout>

      <h3>Web Operations</h3>
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Risk</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>web-search</code></td>
            <td><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Low</span></td>
            <td>Search the web</td>
          </tr>
          <tr>
            <td><code>web-fetch</code></td>
            <td><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Low</span></td>
            <td>Fetch and analyze web pages</td>
          </tr>
        </tbody>
      </table>

      <h3>Database</h3>
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Risk</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>database-query</code></td>
            <td><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">Medium</span></td>
            <td>Execute SQL queries</td>
          </tr>
        </tbody>
      </table>

      <h3>Integrations</h3>
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Risk</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>api-client</code></td>
            <td><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">Medium</span></td>
            <td>Make HTTP API requests</td>
          </tr>
          <tr>
            <td><code>doc-ingest</code></td>
            <td><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">Medium</span></td>
            <td>Extract text from PDFs, DOCX, and other documents</td>
          </tr>
          <tr>
            <td><code>table-extract</code></td>
            <td><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">Medium</span></td>
            <td>Extract tables to CSV/JSON format</td>
          </tr>
          <tr>
            <td><code>source-notes</code></td>
            <td><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Low</span></td>
            <td>Track citations and sources</td>
          </tr>
          <tr>
            <td><code>local-rag</code></td>
            <td><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">Low</span></td>
            <td>Semantic search over local documents</td>
          </tr>
        </tbody>
      </table>

      <h2>Permission Levels</h2>
      <p>
        Permission levels provide quick presets for tool selection:
      </p>

      <h3>Restrictive</h3>
      <p>Read-only operations only. Enables:</p>
      <ul>
        <li>read-file</li>
        <li>find-files</li>
        <li>search-files</li>
        <li>web-search</li>
      </ul>

      <h3>Balanced</h3>
      <p>Read operations plus controlled writes. Enables:</p>
      <ul>
        <li>All restrictive tools</li>
        <li>write-file</li>
        <li>git-operations</li>
        <li>web-fetch</li>
        <li>api-client</li>
      </ul>

      <h3>Permissive</h3>
      <p>All tools enabled, including high-risk operations.</p>

      <Callout type="tip" title="Best practice">
        <p>
          Start with <strong>Restrictive</strong> or <strong>Balanced</strong> permissions.
          Enable additional tools only as needed for your specific use case.
        </p>
      </Callout>

      <h2>Category Toggles</h2>
      <p>
        You can enable or disable entire categories of tools at once using the
        category toggle buttons. This is useful for quickly configuring related tools.
      </p>

      <h2>Tool Dependencies</h2>
      <p>
        When you enable certain tools, the generator automatically includes the
        required npm dependencies:
      </p>
      <ul>
        <li><code>find-files</code> requires <code>glob</code></li>
        <li><code>web-fetch</code> requires <code>axios</code> and <code>cheerio</code></li>
        <li><code>database-query</code> requires <code>better-sqlite3</code></li>
        <li><code>doc-ingest</code> requires <code>pdf-parse</code> and <code>mammoth</code></li>
      </ul>
    </DocsLayout>
  );
}
