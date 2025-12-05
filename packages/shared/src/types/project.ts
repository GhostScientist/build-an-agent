/**
 * Generated project types
 */

import type { AgentConfig } from './agent.js';

export type GeneratedFileType =
  | 'typescript'
  | 'json'
  | 'markdown'
  | 'dockerfile'
  | 'yaml'
  | 'shell';

export interface GeneratedFile {
  path: string;
  content: string;
  type: GeneratedFileType;
  template: string;
}

export interface ProjectMetadata {
  generatedAt: Date;
  templateVersion: string;
  agentWorkshopVersion: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  buildInstructions: string[];
  deploymentOptions: string[];
}

export interface GeneratedProject {
  config: AgentConfig;
  files: GeneratedFile[];
  metadata: ProjectMetadata;
}
