'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { Callout } from '@/components/docs/Callout';

export default function KnowledgeTemplatesPage() {
  return (
    <DocsLayout
      title="Knowledge & Research Templates"
      description="Templates for research, literature review, and knowledge synthesis."
    >
      <p>
        Knowledge templates are designed for research workflows including literature
        review, evidence synthesis, and citation management.
      </p>

      <h2>Research Ops Agent</h2>
      <p>
        A comprehensive research assistant for literature review and evidence-based
        analysis with full citation tracking.
      </p>

      <h3>Default Tools</h3>
      <ul>
        <li><code>read-file</code> - Read research papers and notes</li>
        <li><code>write-file</code> - Create research outputs</li>
        <li><code>find-files</code> - Locate documents</li>
        <li><code>web-search</code> - Search for papers and sources</li>
        <li><code>web-fetch</code> - Retrieve web content</li>
        <li><code>doc-ingest</code> - Extract text from PDFs</li>
        <li><code>source-notes</code> - Track citations</li>
        <li><code>local-rag</code> - Semantic search over documents</li>
      </ul>

      <h3>Sample Prompts</h3>
      <ul>
        <li>&quot;Review the literature on [topic] and summarize key findings&quot;</li>
        <li>&quot;Find papers that support or contradict this hypothesis&quot;</li>
        <li>&quot;Create an annotated bibliography from these sources&quot;</li>
        <li>&quot;Synthesize the research on [topic] into a report&quot;</li>
        <li>&quot;Track and cite all sources used in this analysis&quot;</li>
      </ul>

      <h3>Key Features</h3>

      <h4>Citation Tracking</h4>
      <p>
        The <code>source-notes</code> tool automatically tracks all sources used,
        including:
      </p>
      <ul>
        <li>File references with line numbers</li>
        <li>URL citations</li>
        <li>Confidence levels for claims</li>
        <li>Relevant quotes and excerpts</li>
      </ul>

      <h4>Document Processing</h4>
      <p>
        The <code>doc-ingest</code> tool extracts text from:
      </p>
      <ul>
        <li>PDF files (research papers, reports)</li>
        <li>DOCX files (Word documents)</li>
        <li>Plain text files</li>
      </ul>

      <h4>Semantic Search</h4>
      <p>
        The <code>local-rag</code> tool enables semantic search across your document
        corpus, finding relevant content even without exact keyword matches.
      </p>

      <h3>Best For</h3>
      <ul>
        <li>Academic literature reviews</li>
        <li>Research synthesis</li>
        <li>Evidence-based analysis</li>
        <li>Bibliography management</li>
        <li>Knowledge management</li>
      </ul>

      <Callout type="tip" title="Document corpus">
        <p>
          For best results with <code>local-rag</code>, organize your research
          documents in a dedicated directory that the agent can index and search.
        </p>
      </Callout>

      <h2>Research Workflow</h2>
      <p>
        The Research Ops Agent is designed for a systematic research workflow:
      </p>

      <h3>1. Discovery</h3>
      <p>
        Use web search and document ingestion to gather relevant sources.
      </p>

      <h3>2. Analysis</h3>
      <p>
        Read and analyze sources, using semantic search to find relevant passages.
      </p>

      <h3>3. Citation</h3>
      <p>
        Track all sources using the citation system, noting confidence levels.
      </p>

      <h3>4. Synthesis</h3>
      <p>
        Combine findings into comprehensive reports with full citations.
      </p>

      <h2>Research Output Formats</h2>
      <p>
        The agent can generate various research outputs:
      </p>
      <ul>
        <li><strong>Literature summaries</strong> - 200-300 words with key findings</li>
        <li><strong>Annotated bibliographies</strong> - Sources with annotations</li>
        <li><strong>Synthesis reports</strong> - Comprehensive analysis with methodology</li>
        <li><strong>Citation lists</strong> - Formatted reference lists</li>
      </ul>

      <h2>Research Quality Guidelines</h2>
      <p>
        The template includes guidance for research quality:
      </p>
      <ul>
        <li>Cross-reference claims across multiple sources</li>
        <li>Flag contradictory findings</li>
        <li>Note limitations and gaps in literature</li>
        <li>Distinguish primary from secondary sources</li>
        <li>Include confidence levels for claims</li>
      </ul>

      <Callout type="info">
        <p>
          This template uses the most tools of any template. All tools are read-only
          except <code>write-file</code> for creating research outputs.
        </p>
      </Callout>
    </DocsLayout>
  );
}
