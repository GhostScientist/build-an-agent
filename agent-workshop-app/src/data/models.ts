import type { SDKProvider } from '../types/agent'

// Curated examples, not a live availability or pricing catalogue.
// Keep IDs and ordering in sync with create-agent-app/src/data/models.ts.
export const modelsByProvider: Record<SDKProvider, Array<{
  id: string
  name: string
  description: string
}>> = {
  claude: [
    { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5', description: 'General-purpose starting point' },
    { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku 4.5', description: 'Smaller model for focused tasks' },
    { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1', description: 'Alternative for reasoning experiments' },
  ],
  openai: [
    { id: 'gpt-5.1', name: 'GPT-5.1', description: 'Reasoning and agentic tasks' },
    { id: 'gpt-5-mini', name: 'GPT-5 mini', description: 'Smaller model for focused tasks' },
    { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Non-reasoning model for comparison' },
  ],
  huggingface: [
    { id: 'Qwen/Qwen3-235B-A22B-Instruct-2507', name: 'Qwen 3 235B Instruct', description: 'Check tool support with your inference provider' },
    { id: 'Qwen/Qwen3-32B', name: 'Qwen 3 32B', description: 'Check tool support with your inference provider' },
    { id: 'meta-llama/Llama-3.3-70B-Instruct', name: 'Llama 3.3 70B', description: 'Check access and licensing with your inference provider' },
    { id: 'deepseek-ai/DeepSeek-R1', name: 'DeepSeek R1', description: 'Reasoning model; check tool support' },
    { id: 'deepseek-ai/DeepSeek-V3-0324', name: 'DeepSeek V3', description: 'General-purpose model; check availability' },
  ],
  copilot: [
    { id: 'auto', name: 'Auto', description: 'Use the runtime-selected model' },
    { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', description: 'Availability depends on Copilot access and policy' },
    { id: 'gpt-5', name: 'GPT-5', description: 'Availability depends on Copilot access and policy' },
    { id: 'gpt-5.4', name: 'GPT-5.4', description: 'Availability depends on Copilot access and policy' },
    { id: 'gpt-5.2-codex', name: 'GPT-5.2 Codex', description: 'Availability depends on Copilot access and policy' },
  ],
}

export const modelDocs: Record<SDKProvider, string> = {
  claude: 'https://platform.claude.com/docs/en/about-claude/models/overview',
  openai: 'https://developers.openai.com/api/docs/models',
  huggingface: 'https://huggingface.co/docs/inference-providers/index',
  copilot: 'https://docs.github.com/en/copilot/reference/ai-models/supported-models',
}
