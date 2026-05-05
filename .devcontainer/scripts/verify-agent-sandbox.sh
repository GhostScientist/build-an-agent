#!/usr/bin/env bash
set -euo pipefail

fail() {
  printf 'devcontainer verification failed: %s\n' "$1" >&2
  exit 1
}

[[ "$(id -un)" != "root" ]] || fail "container should run as a non-root user"

command -v node >/dev/null || fail "node is missing"
command -v npm >/dev/null || fail "npm is missing"
command -v git >/dev/null || fail "git is missing"
command -v rg >/dev/null || fail "ripgrep is missing"
command -v jq >/dev/null || fail "jq is missing"
command -v bwrap >/dev/null || fail "bubblewrap is missing"

[[ -f ".ai/security-policy.yaml" ]] || fail ".ai/security-policy.yaml is missing"
[[ -x "scripts/agent-safe" ]] || fail "scripts/agent-safe must be executable"

npm run build --workspace create-agent-app

printf 'devcontainer verification passed\n'
