'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { Callout } from '@/components/docs/Callout';

export default function ToolsReferencePage() {
  return (
    <DocsLayout
      title="Tools Reference"
      description="Complete reference for all 15 built-in agent tools."
    >
      <p>
        Tools are the capabilities your agent uses to interact with the world.
        Each tool has specific parameters, behaviors, and risk levels.
      </p>

      <h2>File Operations</h2>

      <h3>read-file</h3>
      <p><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">Low Risk</span></p>
      <p>Reads the contents of a file.</p>
      <table>
        <tbody>
          <tr>
            <td><strong>Parameters</strong></td>
            <td><code>path</code> - File path to read</td>
          </tr>
          <tr>
            <td><strong>Returns</strong></td>
            <td>File contents as string</td>
          </tr>
          <tr>
            <td><strong>Use Cases</strong></td>
            <td>Examining source code, reading configuration, analyzing logs</td>
          </tr>
        </tbody>
      </table>

      <h3>write-file</h3>
      <p><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Medium Risk</span></p>
      <p>Creates a new file with specified contents.</p>
      <table>
        <tbody>
          <tr>
            <td><strong>Parameters</strong></td>
            <td><code>path</code> - File path to create<br /><code>content</code> - File contents</td>
          </tr>
          <tr>
            <td><strong>Returns</strong></td>
            <td>Success/failure status</td>
          </tr>
          <tr>
            <td><strong>Use Cases</strong></td>
            <td>Creating new files, generating code, writing reports</td>
          </tr>
        </tbody>
      </table>

      <h3>edit-file</h3>
      <p><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Medium Risk</span></p>
      <p>Modifies an existing file using search and replace.</p>
      <table>
        <tbody>
          <tr>
            <td><strong>Parameters</strong></td>
            <td><code>path</code> - File path<br /><code>old_string</code> - Text to find<br /><code>new_string</code> - Replacement text</td>
          </tr>
          <tr>
            <td><strong>Returns</strong></td>
            <td>Success/failure status with preview</td>
          </tr>
          <tr>
            <td><strong>Use Cases</strong></td>
            <td>Bug fixes, refactoring, updating configuration</td>
          </tr>
        </tbody>
      </table>

      <h3>find-files</h3>
      <p><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">Low Risk</span></p>
      <p>Searches for files matching a glob pattern.</p>
      <table>
        <tbody>
          <tr>
            <td><strong>Parameters</strong></td>
            <td><code>pattern</code> - Glob pattern (e.g., <code>**/*.ts</code>)</td>
          </tr>
          <tr>
            <td><strong>Returns</strong></td>
            <td>List of matching file paths</td>
          </tr>
          <tr>
            <td><strong>Use Cases</strong></td>
            <td>Locating files by extension, finding configuration files</td>
          </tr>
        </tbody>
      </table>
      <p><strong>Dependency:</strong> Requires <code>glob</code> npm package.</p>

      <h3>search-files</h3>
      <p><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">Low Risk</span></p>
      <p>Searches file contents for a pattern.</p>
      <table>
        <tbody>
          <tr>
            <td><strong>Parameters</strong></td>
            <td><code>pattern</code> - Search pattern (regex supported)<br /><code>path</code> - Directory to search</td>
          </tr>
          <tr>
            <td><strong>Returns</strong></td>
            <td>Matching lines with file paths and line numbers</td>
          </tr>
          <tr>
            <td><strong>Use Cases</strong></td>
            <td>Finding function definitions, locating usages, code analysis</td>
          </tr>
        </tbody>
      </table>

      <h2>Command Execution</h2>

      <h3>run-command</h3>
      <p><span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs font-medium">High Risk</span></p>
      <p>Executes arbitrary shell commands.</p>
      <table>
        <tbody>
          <tr>
            <td><strong>Parameters</strong></td>
            <td><code>command</code> - Shell command to execute</td>
          </tr>
          <tr>
            <td><strong>Returns</strong></td>
            <td>Command output (stdout/stderr) and exit code</td>
          </tr>
          <tr>
            <td><strong>Use Cases</strong></td>
            <td>Running builds, executing tests, system administration</td>
          </tr>
        </tbody>
      </table>

      <Callout type="danger" title="Security warning">
        <p>
          This tool can execute any shell command. Only enable when necessary and
          use permission restrictions to limit scope.
        </p>
      </Callout>

      <h3>git-operations</h3>
      <p><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Medium Risk</span></p>
      <p>Performs Git version control operations.</p>
      <table>
        <tbody>
          <tr>
            <td><strong>Parameters</strong></td>
            <td><code>operation</code> - Git operation (status, diff, log, etc.)<br /><code>args</code> - Additional arguments</td>
          </tr>
          <tr>
            <td><strong>Returns</strong></td>
            <td>Git command output</td>
          </tr>
          <tr>
            <td><strong>Use Cases</strong></td>
            <td>Checking status, viewing diffs, creating commits</td>
          </tr>
        </tbody>
      </table>

      <h2>Web Operations</h2>

      <h3>web-search</h3>
      <p><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">Low Risk</span></p>
      <p>Searches the web for information.</p>
      <table>
        <tbody>
          <tr>
            <td><strong>Parameters</strong></td>
            <td><code>query</code> - Search query</td>
          </tr>
          <tr>
            <td><strong>Returns</strong></td>
            <td>Search results with titles, snippets, and URLs</td>
          </tr>
          <tr>
            <td><strong>Use Cases</strong></td>
            <td>Research, finding documentation, checking current information</td>
          </tr>
        </tbody>
      </table>

      <h3>web-fetch</h3>
      <p><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">Low Risk</span></p>
      <p>Fetches and parses web page content.</p>
      <table>
        <tbody>
          <tr>
            <td><strong>Parameters</strong></td>
            <td><code>url</code> - URL to fetch</td>
          </tr>
          <tr>
            <td><strong>Returns</strong></td>
            <td>Page content (HTML parsed to text)</td>
          </tr>
          <tr>
            <td><strong>Use Cases</strong></td>
            <td>Reading documentation, extracting data, analyzing content</td>
          </tr>
        </tbody>
      </table>
      <p><strong>Dependencies:</strong> Requires <code>axios</code> and <code>cheerio</code> npm packages.</p>

      <h2>Database</h2>

      <h3>database-query</h3>
      <p><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Medium Risk</span></p>
      <p>Executes SQL queries against a database.</p>
      <table>
        <tbody>
          <tr>
            <td><strong>Parameters</strong></td>
            <td><code>query</code> - SQL query<br /><code>database</code> - Database path/connection</td>
          </tr>
          <tr>
            <td><strong>Returns</strong></td>
            <td>Query results as JSON</td>
          </tr>
          <tr>
            <td><strong>Use Cases</strong></td>
            <td>Data analysis, report generation, debugging</td>
          </tr>
        </tbody>
      </table>
      <p><strong>Dependency:</strong> Requires <code>better-sqlite3</code> npm package.</p>

      <h2>Integrations</h2>

      <h3>api-client</h3>
      <p><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Medium Risk</span></p>
      <p>Makes HTTP API requests.</p>
      <table>
        <tbody>
          <tr>
            <td><strong>Parameters</strong></td>
            <td><code>url</code> - API endpoint<br /><code>method</code> - HTTP method<br /><code>headers</code> - Request headers<br /><code>body</code> - Request body</td>
          </tr>
          <tr>
            <td><strong>Returns</strong></td>
            <td>API response</td>
          </tr>
          <tr>
            <td><strong>Use Cases</strong></td>
            <td>API integrations, data fetching, webhooks</td>
          </tr>
        </tbody>
      </table>

      <h3>doc-ingest</h3>
      <p><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Medium Risk</span></p>
      <p>Extracts text from documents (PDF, DOCX, etc.).</p>
      <table>
        <tbody>
          <tr>
            <td><strong>Parameters</strong></td>
            <td><code>path</code> - Document file path</td>
          </tr>
          <tr>
            <td><strong>Returns</strong></td>
            <td>Extracted text content</td>
          </tr>
          <tr>
            <td><strong>Use Cases</strong></td>
            <td>Document processing, content extraction, analysis</td>
          </tr>
        </tbody>
      </table>
      <p><strong>Dependencies:</strong> Requires <code>pdf-parse</code> and <code>mammoth</code> npm packages.</p>

      <h3>table-extract</h3>
      <p><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">Medium Risk</span></p>
      <p>Extracts tables from documents to structured formats.</p>
      <table>
        <tbody>
          <tr>
            <td><strong>Parameters</strong></td>
            <td><code>path</code> - Document path<br /><code>format</code> - Output format (csv, json)</td>
          </tr>
          <tr>
            <td><strong>Returns</strong></td>
            <td>Table data in specified format</td>
          </tr>
          <tr>
            <td><strong>Use Cases</strong></td>
            <td>Data extraction, spreadsheet processing, report parsing</td>
          </tr>
        </tbody>
      </table>

      <h3>source-notes</h3>
      <p><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">Low Risk</span></p>
      <p>Tracks citations and sources for research.</p>
      <table>
        <tbody>
          <tr>
            <td><strong>Parameters</strong></td>
            <td><code>source</code> - Source information<br /><code>quote</code> - Relevant excerpt<br /><code>note</code> - Your annotation</td>
          </tr>
          <tr>
            <td><strong>Returns</strong></td>
            <td>Stored citation reference</td>
          </tr>
          <tr>
            <td><strong>Use Cases</strong></td>
            <td>Research documentation, bibliography building, evidence tracking</td>
          </tr>
        </tbody>
      </table>

      <h3>local-rag</h3>
      <p><span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">Low Risk</span></p>
      <p>Performs semantic search over local document corpus.</p>
      <table>
        <tbody>
          <tr>
            <td><strong>Parameters</strong></td>
            <td><code>query</code> - Semantic search query<br /><code>corpus</code> - Document directory</td>
          </tr>
          <tr>
            <td><strong>Returns</strong></td>
            <td>Relevant document chunks with similarity scores</td>
          </tr>
          <tr>
            <td><strong>Use Cases</strong></td>
            <td>Knowledge retrieval, document Q&A, research assistance</td>
          </tr>
        </tbody>
      </table>

      <h2>Permission Levels Summary</h2>

      <table>
        <thead>
          <tr>
            <th>Permission Level</th>
            <th>Enabled Tools</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Restrictive</strong></td>
            <td>read-file, find-files, search-files, web-search</td>
          </tr>
          <tr>
            <td><strong>Balanced</strong></td>
            <td>Restrictive + write-file, git-operations, web-fetch, api-client</td>
          </tr>
          <tr>
            <td><strong>Permissive</strong></td>
            <td>All tools including run-command</td>
          </tr>
        </tbody>
      </table>
    </DocsLayout>
  );
}
