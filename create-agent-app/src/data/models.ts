import type { SDKProvider, ModelChoice } from '../types.js';

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

export const HUGGINGFACE_MODELS: ModelChoice[] = [
  {
    value: 'Qwen/Qwen2.5-72B-Instruct',
    name: 'Qwen 2.5 72B',
    hint: 'recommended',
  },
  {
    value: 'Qwen/Qwen3-235B-A22B',
    name: 'Qwen 3 235B',
    hint: 'most capable',
  },
  {
    value: 'meta-llama/Llama-3.3-70B-Instruct',
    name: 'Llama 3.3 70B',
    hint: 'open source',
  },
  {
    value: 'mistralai/Mistral-Small-24B-Instruct-2501',
    name: 'Mistral Small 24B',
    hint: 'efficient',
  },
  {
    value: 'deepseek-ai/DeepSeek-R1',
    name: 'DeepSeek R1',
    hint: 'reasoning',
  },
];

export function getModelsForProvider(provider: SDKProvider): ModelChoice[] {
  switch (provider) {
    case 'claude':
      return CLAUDE_MODELS;
    case 'openai':
      return OPENAI_MODELS;
    case 'huggingface':
      return HUGGINGFACE_MODELS;
    default:
      return CLAUDE_MODELS;
  }
}

export function getDefaultModel(provider: SDKProvider): string {
  const models = getModelsForProvider(provider);
  return models[0].value;
}
