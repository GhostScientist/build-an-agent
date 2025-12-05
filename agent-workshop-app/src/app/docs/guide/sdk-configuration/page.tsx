'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { Callout } from '@/components/docs/Callout';

export default function SDKConfigurationPage() {
  return (
    <DocsLayout
      title="SDK Configuration"
      description="Step 3: Select your AI provider and model."
    >
      <p>
        Agent Workshop supports two AI providers. Each has different strengths,
        pricing, and model options.
      </p>

      <h2>Claude Agent SDK (Recommended)</h2>
      <p>
        The Claude Agent SDK is Anthropic&apos;s official framework for building AI agents.
        It&apos;s the recommended choice for most use cases.
      </p>

      <h3>Available Models</h3>
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Context</th>
            <th>Pricing (Input/Output)</th>
            <th>Best For</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Claude Sonnet 4.5</strong></td>
            <td>200K tokens</td>
            <td>$3 / $15 per million</td>
            <td>General use, best balance of cost and capability</td>
          </tr>
          <tr>
            <td><strong>Claude Haiku 4.5</strong></td>
            <td>200K tokens</td>
            <td>$1 / $5 per million</td>
            <td>Fast, cost-effective tasks</td>
          </tr>
          <tr>
            <td><strong>Claude Opus 4.1</strong></td>
            <td>200K tokens</td>
            <td>$15 / $75 per million</td>
            <td>Complex reasoning, highest capability</td>
          </tr>
        </tbody>
      </table>

      <h3>Advantages</h3>
      <ul>
        <li>Native streaming support for real-time responses</li>
        <li>Built-in file operation tools</li>
        <li>Optimized for agentic workflows</li>
        <li>Simple setup process</li>
      </ul>

      <h3>Setup Requirements</h3>
      <ol>
        <li>Create an account at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">console.anthropic.com</a></li>
        <li>Generate an API key</li>
        <li>Set <code>ANTHROPIC_API_KEY</code> in your <code>.env</code> file</li>
      </ol>

      <h2>OpenAI Agents SDK</h2>
      <p>
        The OpenAI Agents SDK provides agent capabilities with function calling and tool use.
      </p>

      <h3>Available Models</h3>
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Context</th>
            <th>Best For</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>GPT-5.1</strong></td>
            <td>128K tokens</td>
            <td>Latest capabilities, general use</td>
          </tr>
          <tr>
            <td><strong>GPT-5 mini</strong></td>
            <td>128K tokens</td>
            <td>Cost-effective, faster responses</td>
          </tr>
          <tr>
            <td><strong>GPT-4.1</strong></td>
            <td>128K tokens</td>
            <td>Stable, well-tested</td>
          </tr>
        </tbody>
      </table>

      <h3>Advantages</h3>
      <ul>
        <li>Official OpenAI agent framework</li>
        <li>Advanced function calling</li>
        <li>Streaming support</li>
        <li>Wide ecosystem compatibility</li>
      </ul>

      <h3>Setup Requirements</h3>
      <ol>
        <li>Create an account at <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">platform.openai.com</a></li>
        <li>Generate an API key</li>
        <li>Set <code>OPENAI_API_KEY</code> in your <code>.env</code> file</li>
      </ol>

      <Callout type="info" title="Which should I choose?">
        <p>
          Both providers produce functionally similar agents. Choose based on:
        </p>
        <ul className="mt-2 list-disc list-inside">
          <li>Your preferred AI provider</li>
          <li>Existing API keys you have</li>
          <li>Specific model capabilities you need</li>
          <li>Pricing considerations</li>
        </ul>
      </Callout>

      <h2>Advanced Settings</h2>

      <h3>Max Tokens</h3>
      <p>
        Controls the maximum length of agent responses. Range: 1,000 - 8,000 tokens.
        Default: 4,096 tokens.
      </p>
      <ul>
        <li><strong>Lower values (1,000-2,000)</strong> - Concise responses, faster, cheaper</li>
        <li><strong>Higher values (6,000-8,000)</strong> - Detailed responses, better for complex tasks</li>
      </ul>

      <h3>Temperature</h3>
      <p>
        Controls response randomness. Range: 0.0 - 1.0. Default: 0.7.
      </p>
      <ul>
        <li><strong>Lower values (0.0-0.3)</strong> - Deterministic, consistent, best for code/analysis</li>
        <li><strong>Higher values (0.7-1.0)</strong> - Creative, varied, best for content generation</li>
      </ul>

      <Callout type="tip" title="Recommended settings">
        <p>
          For most agent use cases, the defaults work well. Consider lowering temperature
          to 0.3 for code-focused agents where consistency matters.
        </p>
      </Callout>
    </DocsLayout>
  );
}
