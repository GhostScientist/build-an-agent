/**
 * Data exports for @agent-workshop/shared
 */

// Tools
export {
  AVAILABLE_TOOLS,
  KNOWLEDGE_TOOL_IDS,
  getToolById,
  getToolsByIds,
  getToolsForPermissionLevel,
  getToolsByCategory,
  getEnabledTools,
} from './tools.js';

// Templates
export {
  AGENT_TEMPLATES,
  getTemplatesForDomain,
  getTemplateById,
} from './templates.js';

// Domains
export type { DomainInfo } from './domains.js';
export { DOMAINS, getDomainInfo } from './domains.js';
