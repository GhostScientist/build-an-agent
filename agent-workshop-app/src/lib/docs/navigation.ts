// Documentation navigation structure
export interface NavItem {
  title: string;
  href: string;
  items?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const docsNavigation: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Quick Start', href: '/docs/quick-start' },
      { title: 'Core Concepts', href: '/docs/concepts' },
    ],
  },
  {
    title: 'User Guide',
    items: [
      { title: 'Domain Selection', href: '/docs/guide/domain-selection' },
      { title: 'Template Selection', href: '/docs/guide/template-selection' },
      { title: 'SDK Configuration', href: '/docs/guide/sdk-configuration' },
      { title: 'Tool Configuration', href: '/docs/guide/tool-configuration' },
      { title: 'MCP Configuration', href: '/docs/guide/mcp-configuration' },
      { title: 'Project Settings', href: '/docs/guide/project-settings' },
      { title: 'Preview & Generate', href: '/docs/guide/preview-generate' },
    ],
  },
  {
    title: 'Features',
    items: [
      { title: 'Tools Reference', href: '/docs/features/tools' },
      { title: 'MCP Servers', href: '/docs/features/mcp-servers' },
    ],
  },
  {
    title: 'Using Your Agent',
    items: [
      { title: 'Project Structure', href: '/docs/generated/project-structure' },
      { title: 'Running Your Agent', href: '/docs/generated/running' },
      { title: 'Customization', href: '/docs/generated/customization' },
      {
        title: 'Claude Code Levers',
        href: '/docs/features/levers',
        items: [
          { title: 'Memory (CLAUDE.md)', href: '/docs/features/levers/memory' },
          { title: 'Slash Commands', href: '/docs/features/levers/slash-commands' },
          { title: 'Skills', href: '/docs/features/levers/skills' },
          { title: 'Subagents', href: '/docs/features/levers/subagents' },
          { title: 'Hooks', href: '/docs/features/levers/hooks' },
        ],
      },
    ],
  },
  {
    title: 'Templates',
    items: [
      { title: 'Overview', href: '/docs/templates' },
      { title: 'Development', href: '/docs/templates/development' },
      { title: 'Business', href: '/docs/templates/business' },
      { title: 'Creative', href: '/docs/templates/creative' },
      { title: 'Data & Analytics', href: '/docs/templates/data' },
      { title: 'Knowledge & Research', href: '/docs/templates/knowledge' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { title: 'AgentConfig Schema', href: '/docs/reference/agent-config' },
      { title: 'Generator API', href: '/docs/reference/generator' },
      { title: 'Integration Patterns', href: '/docs/reference/integrations' },
    ],
  },
  {
    title: 'Best Practices',
    items: [
      { title: 'Security Guidelines', href: '/docs/best-practices/security' },
      { title: 'Common Patterns', href: '/docs/best-practices/patterns' },
    ],
  },
];

export function flattenNavigation(sections: NavSection[]): NavItem[] {
  const items: NavItem[] = [];

  for (const section of sections) {
    for (const item of section.items) {
      items.push(item);
      if (item.items) {
        items.push(...item.items);
      }
    }
  }

  return items;
}

export function findNavItem(href: string): NavItem | undefined {
  const flat = flattenNavigation(docsNavigation);
  return flat.find(item => item.href === href);
}

export function findAdjacentPages(href: string): { prev?: NavItem; next?: NavItem } {
  const flat = flattenNavigation(docsNavigation);
  const index = flat.findIndex(item => item.href === href);

  return {
    prev: index > 0 ? flat[index - 1] : undefined,
    next: index < flat.length - 1 ? flat[index + 1] : undefined,
  };
}
