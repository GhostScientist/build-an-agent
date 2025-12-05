/**
 * Agent template types
 */

import type { AgentDomain } from './agent.js';

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  domain: AgentDomain;
  icon: string;
  gradient: string;
  defaultTools: string[];
  samplePrompts: string[];
  codeTemplates: Record<string, string>;
  documentation: string;
}
