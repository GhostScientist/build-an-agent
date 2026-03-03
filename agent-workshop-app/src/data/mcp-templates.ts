import { MCPServerTemplate } from '@/types/agent'

export const MCP_SERVER_TEMPLATES: MCPServerTemplate[] = [
  // Browser Automation - VERIFIED WORKING
  {
    id: 'playwright',
    name: 'Playwright',
    description: 'Browser automation for web interaction and scraping',
    icon: 'GlobeAltIcon',
    category: 'api',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['@playwright/mcp@latest'],
    }
  },

  // Git / Version Control - VERIFIED WORKING (requires Docker)
  {
    id: 'github',
    name: 'GitHub',
    description: 'GitHub repository operations, issues, and pull requests (requires Docker)',
    icon: 'CodeBracketIcon',
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

  // Filesystem - Note: Requires user to configure allowed directory
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'Read, write, and manage files (configure allowed directory after download)',
    icon: 'FolderIcon',
    category: 'filesystem',
    requiresConfiguration: true,
    configurationNote: 'Edit agent.json to set your allowed directory path',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '.'],
    }
  },

  // Databases
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Query and manage PostgreSQL databases',
    icon: 'CircleStackIcon',
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
    icon: 'CircleStackIcon',
    category: 'database',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sqlite', '--db-path', './data.db'],
    }
  },

  // APIs & Web
  {
    id: 'brave-search',
    name: 'Brave Search',
    description: 'Web search via Brave Search API',
    icon: 'MagnifyingGlassIcon',
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

  // Memory - VERIFIED WORKING
  {
    id: 'memory',
    name: 'Memory',
    description: 'Persistent memory and knowledge graph storage',
    icon: 'CircleStackIcon',
    category: 'productivity',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory'],
    }
  },

  // Sequential Thinking - VERIFIED WORKING
  {
    id: 'sequential-thinking',
    name: 'Sequential Thinking',
    description: 'Step-by-step reasoning and problem decomposition',
    icon: 'LightBulbIcon',
    category: 'productivity',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@sequentiallabs/mcp-server-sequential-thinking'],
    }
  },

  // Custom Servers
  {
    id: 'custom-stdio',
    name: 'Custom Stdio Server',
    description: 'Connect to a custom MCP server via stdio',
    icon: 'CommandLineIcon',
    category: 'custom',
    defaultConfig: {
      transportType: 'stdio',
      command: '',
      args: [],
    }
  },
  {
    id: 'custom-http',
    name: 'Custom HTTP Server',
    description: 'Connect to a custom HTTP/REST MCP server',
    icon: 'ServerIcon',
    category: 'custom',
    defaultConfig: {
      transportType: 'http',
      url: '',
    }
  },
  {
    id: 'custom-sse',
    name: 'Custom SSE Server',
    description: 'Connect to a custom Server-Sent Events MCP server',
    icon: 'ServerIcon',
    category: 'custom',
    defaultConfig: {
      transportType: 'sse',
      url: '',
    }
  },
  {
    id: 'custom-sdk',
    name: 'Custom SDK Server',
    description: 'Load an in-process SDK MCP server module',
    icon: 'CubeIcon',
    category: 'custom',
    defaultConfig: {
      transportType: 'sdk',
      serverModule: '',
    }
  },
]

export const MCP_CATEGORY_INFO: Record<string, { label: string; description: string }> = {
  filesystem: { label: 'Filesystem', description: 'Local file system access' },
  git: { label: 'Git & VCS', description: 'Version control operations' },
  database: { label: 'Databases', description: 'Database connections' },
  api: { label: 'APIs & Web', description: 'Web services and APIs' },
  cloud: { label: 'Cloud', description: 'Cloud service integrations' },
  productivity: { label: 'Productivity', description: 'Productivity tools' },
  custom: { label: 'Custom', description: 'Custom server configurations' },
}
