import type { DomainChoice } from '../types.js';

export const DOMAINS: DomainChoice[] = [
  {
    value: 'development',
    name: 'Development',
    hint: 'Code review, testing, debugging, modernization',
  },
  {
    value: 'business',
    name: 'Business',
    hint: 'Document processing, reports, data entry',
  },
  {
    value: 'creative',
    name: 'Creative',
    hint: 'Content creation, copywriting, social media',
  },
  {
    value: 'data',
    name: 'Data',
    hint: 'Analysis, visualization, ML pipelines',
  },
  {
    value: 'knowledge',
    name: 'Knowledge',
    hint: 'Research, literature review, citations',
  },
];
