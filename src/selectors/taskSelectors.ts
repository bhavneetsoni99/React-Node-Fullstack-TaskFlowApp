import { createSelector } from '@reduxjs/toolkit';
import { shallowEqual } from 'react-redux';
import type {
    RootState, TasksState, Task, TaskFilter, Nullable, ID,
} from '../types/types';

const memoizeOptions = {
    resultEqualityCheck: shallowEqual,
};

const FILTER_ORDER: Record<string, number> = {
    'date_updated_today': 0,
    'date_created_today': 1,
    'high_priority_todo': 2,
    'medium_priority_todo': 3,
    'low_priority_todo': 4,
    'high_priority_in_progress': 5,
    'medium_priority_in_progress': 6,
    'low_priority_in_progress': 7,
}


const selectTasksState: (state: RootState) => TasksState = (state: RootState) => state.tasks;

export const selectTasks: (state: RootState) => Task[] = (state: RootState) => selectTasksState(state).tasks;
export const selectTasksLoading: (state: RootState) => boolean = (state: RootState) => selectTasksState(state).loading;
export const selectTasksError: (state: RootState) => Nullable<string> = (state: RootState) => selectTasksState(state).error;

export const selectTasksSelectedIds: (state: RootState) => ID[] = (state: RootState) => selectTasksState(state).selectedTaskIds;

export const selectTasksSelectedSet = createSelector(
    [selectTasksSelectedIds],
    (selectedIds) => new Set(selectedIds)
);

export const selectRawFilter: (state: RootState) => TaskFilter = (state: RootState) => selectTasksState(state).filter;

export const selectTaskFilter = createSelector([selectRawFilter],
    (filter) => filter, { memoizeOptions }
);

export const selectFilteredTasks = createSelector(
    [selectTasks, selectTaskFilter],
    (tasks, filter) => {
        const query = filter.searchQuery?.toLowerCase().trim();

        const filteredTasks = tasks.filter((task) => {
            if (filter.status !== 'all' && task.status !== filter.status) {
                return false;
            }
            if (query && !task.title.toLowerCase().includes(query)) {
                return false;
            }
            if (filter.assigneeId && task.assigneeId !== filter.assigneeId) {
                return false;
            }
            if (filter.priority && task.priority !== filter.priority) {
                return false;
            }
            return true;
        });

        const systemTodayStr = new Date().toDateString();

        return filteredTasks.sort((a, b) => {
            const getGroupWeight = (task: Task) => {
                // "done" tasks to the absolute bottom
                if (task.status === 'done') return 99;

                const createdToday = new Date(task.createdAt).toDateString() === systemTodayStr;
                const updatedToday = new Date(task.updatedAt).toDateString() === systemTodayStr;

                if (updatedToday) return FILTER_ORDER['date_updated_today'];
                if (createdToday) return FILTER_ORDER['date_created_today'];

                const key = `${task.priority}_priority_${task.status}`;
                return FILTER_ORDER[key] ?? 98;
            };
            const weightA = getGroupWeight(a);
            const weightB = getGroupWeight(b);

            if (weightA !== weightB) {
                return weightA - weightB;
            }

            if (weightA === FILTER_ORDER['date_created_today'] || weightA === FILTER_ORDER['date_updated_today']) {
                return Date.parse(b.createdAt) - Date.parse(a.createdAt);
            }

            const aTime = a.dueDate ? Date.parse(a.dueDate) : Infinity;
            const bTime = b.dueDate ? Date.parse(b.dueDate) : Infinity;
            if (aTime !== bTime) {
                return aTime - bTime;
            }

            return Date.parse(b.createdAt) - Date.parse(a.createdAt);
        });
    }
);

export const selectFilteredTaskIds = createSelector(
    [selectFilteredTasks],
    (filteredTasks) => filteredTasks.map((task) => task.id)
);

export const selectTaskCounts = createSelector([selectTasks], (tasks) => {
    const counts = tasks.reduce(
        (acc, task) => {
            if (task.status in acc) {
                acc[task.status]++;
            }
            if (task.priority in acc) {
                acc[task.priority]++;
            }
            return acc;
        },
        { todo: 0, in_progress: 0, done: 0, low: 0, medium: 0, high: 0 }
    );

    return { ...counts, all: tasks.length };
}, { memoizeOptions });
