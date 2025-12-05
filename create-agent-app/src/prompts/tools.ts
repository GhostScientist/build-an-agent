import Enquirer from 'enquirer';
import { AVAILABLE_TOOLS } from '@agent-workshop/shared';
import type { AgentTool, PermissionLevel } from '@agent-workshop/shared';
import { styles, getRiskLabel } from '../utils/styles.js';

const { prompt } = Enquirer;

export interface ToolsAnswers {
  tools: AgentTool[];
  permissions: PermissionLevel;
}

export async function promptTools(defaultToolIds: string[] = []): Promise<ToolsAnswers> {
  // First, select permission level
  const permissionResponse = await prompt<{ permissions: PermissionLevel }>({
    type: 'select',
    name: 'permissions',
    message: 'Permission level:',
    choices: [
      {
        name: 'restrictive',
        message: `Restrictive ${styles.dim('- Read-only operations only')}`,
        value: 'restrictive',
      },
      {
        name: 'balanced',
        message: `Balanced ${styles.dim('- Read + controlled writes')}`,
        value: 'balanced',
      },
      {
        name: 'permissive',
        message: `Permissive ${styles.dim('- All tools including shell commands')}`,
        value: 'permissive',
      },
    ],
    initial: 1,
  });

  // Determine initial selection based on permission level and template defaults
  const getInitialEnabled = (tool: AgentTool): boolean => {
    // If in defaultToolIds, always enable
    if (defaultToolIds.includes(tool.id)) {
      return true;
    }

    // Otherwise, base on permission level
    switch (permissionResponse.permissions) {
      case 'restrictive':
        return tool.riskLevel === 'low';
      case 'balanced':
        return tool.riskLevel === 'low' || tool.riskLevel === 'medium';
      case 'permissive':
        return true;
      default:
        return false;
    }
  };

  // Multi-select for tools
  const toolChoices = AVAILABLE_TOOLS.map(tool => ({
    name: tool.id,
    message: `${tool.name} ${styles.dim(`(${getRiskLabel(tool.riskLevel)})`)}`,
    value: tool.id,
    enabled: getInitialEnabled(tool),
  }));

  const toolsResponse = await prompt<{ tools: string[] }>({
    type: 'multiselect',
    name: 'tools',
    message: 'Enable tools (space to toggle, enter to confirm):',
    choices: toolChoices,
  } as Parameters<typeof prompt>[0]);

  // Build the tools array with enabled state
  const tools = AVAILABLE_TOOLS.map(tool => ({
    ...tool,
    enabled: toolsResponse.tools.includes(tool.id),
  }));

  return {
    tools,
    permissions: permissionResponse.permissions,
  };
}
