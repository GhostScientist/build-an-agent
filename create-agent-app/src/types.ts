/**
 * Re-export all types from shared package for backwards compatibility
 */
export * from '@agent-workshop/shared';

// CLI-specific types (not in shared package)
export interface CLIOptions {
  projectName?: string;
}

export interface DomainChoice {
  value: import('@agent-workshop/shared').AgentDomain;
  name: string;
  hint: string;
}

export interface ModelChoice {
  value: string;
  name: string;
  hint?: string;
}
