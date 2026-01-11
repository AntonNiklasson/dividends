---
description: Pick up the next task from IMPLEMENTATION_PLAN.md, implement it, and commit
---

# Implement Next Task

You are implementing a task from the implementation plan. Follow these steps carefully:

## Step 1: Read the Implementation Plan

Read the `IMPLEMENTATION_PLAN.md` file in the repository root. This file contains a list of tasks with checkboxes:
- `[ ]` = incomplete task
- `[x]` = completed task

## Step 2: Identify the Next Task

Find the **first incomplete task** (marked with `[ ]`). This is the task you will implement.

If all tasks are complete, inform the user that there are no remaining tasks.

## Step 3: Implement the Task

Carefully implement the task according to its description. This may involve:
- Creating new files
- Modifying existing files
- Adding dependencies
- Writing tests

Follow best practices and ensure your implementation is complete and correct.

## Step 4: Update the Implementation Plan

After successfully implementing the task:
1. Mark the task as complete by changing `[ ]` to `[x]`
2. Keep all other content in the file unchanged

## Step 5: Commit the Changes

Create a git commit with all changes including:
- The implemented code/files
- The updated IMPLEMENTATION_PLAN.md

Use a clear, descriptive commit message that references the task you completed.

Format: `feat: <brief description of what was implemented>`

## Important Notes

- Only implement ONE task per invocation
- Be thorough - fully complete the task before marking it done
- If you encounter blockers or questions, stop and ask the user rather than guessing
- Always verify your changes work before committing
