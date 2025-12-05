/**
 * Domain definitions
 */

import type { AgentDomain } from '../types/index.js';

export interface DomainInfo {
  value: AgentDomain;
  name: string;
  description: string;
  hint: string;
  icon: string;
  gradient: string;
}

export const DOMAINS: DomainInfo[] = [
  {
    value: 'development',
    name: 'Development',
    description: 'Build coding assistants for software development',
    hint: 'Code review, testing, debugging, modernization',
    icon: 'CodeBracketIcon',
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    value: 'business',
    name: 'Business',
    description: 'Automate business workflows and document processing',
    hint: 'Document processing, reports, data entry',
    icon: 'CogIcon',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    value: 'creative',
    name: 'Creative',
    description: 'Generate content, copy, and creative assets',
    hint: 'Content writing, social media, copywriting',
    icon: 'RocketLaunchIcon',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    value: 'data',
    name: 'Data',
    description: 'Analyze data and build data pipelines',
    hint: 'Analysis, visualization, ML pipelines',
    icon: 'ChartBarIcon',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    value: 'knowledge',
    name: 'Knowledge',
    description: 'Research, synthesize, and manage knowledge',
    hint: 'Research, literature review, citations',
    icon: 'BookOpenIcon',
    gradient: 'from-amber-500 to-orange-600',
  },
];

/**
 * Get domain info by value
 */
export function getDomainInfo(domain: AgentDomain): DomainInfo | undefined {
  return DOMAINS.find((d) => d.value === domain);
}
