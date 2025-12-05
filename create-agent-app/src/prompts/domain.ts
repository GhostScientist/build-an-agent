import Enquirer from 'enquirer';
import { DOMAINS } from '../data/domains.js';
import type { AgentDomain } from '../types.js';
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
