import type { SDKProvider } from '@agent-workshop/shared';

// CLI-specific type for model selection UI
export interface ModelChoice {
  value: string;
  name: string;
  hint?: string;
}

export const CLAUDE_MODELS: ModelChoice[] = [
  {
    value: 'claude-sonnet-4-5-20250514',
    name: 'Claude Sonnet 4.5',
    hint: 'recommended',
  },
  {
    value: 'claude-haiku-4-5-20250514',
    name: 'Claude Haiku 4.5',
    hint: 'faster',
  },
  {
    value: 'claude-opus-4-20250514',
    name: 'Claude Opus 4',
    hint: 'most capable',
  },
];

export const OPENAI_MODELS: ModelChoice[] = [
  {
    value: 'gpt-4.1-2025-04-14',
    name: 'GPT-4.1',
    hint: 'recommended',
  },
  {
    value: 'gpt-4.1-mini-2025-04-14',
    name: 'GPT-4.1 Mini',
    hint: 'faster',
  },
  {
    value: 'gpt-4.1-nano-2025-04-14',
    name: 'GPT-4.1 Nano',
    hint: 'lightweight',
  },
];

export function getModelsForProvider(provider: SDKProvider): ModelChoice[] {
  return provider === 'claude' ? CLAUDE_MODELS : OPENAI_MODELS;
}

export function getDefaultModel(provider: SDKProvider): string {
  const models = getModelsForProvider(provider);
  return models[0].value;
}
