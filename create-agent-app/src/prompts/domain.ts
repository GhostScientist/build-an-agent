import Enquirer from 'enquirer';
import { DOMAINS } from '@agent-workshop/shared';
import type { AgentDomain } from '@agent-workshop/shared';
import { styles } from '../utils/styles.js';

const { prompt } = Enquirer;

export async function promptDomain(): Promise<AgentDomain> {
  const response = await prompt<{ domain: AgentDomain }>({
    type: 'select',
    name: 'domain',
    message: 'What domain is your agent for?',
    choices: DOMAINS.map(d => ({
      name: d.value,
      message: `${d.name} ${styles.dim(`- ${d.hint}`)}`,
      value: d.value,
    })),
    initial: 0,
  });

  return response.domain;
}
