---
name: fresh
description: Jump back to main and pull latest changes
---

# Fresh Start

Switch to main branch and pull the latest changes.

## Steps

1. Run `git status --porcelain` to check for uncommitted changes
2. If output is non-empty, show `git status` and tell the user the working tree is dirty - stop here
3. If clean, run `git checkout main && git pull`
4. Confirm success to the user
