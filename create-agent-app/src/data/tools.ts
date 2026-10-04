import type { AgentTool } from '../types.js';

export const AVAILABLE_TOOLS: AgentTool[] = [
  // File Operations (Low Risk)
  {
    id: 'read-file',
    name: 'Read File',
    description: 'Read contents of any file in the project',
    category: 'file',
    enabled: true,
    riskLevel: 'low',
  },
  {
    id: 'find-files',
    name: 'Find Files',
    description: 'Search for files using glob patterns',
    category: 'file',
    enabled: true,
    riskLevel: 'low',
  },
  {
    id: 'search-files',
    name: 'Search in Files',
    description: 'Search for text content across files',
    category: 'file',
    enabled: true,
    riskLevel: 'low',
  },

  // File Operations (Medium Risk)
  {
    id: 'write-file',
    name: 'Write File',
    description: 'Create new files with specified content',
    category: 'file',
    enabled: false,
    riskLevel: 'medium',
  },
  {
    id: 'edit-file',
    name: 'Edit File',
    description: 'Modify existing files with find-and-replace',
    category: 'file',
    enabled: false,
    riskLevel: 'medium',
  },

  // Command Execution
  {
    id: 'git-operations',
    name: 'Git Operations',
    description: 'Git commands for version control',
    category: 'command',
    enabled: false,
    riskLevel: 'medium',
  },
  {
    id: 'run-command',
    name: 'Run Command',
    description: 'Execute shell commands and scripts',
    category: 'command',
    enabled: false,
    riskLevel: 'high',
  },

  // Web Operations
  {
    id: 'web-search',
    name: 'Web Search',
    description: 'Search the web for information',
    category: 'web',
    enabled: false,
    riskLevel: 'low',
  },
  {
    id: 'web-fetch',
    name: 'Web Fetch',
    description: 'Fetch and analyze web page content',
    category: 'web',
    enabled: false,
    riskLevel: 'medium',
  },

  // Database
  {
    id: 'database-query',
    name: 'Database Query',
    description: 'Query SQL databases',
    category: 'database',
    enabled: false,
    riskLevel: 'medium',
  },

  // Integrations
  {
    id: 'api-client',
    name: 'API Client',
    description: 'Make HTTP requests to external APIs',
    category: 'integration',
    enabled: false,
    riskLevel: 'medium',
  },

  // Knowledge tools (mirrored from the web builder)
  {
    id: 'doc-ingest',
    name: 'Document Ingestion',
    description: 'Extract text from PDFs, DOCX, and text files with source capture',
    category: 'integration',
    enabled: false,
    riskLevel: 'medium',
  },
  {
    id: 'table-extract',
    name: 'Table to CSV',
    description: 'Extract tables from documents into structured CSV/JSON',
    category: 'integration',
    enabled: false,
    riskLevel: 'medium',
  },
  {
    id: 'source-notes',
    name: 'Source Notebook',
    description: 'Track sources, citations, and summaries in a local notebook',
    category: 'custom',
    enabled: false,
    riskLevel: 'medium',
  },
  {
    id: 'local-rag',
    name: 'Local Retrieval',
    description: 'Search local notes/corpus for grounded snippets (no remote calls)',
    category: 'custom',
    enabled: false,
    riskLevel: 'low',
  },
];

export function getToolById(id: string): AgentTool | undefined {
  return AVAILABLE_TOOLS.find(t => t.id === id);
}

export function getToolsByIds(ids: string[]): AgentTool[] {
  return ids
    .map(id => getToolById(id))
    .filter((t): t is AgentTool => t !== undefined);
}

export function getToolsForPermissionLevel(level: 'restrictive' | 'balanced' | 'permissive'): AgentTool[] {
  return AVAILABLE_TOOLS.map(tool => {
    let enabled = false;

    switch (level) {
      case 'restrictive':
        enabled = tool.riskLevel === 'low';
        break;
      case 'balanced':
        enabled = tool.riskLevel === 'low' || tool.riskLevel === 'medium';
        break;
      case 'permissive':
        enabled = true;
        break;
    }

    return { ...tool, enabled };
  });
}
