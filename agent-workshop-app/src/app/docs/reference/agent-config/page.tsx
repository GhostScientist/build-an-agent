'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { CodeBlock } from '@/components/docs/CodeBlock';

export default function AgentConfigPage() {
  return (
    <DocsLayout
      title="AgentConfig Schema"
      description="Complete reference for the AgentConfig type."
    >
      <p>
        The <code>AgentConfig</code> interface defines all configuration options
        for generated agents. This reference documents every field.
      </p>

      <h2>Full Type Definition</h2>

      <CodeBlock
        language="typescript"
        code={`interface AgentConfig {
  // Basic Information
  name: string;
  description: string;
  domain: AgentDomain;
  templateId?: string;

  // AI Provider
  sdkProvider: SDKProvider;
  model?: string;

  // Capabilities
  tools: AgentTool[];
  mcpServers: MCPServer[];
  customInstructions: string;

  // Advanced Settings
  permissions: PermissionLevel;
  maxTokens?: number;
  temperature?: number;

  // Project Output
  projectName: string;
  packageName: string;
  version: string;
  author: string;
  license: string;
  repository?: string;
}`}
      />

      <h2>Field Reference</h2>

      <h3>Basic Information</h3>

      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>name</code></td>
            <td>string</td>
            <td>Yes</td>
            <td>Display name for the agent</td>
          </tr>
          <tr>
            <td><code>description</code></td>
            <td>string</td>
            <td>Yes</td>
            <td>Brief description of the agent&apos;s purpose</td>
          </tr>
          <tr>
            <td><code>domain</code></td>
            <td>AgentDomain</td>
            <td>Yes</td>
            <td>Agent&apos;s area of expertise</td>
          </tr>
          <tr>
            <td><code>templateId</code></td>
            <td>string</td>
            <td>No</td>
            <td>ID of selected template</td>
          </tr>
        </tbody>
      </table>

      <h4>AgentDomain</h4>
      <CodeBlock
        language="typescript"
        code={`type AgentDomain =
  | 'development'
  | 'business'
  | 'creative'
  | 'data'
  | 'knowledge';`}
      />

      <h3>AI Provider</h3>

      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>sdkProvider</code></td>
            <td>SDKProvider</td>
            <td>Yes</td>
            <td>AI provider (claude or openai)</td>
          </tr>
          <tr>
            <td><code>model</code></td>
            <td>string</td>
            <td>No</td>
            <td>Specific model ID</td>
          </tr>
        </tbody>
      </table>

      <p>
        <strong>Note:</strong> API keys are configured via environment variables
        (<code>ANTHROPIC_API_KEY</code> or <code>OPENAI_API_KEY</code>) when
        running the generated agent.
      </p>

      <h4>SDKProvider</h4>
      <CodeBlock
        language="typescript"
        code={`type SDKProvider = 'claude' | 'openai';`}
      />

      <h3>Capabilities</h3>

      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>tools</code></td>
            <td>AgentTool[]</td>
            <td>Yes</td>
            <td>Enabled tools</td>
          </tr>
          <tr>
            <td><code>mcpServers</code></td>
            <td>MCPServer[]</td>
            <td>Yes</td>
            <td>MCP server configurations</td>
          </tr>
          <tr>
            <td><code>customInstructions</code></td>
            <td>string</td>
            <td>No</td>
            <td>Additional system prompt instructions</td>
          </tr>
        </tbody>
      </table>

      <h4>AgentTool</h4>
      <CodeBlock
        language="typescript"
        code={`interface AgentTool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  enabled: boolean;
}

type ToolCategory =
  | 'file'
  | 'command'
  | 'web'
  | 'database'
  | 'integration'
  | 'custom';`}
      />

      <h4>MCPServer</h4>
      <CodeBlock
        language="typescript"
        code={`type MCPServer =
  | MCPStdioServer
  | MCPHttpServer
  | MCPSseServer
  | MCPSdkServer;

interface MCPStdioServer {
  id: string;
  name: string;
  transportType: 'stdio';
  command: string;
  args?: string[];
  env?: Record<string, string>;
  enabled: boolean;
}

interface MCPHttpServer {
  id: string;
  name: string;
  transportType: 'http';
  url: string;
  headers?: Record<string, string>;
  enabled: boolean;
}

interface MCPSseServer {
  id: string;
  name: string;
  transportType: 'sse';
  url: string;
  headers?: Record<string, string>;
  enabled: boolean;
}

interface MCPSdkServer {
  id: string;
  name: string;
  transportType: 'sdk';
  serverModule: string;
  enabled: boolean;
}`}
      />

      <h3>Advanced Settings</h3>

      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>permissions</code></td>
            <td>PermissionLevel</td>
            <td>balanced</td>
            <td>Tool permission level</td>
          </tr>
          <tr>
            <td><code>maxTokens</code></td>
            <td>number</td>
            <td>4096</td>
            <td>Max response tokens (1000-8000)</td>
          </tr>
          <tr>
            <td><code>temperature</code></td>
            <td>number</td>
            <td>0.7</td>
            <td>Response randomness (0.0-1.0)</td>
          </tr>
        </tbody>
      </table>

      <h4>PermissionLevel</h4>
      <CodeBlock
        language="typescript"
        code={`type PermissionLevel =
  | 'restrictive'
  | 'balanced'
  | 'permissive';`}
      />

      <h3>Project Output</h3>

      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Type</th>
            <th>Required</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>projectName</code></td>
            <td>string</td>
            <td>Yes</td>
            <td>Directory name</td>
          </tr>
          <tr>
            <td><code>packageName</code></td>
            <td>string</td>
            <td>Yes</td>
            <td>npm package name</td>
          </tr>
          <tr>
            <td><code>version</code></td>
            <td>string</td>
            <td>Yes</td>
            <td>Semantic version</td>
          </tr>
          <tr>
            <td><code>author</code></td>
            <td>string</td>
            <td>Yes</td>
            <td>Author name</td>
          </tr>
          <tr>
            <td><code>license</code></td>
            <td>string</td>
            <td>Yes</td>
            <td>License identifier</td>
          </tr>
          <tr>
            <td><code>repository</code></td>
            <td>string</td>
            <td>No</td>
            <td>Git repository URL</td>
          </tr>
        </tbody>
      </table>
    </DocsLayout>
  );
}
