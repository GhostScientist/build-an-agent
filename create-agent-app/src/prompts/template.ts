import Enquirer from 'enquirer';
import { getTemplatesForDomain } from '../data/agent-templates.js';
import type { AgentDomain, AgentTemplate } from '../types.js';
import { styles } from '../utils/styles.js';

const { prompt } = Enquirer;

export async function promptTemplate(domain: AgentDomain): Promise<AgentTemplate | null> {
  const templates = getTemplatesForDomain(domain);

  const choices = [
    ...templates.map(t => ({
      name: t.id,
      message: `${t.name} ${styles.dim(`- ${t.description}`)}`,
      value: t.id,
    })),
    {
      name: 'scratch',
      message: `${styles.dim('Start from scratch')}`,
      value: 'scratch',
    },
  ];

  const response = await prompt<{ template: string }>({
    type: 'select',
    name: 'template',
    message: 'Select a template:',
    choices,
    initial: 0,
  });

  if (response.template === 'scratch') {
    return null;
  }

  return templates.find(t => t.id === response.template) || null;
}
