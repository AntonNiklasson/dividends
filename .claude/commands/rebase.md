---
description: Rebase the current feature branch on latest main
---

# Rebase on Main

Rebase the current feature branch on the latest main branch.

## Steps

1. Run `git status --porcelain` to check for uncommitted or staged changes
2. If output is non-empty:
   - Show `git status` and `git diff` to review the dirty changes
   - Tell the user the working tree has uncommitted changes and they should commit or stash them before rebasing - stop here
3. If clean:
   - Run `git fetch origin main` to get the latest main branch
   - Run `git rebase origin/main` to rebase the current branch on latest main
4. If rebase succeeds, confirm success to the user
5. If rebase has conflicts, show the conflicting files and tell the user to resolve them
