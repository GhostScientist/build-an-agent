# Glossary

## Agentic Engineering

Agentic engineering means giving an AI coding tool enough context and tool access to inspect a codebase, edit files, run commands, and iterate toward a result. This is more powerful than autocomplete or chat because the tool can act in the development environment.

## DevContainer

A DevContainer is a development environment defined as code, usually in `.devcontainer/devcontainer.json`. Editors and tools that support the Dev Container Specification use that file to build or start a container with the project's expected runtime, packages, editor extensions, ports, and setup commands.

## Container

A container is an isolated Linux process environment with its own filesystem view, installed tools, environment variables, and runtime configuration. Containers are not full virtual machines, but they create a useful boundary between a project and the host machine.

## Image

An image is the template used to create a container. A project can use a published image directly or build its own image from a `Containerfile`.

## Containerfile

A `Containerfile` is the OCI/Podman name for a Dockerfile-compatible build file. It defines the base image and the commands used to install system tools into the image.

## Podman

Podman is an OCI container engine with Docker-compatible commands. It can run rootless, does not require a long-running root daemon, and is a good default for local development environments where Docker Desktop licensing or host-level daemon access is undesirable.

## Rootless

Rootless means the container engine and containers run as an unprivileged user. Inside the container, a process may appear to be root, but it does not have root privileges on the host.

## Sandbox

A sandbox is an enforcement boundary around what a tool can access. For AI coding agents, sandboxing usually controls which files commands can read or write and whether subprocesses can use the network.

## Approval Policy

An approval policy controls when the agent must stop and ask a human before acting. Sandboxing defines what is technically possible; approvals define when autonomy is allowed.

## MCP

Model Context Protocol, or MCP, is a standard way to connect agents to tools and services. MCP can be useful, but each server expands the agent's authority and should be allowlisted intentionally.

## Secret

A secret is any credential or sensitive value, such as API keys, SSH keys, GitHub tokens, cloud credentials, `.env` files, and private certificates. Agents should not be able to read secrets unless a workflow explicitly requires it and the risk has been reviewed.

## Prompt Injection

Prompt injection is an attempt to smuggle instructions into data the agent reads, such as a README, issue body, dependency file, webpage, or test fixture. The risk matters because agents can act on instructions, not just summarize them.

## Policy as Code

Policy as code means keeping security decisions in version-controlled files that can be reviewed, tested, and updated. In this project, `.ai/security-policy.yaml` is the shared policy source, while `.codex/config.toml`, `.claude/settings.json`, and `scripts/agent-safe` are provider-specific enforcement layers.
