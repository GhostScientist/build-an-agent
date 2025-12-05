/**
 * Re-export all types and data from shared package
 */
export * from '@agent-workshop/shared';

// React-specific types that aren't in the shared package
export interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
  validation?: (config: Partial<import('@agent-workshop/shared').AgentConfig>) => string[];
  isComplete: (config: Partial<import('@agent-workshop/shared').AgentConfig>) => boolean;
}
