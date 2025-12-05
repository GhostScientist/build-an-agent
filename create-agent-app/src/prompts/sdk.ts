import Enquirer from 'enquirer';
import { getModelsForProvider } from '../data/models.js';
import type { SDKProvider } from '@agent-workshop/shared';
import { styles } from '../utils/styles.js';

const { prompt } = Enquirer;

export interface SDKAnswers {
  provider: SDKProvider;
  model: string;
}

export async function promptSDK(): Promise<SDKAnswers> {
  const providerResponse = await prompt<{ provider: SDKProvider }>({
    type: 'select',
    name: 'provider',
    message: 'Which AI provider?',
    choices: [
      {
        name: 'claude',
        message: 'Claude (Anthropic)',
        value: 'claude',
      },
      {
        name: 'openai',
        message: 'OpenAI',
        value: 'openai',
      },
    ],
    initial: 0,
  });

  const models = getModelsForProvider(providerResponse.provider);

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

  return {
    provider: providerResponse.provider,
    model: modelResponse.model,
  };
}
