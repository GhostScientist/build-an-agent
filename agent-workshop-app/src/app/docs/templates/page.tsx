'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { Callout } from '@/components/docs/Callout';
import Link from 'next/link';
import { Code, Briefcase, Palette, Database, BookOpen } from 'lucide-react';

export default function TemplatesOverviewPage() {
  return (
    <DocsLayout
      title="Templates Overview"
      description="Pre-built agent templates for common use cases."
    >
      <p>
        Agent Workshop includes templates across five domains. Each template
        provides pre-configured tools, sample prompts, and specialization text
        to help you get started quickly.
      </p>

      <h2>Available Templates</h2>

      <div className="grid grid-cols-1 gap-4 not-prose my-6">
        <Link href="/docs/templates/development" className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Code className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Development</h3>
              <p className="text-sm text-gray-500">4 templates</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Code review, testing, debugging, and full-stack development assistance.
          </p>
        </Link>

        <Link href="/docs/templates/business" className="block p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Business</h3>
              <p className="text-sm text-gray-500">4 templates</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Document processing, report generation, data entry automation.
          </p>
        </Link>

        <Link href="/docs/templates/creative" className="block p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Creative</h3>
              <p className="text-sm text-gray-500">4 templates</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Content creation, copywriting, social media management.
          </p>
        </Link>

        <Link href="/docs/templates/data" className="block p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Data &amp; Analytics</h3>
              <p className="text-sm text-gray-500">3 templates</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Data analysis, visualization, ML pipeline development.
          </p>
        </Link>

        <Link href="/docs/templates/knowledge" className="block p-4 border border-gray-200 rounded-lg hover:border-cyan-300 hover:bg-cyan-50/50 transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Knowledge &amp; Research</h3>
              <p className="text-sm text-gray-500">1 template</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            Literature review, research synthesis, citation management.
          </p>
        </Link>
      </div>

      <h2>Template Components</h2>
      <p>
        Each template includes:
      </p>

      <h3>Default Tools</h3>
      <p>
        Pre-selected tools appropriate for the use case. These are enabled by
        default but can be modified in the Tool Configuration step.
      </p>

      <h3>Sample Prompts</h3>
      <p>
        Example queries showing what the agent can do. These help users understand
        the template&apos;s capabilities.
      </p>

      <h3>Specialization Text</h3>
      <p>
        Instructions that shape the agent&apos;s behavior for the specific use case.
        This becomes part of the agent&apos;s system prompt.
      </p>

      <h3>Documentation</h3>
      <p>
        Description of the template&apos;s purpose and intended workflow.
      </p>

      <h2>Choosing a Template</h2>

      <Callout type="tip" title="Start with a template">
        <p>
          Even if a template isn&apos;t a perfect fit, it&apos;s usually faster to start
          with one and customize than to build from scratch. Templates encode
          best practices for each domain.
        </p>
      </Callout>

      <h3>Consider Your Primary Use Case</h3>
      <p>
        Choose the template closest to your main workflow. You can always add
        tools from other domains.
      </p>

      <h3>Review Sample Prompts</h3>
      <p>
        Sample prompts show what tasks the template is optimized for. If your
        needs align, it&apos;s a good fit.
      </p>

      <h3>Check Default Tools</h3>
      <p>
        Verify the default tools match your requirements. Missing tools can be
        added; unnecessary tools can be disabled.
      </p>

      <h2>Custom Templates</h2>
      <p>
        If no template fits your needs, select <strong>Custom</strong> in the
        domain selection to start with a blank configuration. You&apos;ll need to:
      </p>
      <ul>
        <li>Select all tools manually</li>
        <li>Write your own specialization text</li>
        <li>Configure all settings from scratch</li>
      </ul>
    </DocsLayout>
  );
}
