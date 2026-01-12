#!/bin/bash

# Ralph Wiggum Loop: Implement all tasks from the plan
# Each iteration spawns a fresh Claude context

set -e

LOG_FILE="implementation.log"
MAX_TASKS=59
RETRY_LIMIT=2

echo "Starting implementation loop at $(date)" | tee -a "$LOG_FILE"
echo "==========================================" | tee -a "$LOG_FILE"

for i in $(seq 1 $MAX_TASKS); do
  echo "" | tee -a "$LOG_FILE"
  echo "=== Attempting task $i of $MAX_TASKS ===" | tee -a "$LOG_FILE"
  echo "Time: $(date)" | tee -a "$LOG_FILE"

  # Check if all tasks are done by counting unchecked boxes
  REMAINING=$(grep -c '^\- \[ \]' dividend-projector-implementation-plan.md 2>/dev/null || echo "0")

  if [ "$REMAINING" -eq 0 ]; then
    echo "All tasks complete!" | tee -a "$LOG_FILE"
    break
  fi

  echo "Remaining tasks: $REMAINING" | tee -a "$LOG_FILE"

  # Get the next task name for logging
  NEXT_TASK=$(grep -m1 '^\- \[ \]' dividend-projector-implementation-plan.md | sed 's/- \[ \] //')
  echo "Next task: $NEXT_TASK" | tee -a "$LOG_FILE"

  # Run Claude with /implement
  # --dangerously-skip-permissions skips permission checks
  RETRY=0
  SUCCESS=false

  while [ $RETRY -lt $RETRY_LIMIT ] && [ "$SUCCESS" = false ]; do
    echo "Attempt $((RETRY + 1))..." | tee -a "$LOG_FILE"

    if claude --dangerously-skip-permissions -p "/implement" 2>&1 | tee -a "$LOG_FILE"; then
      # Check if a commit was made in the last 5 minutes
      if git log -1 --since="5 minutes ago" --oneline 2>/dev/null | grep -q .; then
        LAST_COMMIT=$(git log -1 --oneline)
        echo "Commit created: $LAST_COMMIT" | tee -a "$LOG_FILE"
        SUCCESS=true
      else
        echo "No commit detected, may have failed" | tee -a "$LOG_FILE"
        RETRY=$((RETRY + 1))
      fi
    else
      echo "Claude exited with error" | tee -a "$LOG_FILE"
      RETRY=$((RETRY + 1))
    fi
  done

  if [ "$SUCCESS" = false ]; then
    echo "Task failed after $RETRY_LIMIT attempts. Stopping." | tee -a "$LOG_FILE"
    echo "Manual intervention required for: $NEXT_TASK" | tee -a "$LOG_FILE"
    exit 1
  fi

  # Brief pause between tasks
  sleep 2
done

echo "" | tee -a "$LOG_FILE"
echo "==========================================" | tee -a "$LOG_FILE"
echo "Implementation loop finished at $(date)" | tee -a "$LOG_FILE"

# Summary
COMPLETED=$(grep -c '^\- \[x\]' dividend-projector-implementation-plan.md 2>/dev/null || echo "0")
REMAINING=$(grep -c '^\- \[ \]' dividend-projector-implementation-plan.md 2>/dev/null || echo "0")
echo "Completed: $COMPLETED | Remaining: $REMAINING" | tee -a "$LOG_FILE"
