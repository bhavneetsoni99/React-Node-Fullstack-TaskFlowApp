# Product Requirements Document

## Overview

TaskFlow is a task management application. This document outlines the business rules and requirements that must be followed when implementing features and fixing bugs.

**Important:** All implementations must adhere to these rules. Violations of these rules are considered bugs.

---

## 1. Status Transition Rules

Tasks follow a specific workflow and cannot move arbitrarily between statuses.

### Allowed Transitions

| From Status | Allowed To Status |
|-------------|-------------------|
| `todo` | `in_progress` |
| `in_progress` | `todo`, `done` |
| `done` | `in_progress` |

### Rules

- **Forward progression:** Tasks typically move `todo` → `in_progress` → `done`
- **Backward from in_progress:** A task can move back to `todo` if work hasn't actually started
- **Reopening:** A completed task can be reopened to `in_progress` if issues are found
- **No direct todo ↔ done:** Tasks cannot jump directly from `todo` to `done` or from `done` to `todo`

### Error Handling

When a user attempts an invalid transition, the application should:
1. Prevent the status change
2. Display a user-friendly error message explaining why the transition is not allowed
3. Keep the task in its current status

---

## 2. Priority Validation Rules

Priority levels have specific constraints that must be enforced.

### Rules

- **High priority tasks must have an assignee:** A task cannot be set to "high" priority unless it has an assignee. If a user tries to:
  - Create a high-priority task without an assignee → show validation error
  - Change an unassigned task to high priority → show validation error
  - Remove the assignee from a high-priority task → show validation error

- **High priority tasks cannot be bulk-deleted:** When performing bulk delete:
  - High priority tasks in the selection should be skipped
  - Show a message indicating how many high-priority tasks were excluded
  - Delete the remaining selected tasks

---

## 3. Due Date Display Rules

Due dates have specific display requirements based on their relationship to the current date and the task's status.

### Visual Indicators

| Condition | Display Style |
|-----------|---------------|
| No due date | Gray text, "No due date" |
| Due date in the future (> 1 day) | Normal text, show formatted date |
| Due date is tomorrow | Blue/info style, "Due tomorrow" |
| Due date is today | Yellow/warning style, "Due today" |
| Due date is in the past | Red/error style, "X days overdue" |

### Special Rules

- **Completed tasks are never "overdue":** If a task's status is `done`, it should display the due date in normal style regardless of whether the date has passed. The "overdue" styling only applies to incomplete tasks (`todo` or `in_progress`).

- **Relative time display:**
  - Due dates within 7 days should show relative time ("Due in 3 days", "Due tomorrow", "2 days overdue")
  - Due dates beyond 7 days should show the formatted date ("Due Jan 15, 2025")

---

## 4. Bulk Action Rules

Bulk actions have specific constraints to prevent accidental data loss.

### Selection Rules

- Users can select multiple tasks using checkboxes
- "Select All" selects only the currently visible/filtered tasks
- Selection count should be clearly displayed

### Bulk Delete Rules

- Confirmation dialog is required before deletion
- High priority tasks are excluded from bulk delete (see Priority Rules above)
- The confirmation should indicate:
  - Total tasks selected
  - Number of tasks that will be deleted
  - Number of high-priority tasks that will be skipped (if any)

### Bulk Status Change Rules

- Status changes must respect the transition rules (see Status Transition Rules above)
- If some tasks cannot transition to the selected status:
  - Apply the change to valid tasks
  - Show a summary of what was changed and what was skipped
  - Example: "3 tasks moved to Done. 2 tasks skipped (invalid transition from Todo)."

---

## Summary of Validation Error Messages

| Scenario | Error Message |
|----------|---------------|
| Invalid status transition | "Cannot move task from {current} to {target}. Tasks must follow the workflow: Todo → In Progress → Done." |
| High priority without assignee | "High priority tasks must have an assignee." |
| Bulk delete with high priority | "{X} high-priority task(s) were skipped. High priority tasks cannot be bulk deleted." |
| Bulk status change with invalid transitions | "{X} task(s) could not be moved to {status} due to workflow restrictions." |
