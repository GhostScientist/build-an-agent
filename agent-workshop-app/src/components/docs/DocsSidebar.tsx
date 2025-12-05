'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { docsNavigation, type NavSection, type NavItem } from '@/lib/docs/navigation';
import { clsx } from 'clsx';
import type { Route } from 'next';

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const isActive = pathname === item.href;
  const hasChildren = item.items && item.items.length > 0;
  const [isExpanded, setIsExpanded] = useState(
    hasChildren && item.items?.some(child => pathname === child.href)
  );

  return (
    <div>
      <div className="flex items-center">
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded mr-1"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-500" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-500" />
            )}
          </button>
        )}
        <Link
          href={item.href as Route}
          className={clsx(
            'flex-1 py-1.5 px-2 text-sm rounded-md transition-colors',
            depth > 0 && 'ml-4',
            isActive
              ? 'bg-blue-50 text-blue-700 font-medium'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          {item.title}
        </Link>
      </div>
      {hasChildren && isExpanded && (
        <div className="ml-2 mt-1 space-y-1">
          {item.items?.map(child => (
            <NavItemComponent key={child.href} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function NavSectionComponent({ section }: { section: NavSection }) {
  return (
    <div className="mb-6">
      <h3 className="px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {section.title}
      </h3>
      <div className="space-y-1">
        {section.items.map(item => (
          <NavItemComponent key={item.href} item={item} />
        ))}
      </div>
    </div>
  );
}

export function DocsSidebar() {
  return (
    <nav className="w-64 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto">
      <div className="sticky top-0 p-4">
        <Link href="/" className="flex items-center gap-2 mb-6 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-gray-900">Build-An-Agent Workshop</span>
        </Link>
        {docsNavigation.map(section => (
          <NavSectionComponent key={section.title} section={section} />
        ))}
      </div>
    </nav>
  );
}
