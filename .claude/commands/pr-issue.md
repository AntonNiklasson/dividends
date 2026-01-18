---
description: Pick a GitHub issue, plan and implement it, then create a PR
---

# PR from GitHub Issue

Pick an open GitHub issue, understand it, plan a solution, implement it, and create a PR.

## Step 1: Pick an Issue

Run `gh issue list --state open --search "-linked:pr"` to list open issues without existing PRs. Pick one. Prefer bugs over features, well-defined over vague. Tell the user which issue you picked.

**Skip blocked issues:** Before picking, check if an issue is blocked:
1. Run `gh api repos/{owner}/{repo}/issues/{number} --jq '.issue_dependencies_summary.blocked_by'` - skip if > 0
2. Run `gh issue view {number} --json body,comments` and scan for "blocked by" patterns in body/comments
3. If blocked, add the `blocked` label and move to the next issue

## Step 2: Understand the Issue

1. Run `gh issue view <number>` for full details
2. Explore the codebase to understand relevant code
3. Briefly summarize your understanding

## Step 3: Plan the Implementation

Enter plan mode:
1. Identify files that need changes
2. Consider edge cases and test coverage
3. Write a concrete implementation plan
4. Post the plan as a comment on the issue
5. Exit plan mode for user approval

## Step 4: Implement (TDD)

After plan approval:
1. Fetch latest and create branch off main: `an/<descriptive-name>`
2. Write or update tests first
3. Run tests - verify they fail
4. Explain briefly why they fail
5. Implement the fix
6. Run tests again - verify they pass

## Step 5: Create PR

1. Commit with clear message referencing the issue
2. Push and create PR with `gh pr create`
3. Include `Closes #<issue-number>` in PR body

## Notes

- Keep commits small and focused
- If blocked, ask rather than guess
