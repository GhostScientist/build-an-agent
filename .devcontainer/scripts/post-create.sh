#!/usr/bin/env bash
set -euo pipefail

npm ci

if [[ "${INSTALL_AGENT_CLIS:-false}" == "true" ]]; then
  npm install -g @openai/codex @anthropic-ai/claude-code @github/copilot
fi

.devcontainer/scripts/verify-agent-sandbox.sh
