import type { MCPServerTemplate, MCPServerCategory } from '../types.js';

export const MCP_SERVER_TEMPLATES: MCPServerTemplate[] = [
  // Browser Automation - Ready to use
  {
    id: 'playwright',
    name: 'Playwright',
    description: 'Browser automation for web interaction and scraping',
    category: 'api',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['@playwright/mcp@latest'],
    }
  },

  // Memory - Ready to use
  {
    id: 'memory',
    name: 'Memory',
    description: 'Persistent memory and knowledge graph storage',
    category: 'productivity',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory'],
    }
  },

  // Sequential Thinking - Ready to use
  {
    id: 'sequential-thinking',
    name: 'Sequential Thinking',
    description: 'Step-by-step reasoning and problem decomposition',
    category: 'productivity',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
    }
  },

  // Filesystem - Requires directory configuration
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'Read, write, and manage files (configure directory after setup)',
    category: 'filesystem',
    requiresConfiguration: true,
    configurationNote: 'Edit agent.json to set your allowed directory path',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '.'],
    }
  },

  // GitHub - Requires token
  {
    id: 'github',
    name: 'GitHub',
    description: 'Repository operations, issues, and pull requests (requires Docker)',
    category: 'git',
    requiresInput: true,
    inputId: 'github-token',
    inputDescription: 'GitHub Personal Access Token',
    defaultConfig: {
      transportType: 'stdio',
      command: 'docker',
      args: [
        'run', '-i', '--rm',
        '-e', 'GITHUB_PERSONAL_ACCESS_TOKEN',
        '-e', 'GITHUB_TOOLSETS=repos,pull_requests,issues',
        'ghcr.io/github/github-mcp-server'
      ],
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: '${input:github-token}' }
    }
  },

  // Brave Search - Requires API key
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Web search via Brave Search API',
    category: 'api',
    requiresInput: true,
    inputId: 'brave-api-key',
    inputDescription: 'Brave Search API Key',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-brave-search'],
      env: { BRAVE_API_KEY: '${input:brave-api-key}' }
    }
  },

  // Databases
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Query and manage PostgreSQL databases',
    category: 'database',
    requiresInput: true,
    inputId: 'database-url',
    inputDescription: 'PostgreSQL connection URL',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres', '${input:database-url}'],
    }
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    description: 'Query and manage SQLite databases',
    category: 'database',
    requiresConfiguration: true,
    configurationNote: 'Edit agent.json to set your database path',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sqlite', '--db-path', './data.db'],
    }
  },
];

// Popular servers for quick-add (ready to use without configuration)
export const POPULAR_MCP_SERVERS = [
  'playwright',
  'memory',
  'sequential-thinking',
  'filesystem',
  'github',
  'brave-search'
];

// Helper functions
export function getTemplateById(id: string): MCPServerTemplate | undefined {
  return MCP_SERVER_TEMPLATES.find(t => t.id === id);
}

export function getQuickAddTemplates(): MCPServerTemplate[] {
  // Return templates that work without input (but may need config)
  return MCP_SERVER_TEMPLATES.filter(t => !t.requiresInput);
}

export function getReadyToUseTemplates(): MCPServerTemplate[] {
  // Return templates that work completely out of the box
  return MCP_SERVER_TEMPLATES.filter(t => !t.requiresInput && !t.requiresConfiguration);
}

export function getTemplatesByCategory(category: MCPServerCategory): MCPServerTemplate[] {
  return MCP_SERVER_TEMPLATES.filter(t => t.category === category);
}

export const MCP_CATEGORY_LABELS: Record<MCPServerCategory, string> = {
  filesystem: 'Filesystem',
  git: 'Git & Version Control',
  database: 'Databases',
  api: 'APIs & Web',
  cloud: 'Cloud Services',
  productivity: 'Productivity',
  custom: 'Custom',
};
