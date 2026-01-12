import Enquirer from 'enquirer';
import { getModelsForProvider } from '../data/models.js';
import type { SDKProvider } from '../types.js';
import { styles } from '../utils/styles.js';

const { prompt } = Enquirer;

export interface SDKAnswers {
  provider: SDKProvider;
  model: string;
}

/**
 * Prompt for provider only (used for early branching in wizard flow)
 */
export async function promptProviderOnly(): Promise<{ provider: SDKProvider }> {
  const providerResponse = await prompt<{ provider: SDKProvider }>({
    type: 'select',
    name: 'provider',
    message: 'Which AI provider?',
    choices: [
      {
        name: 'claude',
        message: `Claude (Anthropic) ${styles.dim('- Full TypeScript app')}`,
        value: 'claude',
      },
      {
        name: 'openai',
        message: `OpenAI ${styles.dim('- Full TypeScript app')}`,
        value: 'openai',
      },
      {
        name: 'huggingface',
        message: `HuggingFace Tiny Agents ${styles.dim('- Lightweight, instant run')}`,
        value: 'huggingface',
      },
    ],
    initial: 0,
  });

  return { provider: providerResponse.provider };
}

/**
 * Prompt for model only (when provider is already known)
 */
export async function promptModelForProvider(provider: SDKProvider): Promise<string> {
  const models = getModelsForProvider(provider);

  const modelResponse = await prompt<{ model: string }>({
    type: 'select',
    name: 'model',
    message: 'Select model:',
    choices: models.map(m => ({
      name: m.value,
      message: m.hint ? `${m.name} ${styles.dim(`(${m.hint})`)}` : m.name,
      value: m.value,
    })),
    initial: 0,
  });

  return modelResponse.model;
}

/**
 * Combined prompt for provider and model (original function, kept for backwards compatibility)
 */
export async function promptSDK(): Promise<SDKAnswers> {
  const { provider } = await promptProviderOnly();
  const model = await promptModelForProvider(provider);

  return {
    provider,
    model,
  };
}
