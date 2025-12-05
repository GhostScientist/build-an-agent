/**
 * Generator-specific types
 */

import type { AgentConfig, AgentTool, AgentTemplate } from '../types/index.js';

export interface GeneratorOptions {
  verbose?: boolean;
}

export interface GeneratorContext {
  config: AgentConfig;
  template: AgentTemplate | undefined;
  enabledTools: AgentTool[];
  sanitizedClassName: string;
}

export interface FileGenerator {
  (context: GeneratorContext): string;
}
