# DevContainers for Agentic Engineering

This guide is a step-by-step series for adding a Podman-friendly DevContainer to a project and using agentic CLI tools inside it with policy-driven safety controls.

The working model is simple:

1. Put the development toolchain in a container.
2. Run the container with Podman, preferably rootless.
3. Keep secrets and host-level sockets out of the container.
4. Use checked-in policy to constrain Claude Code, Codex CLI, and GitHub Copilot CLI.
5. Make agents work on branches, then review diffs and run tests before publishing.

## Planned Series

1. [Glossary](./00-glossary.md)
2. Why DevContainers help with AI agents
3. Install and configure Podman
4. Add a DevContainer to any project
5. Install agent CLIs safely
6. Policy-driven agent security
7. Daily workflow
8. Maintenance
9. Troubleshooting

## Primary References

- [Dev Container Specification](https://containers.dev/implementors/json_reference/)
- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [VS Code with Podman](https://code.visualstudio.com/remote/advancedcontainers/docker-options#_podman)
- [Podman command reference](https://docs.podman.io/en/stable/markdown/podman.1.html)
- [Codex sandboxing](https://developers.openai.com/codex/concepts/sandboxing)
- [Claude Code settings](https://code.claude.com/docs/en/settings)
- [GitHub Copilot CLI configuration](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/configure-copilot-cli)

## PR Stack

This work should land as small, reviewable PRs:

1. Harden the DevContainer baseline and add smoke validation.
2. Add the full tutorial series.
3. Expand provider-specific policy translation for Claude, Codex, and Copilot.
4. Add CI checks for DevContainer build and security policy drift.
5. Add maintenance automation for image and CLI version updates.
