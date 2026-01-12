---
description: Pick up the next task from the implementation plan, implement it, and commit
---

# Implement Next Task

You are implementing a task from the Dividend Portfolio Projector implementation plan. Follow these steps carefully.

## Step 1: Read the PRD for Context

First, read `dividend-projector-prd.md` to understand what you're building. This is a web app that:

- Accepts CSV uploads (Avanza export format)
- Fetches dividend data from Yahoo Finance
- Projects 3-year dividend income with DRIP reinvestment
- Uses Next.js, TypeScript, Tailwind, shadcn/ui, Jotai

## Step 2: Find the Next Task

Read `dividend-projector-implementation-plan.md` and go to the **Progress Tracking** section at the bottom. Find the **first unchecked task** (marked with `- [ ]`).

If all tasks are complete, inform the user and exit.

## Step 3: Get Task Details

The Progress Tracking section shows task names like:

```
- [ ] Phase 1: Initialize Next.js project
```

Find the corresponding **Phase section** earlier in the document for full instructions. For example, "Phase 1" details are under the heading `### Phase 1: Initialize Next.js project`.

Each phase includes:

- Bullet points with specific steps
- A suggested commit message (after "Commit:")

## Step 4: Implement the Task

Execute all steps described in the phase. This may involve:

- Running shell commands (npm, npx, etc.)
- Creating/modifying files
- Installing dependencies
- Writing code

**Important:**

- Follow the PRD's tech stack and patterns
- For shadcn components, use `npx shadcn@latest add <component>`
- Verify your changes work (run dev server, tests, etc.)
- Don't skip steps or leave things partially done

## Step 5: Mark Task Complete

In `dividend-projector-implementation-plan.md`, find the task in the **Progress Tracking** section and change `- [ ]` to `- [x]`.

## Step 6: Verify Linting and Formatting

Before committing, if the project has linting/formatting set up (after phases 4-5):

1. Run `npm run lint` (or `npm run lint:fix`) - fix any errors
2. Run `npm run format` (if available) - ensure consistent formatting

All code must pass linting and formatting checks. Fix issues before proceeding.

## Step 7: Commit

Stage all changes and commit with the suggested message from the phase, or a similar descriptive message.

Format: The phase usually suggests something like `Commit: "Initialize Next.js project with TypeScript"`

Use that as your commit message, prefixed appropriately:

- `feat:` for new features
- `chore:` for setup/config
- `test:` for tests
- `fix:` for fixes

Example: `chore: Initialize Next.js project with TypeScript`

Include the co-author:

```
Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## Rules

1. **One task per run** - Only implement the single next task
2. **Be thorough** - Complete everything in the phase before marking done
3. **Verify before committing** - Make sure it works
4. **Lint and format must pass** - After phase 5, always run lint/format checks before committing
5. **Don't guess** - If something is unclear or blocked, stop and report the issue rather than making assumptions
6. **Stay focused** - Don't refactor other code or add unrequested features
