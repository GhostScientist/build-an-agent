/**
 * Available agent tools
 */

import type { AgentTool, PermissionLevel } from '../types/index.js';

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

  // Knowledge & Research
  {
    id: 'doc-ingest',
    name: 'Document Ingestion',
    description: 'Extract text from PDFs, DOCX, and text files with source capture',
    category: 'integration',
    enabled: false,
    riskLevel: 'low',
  },
  {
    id: 'table-extract',
    name: 'Table to CSV',
    description: 'Extract tables from documents into structured CSV/JSON',
    category: 'integration',
    enabled: false,
    riskLevel: 'low',
  },
  {
    id: 'source-notes',
    name: 'Source Notebook',
    description: 'Track sources, citations, and summaries in a local notebook',
    category: 'custom',
    enabled: false,
    riskLevel: 'low',
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

/**
 * Knowledge-specific tool IDs
 */
export const KNOWLEDGE_TOOL_IDS = ['doc-ingest', 'table-extract', 'source-notes', 'local-rag'];

/**
 * Get a tool by ID
 */
export function getToolById(id: string): AgentTool | undefined {
  return AVAILABLE_TOOLS.find((t) => t.id === id);
}

/**
 * Get multiple tools by their IDs
 */
export function getToolsByIds(ids: string[]): AgentTool[] {
  return ids.map((id) => getToolById(id)).filter((t): t is AgentTool => t !== undefined);
}

/**
 * Get tools enabled for a specific permission level
 */
export function getToolsForPermissionLevel(level: PermissionLevel): AgentTool[] {
  return AVAILABLE_TOOLS.map((tool) => {
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

/**
 * Get tools grouped by category
 */
export function getToolsByCategory(tools: AgentTool[]): Record<string, AgentTool[]> {
  return tools.reduce(
    (acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    },
    {} as Record<string, AgentTool[]>
  );
}

/**
 * Get only enabled tools from a list
 */
export function getEnabledTools(tools: AgentTool[]): AgentTool[] {
  return tools.filter((tool) => tool.enabled);
}
