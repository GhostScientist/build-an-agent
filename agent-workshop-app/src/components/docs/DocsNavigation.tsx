'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { findAdjacentPages } from '@/lib/docs/navigation';
import type { Route } from 'next';

export function DocsNavigation() {
  const pathname = usePathname();
  const { prev, next } = findAdjacentPages(pathname);

  if (!prev && !next) return null;

  return (
    <nav className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex justify-between">
        {prev ? (
          <Link
            href={prev.href as Route}
            className="group flex flex-col items-start gap-1 text-gray-500 hover:text-gray-900"
          >
            <span className="flex items-center gap-1 text-sm">
              <ChevronLeft className="w-4 h-4" />
              Previous
            </span>
            <span className="font-medium text-gray-900 group-hover:text-blue-600">
              {prev.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={next.href as Route}
            className="group flex flex-col items-end gap-1 text-gray-500 hover:text-gray-900"
          >
            <span className="flex items-center gap-1 text-sm">
              Next
              <ChevronRight className="w-4 h-4" />
            </span>
            <span className="font-medium text-gray-900 group-hover:text-blue-600">
              {next.title}
            </span>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </nav>
  );
}
