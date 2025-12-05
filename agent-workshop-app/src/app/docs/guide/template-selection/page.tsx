'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { Callout } from '@/components/docs/Callout';
import Link from 'next/link';

export default function TemplateSelectionPage() {
  return (
    <DocsLayout
      title="Template Selection"
      description="Step 2: Pick a pre-built template or start from scratch."
    >
      <p>
        Templates provide pre-configured starting points for your agent. Each template
        includes default tool selections, sample prompts, and specialization text
        tailored to specific use cases.
      </p>

      <h2>Template Benefits</h2>
      <ul>
        <li><strong>Faster setup</strong> - Skip manual tool configuration</li>
        <li><strong>Best practices</strong> - Templates encode recommended configurations</li>
        <li><strong>Sample prompts</strong> - See what your agent can do</li>
        <li><strong>Specialization</strong> - Agent behavior tuned for the use case</li>
      </ul>

      <h2>Available Templates by Domain</h2>

      <h3>Development Domain</h3>
      <table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Description</th>
            <th>Key Tools</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Development Agent</strong></td>
            <td>Full-stack development assistance</td>
            <td>read-file, write-file, edit-file, run-command, git-operations</td>
          </tr>
          <tr>
            <td><strong>Code Review Agent</strong></td>
            <td>Automated code quality and security review</td>
            <td>read-file, find-files, search-files</td>
          </tr>
          <tr>
            <td><strong>Testing Agent</strong></td>
            <td>Test generation and execution</td>
            <td>read-file, write-file, run-command</td>
          </tr>
          <tr>
            <td><strong>Modernization Agent</strong></td>
            <td>Legacy code analysis and migration planning</td>
            <td>read-file, find-files, search-files, web-search</td>
          </tr>
        </tbody>
      </table>

      <h3>Business Domain</h3>
      <table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Description</th>
            <th>Key Tools</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Business Agent</strong></td>
            <td>General business operations</td>
            <td>read-file, write-file, api-client</td>
          </tr>
          <tr>
            <td><strong>Document Processing</strong></td>
            <td>Extract and analyze business documents</td>
            <td>read-file, write-file, doc-ingest, table-extract</td>
          </tr>
          <tr>
            <td><strong>Data Entry Agent</strong></td>
            <td>Automated form filling and data validation</td>
            <td>read-file, write-file, api-client</td>
          </tr>
          <tr>
            <td><strong>Report Generator</strong></td>
            <td>Business reports and dashboards</td>
            <td>read-file, write-file, database-query</td>
          </tr>
        </tbody>
      </table>

      <h3>Creative Domain</h3>
      <table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Description</th>
            <th>Key Tools</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Creative Agent</strong></td>
            <td>General content creation</td>
            <td>read-file, write-file, web-search</td>
          </tr>
          <tr>
            <td><strong>Social Media Manager</strong></td>
            <td>Social content planning and creation</td>
            <td>read-file, write-file, web-search, web-fetch</td>
          </tr>
          <tr>
            <td><strong>Blog Writing Agent</strong></td>
            <td>SEO-optimized blog content</td>
            <td>read-file, write-file, web-search, web-fetch</td>
          </tr>
          <tr>
            <td><strong>Marketing Copywriter</strong></td>
            <td>Persuasive marketing copy</td>
            <td>read-file, write-file, web-search</td>
          </tr>
        </tbody>
      </table>

      <h3>Data Domain</h3>
      <table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Description</th>
            <th>Key Tools</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Data Analysis Agent</strong></td>
            <td>Statistical analysis and insights</td>
            <td>read-file, write-file, database-query, run-command</td>
          </tr>
          <tr>
            <td><strong>Visualization Agent</strong></td>
            <td>Charts and dashboard creation</td>
            <td>read-file, write-file, run-command</td>
          </tr>
          <tr>
            <td><strong>ML Pipeline Builder</strong></td>
            <td>Machine learning workflow development</td>
            <td>read-file, write-file, run-command</td>
          </tr>
        </tbody>
      </table>

      <h3>Knowledge Domain</h3>
      <table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Description</th>
            <th>Key Tools</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Research Ops Agent</strong></td>
            <td>Literature review with citations</td>
            <td>read-file, write-file, web-search, web-fetch, doc-ingest, source-notes, local-rag</td>
          </tr>
        </tbody>
      </table>

      <h2>Template Structure</h2>
      <p>Each template defines:</p>

      <ul>
        <li>
          <strong>Default tools</strong> - Pre-selected tools appropriate for the use case
        </li>
        <li>
          <strong>Sample prompts</strong> - Example queries showing agent capabilities
        </li>
        <li>
          <strong>Specialization text</strong> - Instructions that shape agent behavior
        </li>
        <li>
          <strong>Documentation</strong> - Description of the template&apos;s purpose
        </li>
      </ul>

      <h2>Custom Template Option</h2>
      <p>
        If no template fits your needs, select <strong>Custom</strong> to start with a
        blank configuration. You&apos;ll need to manually select all tools and write your
        own specialization text.
      </p>

      <Callout type="tip" title="Recommendation">
        <p>
          Start with a template even if it&apos;s not a perfect fit. You can modify all
          settings in subsequent wizard steps. Templates save time and encode best practices.
        </p>
      </Callout>

      <h2>After Selection</h2>
      <p>
        When you select a template, the wizard will:
      </p>
      <ol>
        <li>Load the template&apos;s default tool configuration</li>
        <li>Set the specialization text</li>
        <li>Automatically advance to the SDK Configuration step</li>
      </ol>
    </DocsLayout>
  );
}
