'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { Callout } from '@/components/docs/Callout';

export default function BusinessTemplatesPage() {
  return (
    <DocsLayout
      title="Business Templates"
      description="Templates for business process automation and document handling."
    >
      <p>
        Business templates are designed for automating business processes including
        document processing, report generation, and data entry tasks.
      </p>

      <h2>Business Agent</h2>
      <p>
        A general-purpose business assistant for operations and planning tasks.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Read documents and data</li>
        <li><code>write-file</code> - Create reports and outputs</li>
        <li><code>find-files</code> - Locate business documents</li>
        <li><code>api-client</code> - Integrate with business systems</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Summarize the key points from this quarterly report&quot;</li>
        <li>&quot;Create a project status update from these notes&quot;</li>
        <li>&quot;Analyze the sales data and identify trends&quot;</li>
        <li>&quot;Draft an executive summary of the meeting minutes&quot;</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>Document analysis</li>
        <li>Report creation</li>
        <li>Business planning</li>
        <li>Process automation</li>
      </ul>

      <hr className="my-8" />

      <h2>Document Processing Agent</h2>
      <p>
        Specialized for extracting and analyzing content from business documents.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Read document files</li>
        <li><code>write-file</code> - Create processed outputs</li>
        <li><code>doc-ingest</code> - Extract text from PDFs, DOCX</li>
        <li><code>table-extract</code> - Extract tables to CSV/JSON</li>
        <li><code>find-files</code> - Locate documents</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Extract all line items from these invoices&quot;</li>
        <li>&quot;Parse the contract and identify key terms&quot;</li>
        <li>&quot;Convert this PDF table to a spreadsheet&quot;</li>
        <li>&quot;Extract contact information from these business cards&quot;</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>Invoice processing</li>
        <li>Contract analysis</li>
        <li>Data extraction</li>
        <li>Document conversion</li>
      </ul>

      <Callout type="info">
        <p>
          This template requires the <code>pdf-parse</code> and <code>mammoth</code>
          dependencies for document extraction.
        </p>
      </Callout>

      <hr className="my-8" />

      <h2>Data Entry Agent</h2>
      <p>
        Focused on automating data entry and form population tasks.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Read source data</li>
        <li><code>write-file</code> - Write processed data</li>
        <li><code>find-files</code> - Locate data files</li>
        <li><code>api-client</code> - Submit to external systems</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Transfer data from this CSV to the template format&quot;</li>
        <li>&quot;Validate and clean the customer records&quot;</li>
        <li>&quot;Populate the form fields from the source document&quot;</li>
        <li>&quot;Reconcile data between these two spreadsheets&quot;</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>Form automation</li>
        <li>Data migration</li>
        <li>Record validation</li>
        <li>System synchronization</li>
      </ul>

      <hr className="my-8" />

      <h2>Report Generator Agent</h2>
      <p>
        Specialized for creating business reports and dashboards.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Read data sources</li>
        <li><code>write-file</code> - Create reports</li>
        <li><code>find-files</code> - Locate data files</li>
        <li><code>database-query</code> - Query databases</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Generate a monthly sales report from the database&quot;</li>
        <li>&quot;Create an executive dashboard summary&quot;</li>
        <li>&quot;Build a KPI report comparing this quarter to last&quot;</li>
        <li>&quot;Compile an expense report from the transaction log&quot;</li>
      </ul>

      <h3>Best For</h3>
      <ul>
        <li>Financial reports</li>
        <li>Performance dashboards</li>
        <li>Executive summaries</li>
        <li>Analytics reports</li>
      </ul>

      <h2>Comparing Business Templates</h2>

      <table>
        <thead>
          <tr>
            <th>Template</th>
            <th>Document Extraction</th>
            <th>Database Access</th>
            <th>Primary Focus</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Business Agent</strong></td>
            <td>No</td>
            <td>No</td>
            <td>General operations</td>
          </tr>
          <tr>
            <td><strong>Document Processing</strong></td>
            <td>Yes</td>
            <td>No</td>
            <td>Content extraction</td>
          </tr>
          <tr>
            <td><strong>Data Entry</strong></td>
            <td>No</td>
            <td>No</td>
            <td>Data automation</td>
          </tr>
          <tr>
            <td><strong>Report Generator</strong></td>
            <td>No</td>
            <td>Yes</td>
            <td>Report creation</td>
          </tr>
        </tbody>
      </table>
    </DocsLayout>
  );
}
