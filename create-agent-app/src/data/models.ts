import type { SDKProvider, ModelChoice } from '../types.js';

export const CLAUDE_MODELS: ModelChoice[] = [
  {
    value: 'claude-sonnet-4-5-20250929',
    name: 'Claude Sonnet 4.5',
    hint: 'recommended',
  },
  {
    value: 'claude-haiku-4-5-20251001',
    name: 'Claude Haiku 4.5',
    hint: 'faster',
  },
  {
    value: 'claude-opus-4-1-20250805',
    name: 'Claude Opus 4.1',
    hint: 'reasoning experiments',
  },
];

export const OPENAI_MODELS: ModelChoice[] = [
  {
    value: 'gpt-5.1',
    name: 'GPT-5.1',
    hint: 'recommended',
  },
  {
    value: 'gpt-5-mini',
    name: 'GPT-5 mini',
    hint: 'faster',
  },
  {
    value: 'gpt-4.1',
    name: 'GPT-4.1',
    hint: 'non-reasoning comparison',
  },
];

export const HUGGINGFACE_MODELS: ModelChoice[] = [
  {
    value: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
    name: 'Qwen 3 235B Instruct',
    hint: 'recommended',
  },
  {
    value: 'Qwen/Qwen3-32B',
    name: 'Qwen 3 32B',
    hint: 'fast',
  },
  {
    value: 'meta-llama/Llama-3.3-70B-Instruct',
    name: 'Llama 3.3 70B',
    hint: 'open source',
  },
  {
    value: 'deepseek-ai/DeepSeek-R1',
    name: 'DeepSeek R1',
    hint: 'reasoning',
  },
  {
    value: 'deepseek-ai/DeepSeek-V3-0324',
    name: 'DeepSeek V3',
    hint: 'general purpose',
  },
];

export const COPILOT_MODELS: ModelChoice[] = [
  {
    value: 'auto',
    name: 'Auto',
    hint: 'recommended - runtime picks the best model',
  },
  {
    value: 'claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    hint: 'balanced coding model',
  },
  {
    value: 'gpt-5',
    name: 'GPT-5',
    hint: 'frontier reasoning',
  },
  {
    value: 'gpt-5.4',
    name: 'GPT-5.4',
    hint: 'check Copilot availability',
  },
  {
    value: 'gpt-5.2-codex',
    name: 'GPT-5.2 Codex',
    hint: 'long-running coding tasks',
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
    case 'copilot':
      return COPILOT_MODELS;
    default:
      return CLAUDE_MODELS;
  }
}

export function getDefaultModel(provider: SDKProvider): string {
  const models = getModelsForProvider(provider);
  return models[0].value;
}
