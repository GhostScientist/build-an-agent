'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { Callout } from '@/components/docs/Callout';
import { Code, Briefcase, Palette, Database, BookOpen } from 'lucide-react';

export default function DomainSelectionPage() {
  return (
    <DocsLayout
      title="Domain Selection"
      description="Step 1: Choose your agent's area of expertise."
    >
      <p>
        The first step in creating your agent is selecting its domain. Your domain choice
        determines which templates are available and influences default tool selections.
      </p>

      <h2>Available Domains</h2>

      <div className="space-y-6 not-prose my-6">
        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Code className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Development</h3>
          </div>
          <p className="text-gray-600 mb-3">
            Build agents for software engineering tasks including code review, testing,
            debugging, and legacy code modernization.
          </p>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Example use cases:</span>
            <ul className="mt-1 text-gray-600 list-disc list-inside">
              <li>Automated code review with security analysis</li>
              <li>Test generation and execution</li>
              <li>Legacy codebase modernization</li>
              <li>Build system debugging</li>
            </ul>
          </div>
          <div className="mt-3 text-sm">
            <span className="font-medium text-gray-700">Recommended tools:</span>
            <span className="text-gray-600 ml-1">
              read-file, write-file, edit-file, find-files, search-files, run-command, git-operations
            </span>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Business</h3>
          </div>
          <p className="text-gray-600 mb-3">
            Automate business processes including document handling, report generation,
            and data entry tasks.
          </p>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Example use cases:</span>
            <ul className="mt-1 text-gray-600 list-disc list-inside">
              <li>Invoice and contract processing</li>
              <li>Business report generation</li>
              <li>Data entry automation</li>
              <li>Meeting summary extraction</li>
            </ul>
          </div>
          <div className="mt-3 text-sm">
            <span className="font-medium text-gray-700">Recommended tools:</span>
            <span className="text-gray-600 ml-1">
              read-file, write-file, doc-ingest, table-extract, api-client
            </span>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Creative</h3>
          </div>
          <p className="text-gray-600 mb-3">
            Create content-focused agents for writing, copywriting, and creative tasks.
          </p>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Example use cases:</span>
            <ul className="mt-1 text-gray-600 list-disc list-inside">
              <li>Blog post writing with SEO optimization</li>
              <li>Social media content planning</li>
              <li>Marketing copy generation</li>
              <li>Content calendar management</li>
            </ul>
          </div>
          <div className="mt-3 text-sm">
            <span className="font-medium text-gray-700">Recommended tools:</span>
            <span className="text-gray-600 ml-1">
              read-file, write-file, web-search, web-fetch
            </span>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Data &amp; Analytics</h3>
          </div>
          <p className="text-gray-600 mb-3">
            Build agents for data analysis, visualization, and machine learning workflows.
          </p>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Example use cases:</span>
            <ul className="mt-1 text-gray-600 list-disc list-inside">
              <li>Data exploration and profiling</li>
              <li>Statistical analysis and insights</li>
              <li>Visualization and dashboard creation</li>
              <li>ML pipeline development</li>
            </ul>
          </div>
          <div className="mt-3 text-sm">
            <span className="font-medium text-gray-700">Recommended tools:</span>
            <span className="text-gray-600 ml-1">
              read-file, write-file, database-query, run-command
            </span>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-600" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Knowledge &amp; Research</h3>
          </div>
          <p className="text-gray-600 mb-3">
            Create research agents for literature review, evidence synthesis, and citation management.
          </p>
          <div className="text-sm">
            <span className="font-medium text-gray-700">Example use cases:</span>
            <ul className="mt-1 text-gray-600 list-disc list-inside">
              <li>Literature review and synthesis</li>
              <li>Source tracking and citations</li>
              <li>Research note organization</li>
              <li>Evidence-based recommendations</li>
            </ul>
          </div>
          <div className="mt-3 text-sm">
            <span className="font-medium text-gray-700">Recommended tools:</span>
            <span className="text-gray-600 ml-1">
              read-file, write-file, web-search, web-fetch, doc-ingest, source-notes, local-rag
            </span>
          </div>
        </div>

      </div>

      <Callout type="tip" title="Choosing the right domain">
        <p>
          If your use case spans multiple domains, consider which is most central to your
          workflow. You can always enable tools from other domains in the Tool Configuration step.
        </p>
      </Callout>

      <h2>What Happens After Selection</h2>
      <p>
        After selecting a domain, the wizard will:
      </p>
      <ol>
        <li>Filter templates to show only those relevant to your domain</li>
        <li>Pre-select recommended tools based on the domain</li>
        <li>Generate domain-specific workflow commands in the final project</li>
      </ol>

      <p>
        You can change your domain at any time by navigating back to this step.
      </p>
    </DocsLayout>
  );
}
