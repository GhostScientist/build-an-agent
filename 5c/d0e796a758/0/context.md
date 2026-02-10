# Session Context

## User Prompts

### Prompt 1

Implement the following plan:

# Plan: Add Eval-Specific Test Set

## Overview

Add generated test files for the eval-runner template so that when a user creates an eval-runner agent project, they get a working test suite out of the box. Uses **vitest** as the test framework. Tests cover the 4 most testable eval modules (pure logic / filesystem-only). Both the npm CLI (`create-agent-app`) and webapp (`agent-workshop-app`) generators get identical updates.

## Files to Modify (4 files)

| File | ...

