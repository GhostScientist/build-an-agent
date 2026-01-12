import Enquirer from 'enquirer';
import { HUGGINGFACE_MODELS } from '../data/models.js';
import { MCP_SERVER_TEMPLATES, MCP_CATEGORY_LABELS, POPULAR_MCP_SERVERS } from '../data/mcp-templates.js';
import type { MCPServer, MCPStdioServer, MCPHttpServer, MCPSseServer } from '../types.js';
import { styles } from '../utils/styles.js';

const { prompt } = Enquirer;

export interface HuggingFaceWizardResult {
  name: string;
  description: string;
  model: string;
  mcpServers: MCPServer[];
}

/**
 * Step 1: Agent name and description
 */
async function promptAgentInfo(): Promise<{ name: string; description: string }> {
  const response = await prompt<{ name: string; description: string }>([
    {
      type: 'input',
      name: 'name',
      message: 'Agent name:',
      initial: 'My Agent',
      validate: (value: string) => {
        if (!value.trim()) return 'Name is required';
        if (value.length > 50) return 'Name must be 50 characters or less';
        return true;
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'Agent description:',
      initial: 'A helpful AI assistant',
      validate: (value: string) => {
        if (!value.trim()) return 'Description is required';
        return true;
      },
    },
  ]);

  return response;
}

/**
 * Step 2: Model selection from HuggingFace models
 */
async function promptModelSelection(): Promise<string> {
  const response = await prompt<{ model: string }>({
    type: 'select',
    name: 'model',
    message: 'Select HuggingFace model:',
    choices: HUGGINGFACE_MODELS.map(m => ({
      name: m.value,
      message: m.hint ? `${m.name} ${styles.dim(`(${m.hint})`)}` : m.name,
      value: m.value,
    })),
    initial: 0,
  });

  return response.model;
}

/**
 * Step 3: Quick-add MCP servers with multiselect
 */
async function promptMCPServers(): Promise<MCPServer[]> {
  // First, ask if user wants to add MCP servers
  const addServersResponse = await prompt<{ addServers: boolean }>({
    type: 'confirm',
    name: 'addServers',
    message: 'Add MCP servers for extended capabilities?',
    initial: true,
  });

  if (!addServersResponse.addServers) {
    return [];
  }

  // Get popular templates first, then others
  const popularTemplates = MCP_SERVER_TEMPLATES.filter(t => POPULAR_MCP_SERVERS.includes(t.id));
  const otherTemplates = MCP_SERVER_TEMPLATES.filter(t => !POPULAR_MCP_SERVERS.includes(t.id));
  const allTemplates = [...popularTemplates, ...otherTemplates];

  // Create choices with category grouping hints
  const choices = allTemplates.map(template => {
    const categoryLabel = MCP_CATEGORY_LABELS[template.category] || template.category;
    let hint = categoryLabel;

    if (template.requiresInput) {
      hint += ' - requires API key';
    } else if (template.requiresConfiguration) {
      hint += ' - configure after setup';
    } else {
      hint += ' - ready to use';
    }

    return {
      name: template.id,
      message: `${template.name} ${styles.dim(`(${hint})`)}`,
      value: template.id,
    };
  });

  const serversResponse = await prompt<{ servers: string[] }>({
    type: 'multiselect',
    name: 'servers',
    message: 'Select MCP servers (space to toggle, enter to confirm):',
    choices,
    hint: 'Use arrow keys to navigate',
  } as Parameters<typeof prompt>[0]);

  // Convert selected template IDs to MCPServer objects
  const selectedServers: MCPServer[] = [];

  for (const serverId of serversResponse.servers) {
    const template = MCP_SERVER_TEMPLATES.find(t => t.id === serverId);
    if (!template) continue;

    const config = template.defaultConfig;

    if (config.transportType === 'stdio') {
      const server: MCPStdioServer = {
        id: template.id,
        name: template.name,
        description: template.description,
        transportType: 'stdio',
        command: config.command || '',
        args: config.args || [],
        enabled: true,
      };

      if (config.env) {
        server.env = config.env;
      }

      selectedServers.push(server);
    } else if (config.transportType === 'http') {
      const server: MCPHttpServer = {
        id: template.id,
        name: template.name,
        description: template.description,
        transportType: 'http',
        url: config.url || '',
        enabled: true,
      };

      selectedServers.push(server);
    } else if (config.transportType === 'sse') {
      const server: MCPSseServer = {
        id: template.id,
        name: template.name,
        description: template.description,
        transportType: 'sse',
        url: config.url || '',
        enabled: true,
      };

      selectedServers.push(server);
    }
  }

  // Show post-setup notes for servers that need configuration
  const needsConfig = selectedServers.filter(s => {
    const template = MCP_SERVER_TEMPLATES.find(t => t.id === s.id);
    return template?.requiresInput || template?.requiresConfiguration;
  });

  if (needsConfig.length > 0) {
    console.log();
    console.log(styles.warning('  Note: Some servers need additional configuration:'));
    for (const server of needsConfig) {
      const template = MCP_SERVER_TEMPLATES.find(t => t.id === server.id);
      if (template?.requiresInput) {
        console.log(styles.dim(`    - ${server.name}: Set ${template.inputDescription} in agent.json`));
      } else if (template?.requiresConfiguration) {
        console.log(styles.dim(`    - ${server.name}: ${template.configurationNote}`));
      }
    }
    console.log();
  }

  return selectedServers;
}

/**
 * Main wizard function - runs all 3 steps
 */
export async function runHuggingFaceWizard(): Promise<HuggingFaceWizardResult> {
  console.log();
  console.log(styles.brand('  HuggingFace Tiny-Agent Setup'));
  console.log(styles.dim('  Lightweight agent, no build step needed'));
  console.log();

  // Step 1: Name and description
  const { name, description } = await promptAgentInfo();

  // Step 2: Model selection
  const model = await promptModelSelection();

  // Step 3: MCP servers
  const mcpServers = await promptMCPServers();

  return {
    name,
    description,
    model,
    mcpServers,
  };
}
