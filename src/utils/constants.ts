export const TASK_STATUS_MAP = {
    todo: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
} as const;
export type TaskStatus = keyof typeof TASK_STATUS_MAP;

export const All_TASKS_MAP = { all: 'All' } as const;
export type AllTasks = keyof typeof All_TASKS_MAP;

export const TASK_STATUS_OPTIONS = Object.entries(TASK_STATUS_MAP).map(
    ([key, label]) => ({
        key,
        label,
    })
) as { key: TaskStatus; label: string }[];

export const TASK_PRIORITY_MAP = {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
} as const;
export type TaskPriority = keyof typeof TASK_PRIORITY_MAP;

export const TASK_PRIORITY_OPTIONS = Object.entries(TASK_PRIORITY_MAP).map(
    ([key, label]) => ({
        key,
        label,
    })
) as { key: TaskPriority; label: string }[];


export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    todo: ['in_progress'],
    in_progress: ['todo', 'done'],
    done: ['in_progress'],
};