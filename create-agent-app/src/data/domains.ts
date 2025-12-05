/**
 * Re-export from shared package for backwards compatibility
 */
export { DOMAINS, getDomainInfo, type DomainInfo } from '@agent-workshop/shared';

// Alias for backwards compatibility
export type DomainChoice = import('@agent-workshop/shared').DomainInfo;
