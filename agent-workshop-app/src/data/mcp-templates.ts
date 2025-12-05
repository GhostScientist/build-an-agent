import { MCPServerTemplate } from '@/types/agent'

export const MCP_SERVER_TEMPLATES: MCPServerTemplate[] = [
  // Filesystem
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'Read, write, and manage files in allowed directories',
    icon: 'FolderIcon',
    category: 'filesystem',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed/dir'],
    }
  },

  // Git / Version Control
  {
    id: 'github',
    name: 'GitHub',
    description: 'GitHub repository operations, issues, and pull requests',
    icon: 'CodeBracketIcon',
    category: 'git',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: { GITHUB_TOKEN: '${GITHUB_TOKEN}' }
    }
  },
  {
    id: 'git',
    name: 'Git',
    description: 'Local Git repository operations',
    icon: 'CodeBracketIcon',
    category: 'git',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-git'],
    }
  },

  // Databases
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Query and manage PostgreSQL databases',
    icon: 'CircleStackIcon',
    category: 'database',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-postgres'],
      env: { DATABASE_URL: '${DATABASE_URL}' }
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
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-brave-search'],
      env: { BRAVE_API_KEY: '${BRAVE_API_KEY}' }
    }
  },
  {
    id: 'fetch',
    name: 'Fetch',
    description: 'Fetch and process web content',
    icon: 'GlobeAltIcon',
    category: 'api',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-fetch'],
    }
  },
  {
    id: 'puppeteer',
    name: 'Puppeteer',
    description: 'Browser automation and web scraping',
    icon: 'GlobeAltIcon',
    category: 'api',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    }
  },

  // Cloud Services
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Access and manage Google Drive files',
    icon: 'CloudIcon',
    category: 'cloud',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-gdrive'],
    }
  },
  {
    id: 'aws',
    name: 'AWS',
    description: 'Interact with AWS services',
    icon: 'CloudIcon',
    category: 'cloud',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-aws'],
      env: {
        AWS_ACCESS_KEY_ID: '${AWS_ACCESS_KEY_ID}',
        AWS_SECRET_ACCESS_KEY: '${AWS_SECRET_ACCESS_KEY}'
      }
    }
  },

  // Productivity
  {
    id: 'slack',
    name: 'Slack',
    description: 'Slack workspace integration',
    icon: 'ChatBubbleLeftRightIcon',
    category: 'productivity',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-slack'],
      env: { SLACK_TOKEN: '${SLACK_TOKEN}' }
    }
  },
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
  {
    id: 'sequential-thinking',
    name: 'Sequential Thinking',
    description: 'Step-by-step reasoning and problem decomposition',
    icon: 'LightBulbIcon',
    category: 'productivity',
    defaultConfig: {
      transportType: 'stdio',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
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
