'use client';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { Callout } from '@/components/docs/Callout';
import { modelsByProvider, modelDocs } from '@/data/models';

export default function SDKConfigurationPage() {
  return (
    <DocsLayout
      title="SDK Configuration"
      description="Compare generated capabilities, authentication, and model choices."
    >
      <p>
        Agent Workshop supports four runtimes. These model examples are shared with the web
        selector and mirrored in the CLI, not a live provider catalogue. Check current access,
        pricing, context limits, and tool support before running. To use another model, edit
        the generated agent source (or agent.json for Tiny Agents).
      </p>
      {Object.entries(modelsByProvider).map(([provider, models]) => (
        <section key={provider}>
          <h2>{provider === 'claude' ? 'Claude' : provider === 'openai' ? 'OpenAI' : provider === 'copilot' ? 'GitHub Copilot' : 'HuggingFace'} model examples</h2>
          <ul>
            {models.map(model => (
              <li key={model.id}><strong>{model.name}</strong>: <code>{model.id}</code></li>
            ))}
          </ul>
          <a href={modelDocs[provider as keyof typeof modelDocs]} target="_blank" rel="noopener noreferrer">
            Check current provider documentation
          </a>
        </section>
      ))}

      <h2>Claude Agent SDK (Recommended)</h2>
      <p>
        The Claude Agent SDK is Anthropic&apos;s official framework for building AI agents.
        It&apos;s the recommended choice for most use cases.
      </p>

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

      <h3>Advantages</h3>
      <ul>
        <li>Official OpenAI agent framework</li>
        <li>Advanced function calling</li>
        <li>The generated adapter currently displays the completed response; it does not stream tokens</li>
        <li>Wide ecosystem compatibility</li>
      </ul>

      <h3>Setup Requirements</h3>
      <ol>
        <li>Create an account at <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">platform.openai.com</a></li>
        <li>Generate an API key</li>
        <li>Set <code>OPENAI_API_KEY</code> in your <code>.env</code> file</li>
      </ol>
      <Callout type="warning" title="OpenAI MCP integration needs implementation">
        <p>
          The scaffold writes MCP configuration and management commands, but the OpenAI
          adapter does not connect those servers to the agent. Add the SDK&apos;s MCP
          connection and cleanup lifecycle before relying on external MCP tools.
        </p>
      </Callout>

      <h2>GitHub Copilot SDK</h2>
      <p>
        The <code>@github/copilot-sdk</code> package drives the same agent runtime as
        Copilot CLI. The scaffold supports an existing CLI login or a GitHub token with
        Copilot access. Organization policies and usage limits apply; subscription access
        does not mean unlimited free inference.
      </p>

      <p>
        The exact model list depends on your subscription. Call <code>client.listModels()</code>
        at runtime for the authoritative list.
      </p>

      <h3>Advantages</h3>
      <ul>
        <li>No API key &mdash; uses your GitHub Copilot subscription</li>
        <li>Built-in file, search and shell tools provided by the runtime</li>
        <li>Automatically reads <code>.github/copilot-instructions.md</code>, <code>AGENTS.md</code> and <code>CLAUDE.md</code></li>
        <li>Bundles the Copilot CLI &mdash; no separate runtime install</li>
      </ul>

      <h3>Setup Requirements</h3>
      <ol>
        <li>An active GitHub Copilot subscription</li>
        <li>A supported Node.js version matching the generated package.json</li>
        <li>
          Sign in once with <code>npx @github/copilot</code>, or set a GitHub token with
          Copilot access (<code>GITHUB_TOKEN</code>, <code>GH_TOKEN</code>, or{' '}
          <code>COPILOT_GITHUB_TOKEN</code>)
        </li>
      </ol>

      <Callout type="warning" title="Copilot uses built-in tools">
        <p>
          Copilot agents do not generate <code>file-operations.ts</code>,{' '}
          <code>command-runner.ts</code> or <code>web-tools.ts</code>. The runtime&apos;s own
          tools do that work. Tools you leave disabled in the wizard are excluded from the
          session and denied at the permission layer, so your permission policy still applies.
        </p>
      </Callout>

      <h2>HuggingFace tiny-agents</h2>
      <p>
        This path generates <code>agent.json</code> and <code>PROMPT.md</code> plus setup files,
        not the TypeScript project described above. The tiny-agents runtime loads tools from
        configured MCP servers. Set <code>HF_TOKEN</code> for hosted inference, or configure
        an appropriate local/OpenAI-compatible endpoint. Check model tool support and any
        additional MCP credentials.
      </p>
      <p>
        No local build does not mean no dependencies: npx downloads the runtime, MCP
        servers may start local processes, and hosted inference may be billed. This path
        does not include the generated TypeScript permission manager or slash workflows.
      </p>

      <Callout type="info" title="Which should I choose?">
        <p>
          Claude, OpenAI and Copilot produce similar project structures, not identical runtime behavior.
          Choose based on:
        </p>
        <ul className="mt-2 list-disc list-inside">
          <li>Your preferred AI provider</li>
          <li>Existing API keys or subscriptions you have</li>
          <li>Specific model capabilities you need</li>
          <li>Pricing considerations &mdash; Copilot is billed through your existing subscription</li>
        </ul>
      </Callout>

      <h2>Model-specific Settings</h2>
      <p>
        The scaffold does not apply temperature or output-token controls. Configure these
        in the generated SDK call only after checking model support. Some reasoning models
        do not accept temperature, and reasoning budgets differ from output-token limits.
        No sampling setting guarantees deterministic or correct answers.
      </p>
      <Callout type="tip" title="Evaluate changes, do not assume improvements">
        <p>
          Run a fixed set of tasks before and after changing a model or setting. Compare
          correctness, denied actions, latency, and provider-reported usage. Inspect the
          generated adapter rather than assuming every upstream SDK feature is enabled.
        </p>
      </Callout>
    </DocsLayout>
  );
}
