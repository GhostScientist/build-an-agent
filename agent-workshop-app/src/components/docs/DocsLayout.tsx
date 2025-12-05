'use client';

import { DocsSidebar } from './DocsSidebar';
import { DocsNavigation } from './DocsNavigation';
import { ArrowLeft, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface DocsLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function DocsLayout({ children, title, description }: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center gap-4 bg-white border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-700"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">Docs</span>
        </Link>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex flex-col w-72 bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="font-semibold text-gray-900">Navigation</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <DocsSidebar />
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:block fixed inset-y-0 left-0 w-64 border-r border-gray-200 bg-white overflow-y-auto">
          <DocsSidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Builder
              </Link>
            </div>

            {/* Page header */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              {description && (
                <p className="text-lg text-gray-600">{description}</p>
              )}
            </header>

            {/* Content */}
            <div className="prose prose-gray max-w-none prose-headings:font-semibold prose-a:text-blue-600 prose-code:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-gray-900 prose-pre:text-gray-100">
              {children}
            </div>

            {/* Page navigation */}
            <DocsNavigation />
          </div>
        </main>
      </div>
    </div>
  );
}
