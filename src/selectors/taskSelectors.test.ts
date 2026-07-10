import { describe, it, expect } from 'vitest';
import type { RootState, Task } from '../types/types';
import { selectFilteredTasks, selectFilteredTaskIds, selectTaskCounts } from './taskSelectors';

describe('Task selectors', () => {
    const mockTasks: Task[] = [
        {
            id: 'high-todo',
            title: 'High priority todo',
            description: 'A high priority task',
            status: 'todo',
            priority: 'high',
            assigneeId: 'u1',
            dueDate: '2026-05-30',
            createdAt: '2026-05-01T00:00:00Z',
            updatedAt: '2026-05-01T00:00:00Z',
        },
        {
            id: 'medium-todo-soon',
            title: 'Medium priority todo upcoming',
            description: 'A medium priority task with an earlier due date',
            status: 'todo',
            priority: 'medium',
            assigneeId: 'u2',
            dueDate: '2026-05-25',
            createdAt: '2026-05-02T00:00:00Z',
            updatedAt: '2026-05-02T00:00:00Z',
        },
        {
            id: 'medium-todo-later',
            title: 'Medium priority todo later',
            description: 'A medium priority task with a later due date',
            status: 'todo',
            priority: 'medium',
            assigneeId: null,
            dueDate: '2026-06-05',
            createdAt: '2026-05-03T00:00:00Z',
            updatedAt: '2026-05-03T00:00:00Z',
        },
        {
            id: 'low-todo',
            title: 'Low priority todo',
            description: 'A low priority task without due date',
            status: 'todo',
            priority: 'low',
            assigneeId: null,
            dueDate: null,
            createdAt: '2026-05-04T00:00:00Z',
            updatedAt: '2026-05-04T00:00:00Z',
        },
        {
            id: 'medium-in-progress',
            title: 'Medium priority in progress',
            description: 'A medium priority task in progress',
            status: 'in_progress',
            priority: 'medium',
            assigneeId: 'u2',
            dueDate: '2026-05-29',
            createdAt: '2026-05-05T00:00:00Z',
            updatedAt: '2026-05-05T00:00:00Z',
        },
        {
            id: 'done-high',
            title: 'Completed high priority task',
            description: 'A completed task should be pushed to the bottom',
            status: 'done',
            priority: 'high',
            assigneeId: 'u1',
            dueDate: '2026-05-20',
            createdAt: '2026-05-06T00:00:00Z',
            updatedAt: '2026-05-06T00:00:00Z',
        },
    ];

    const baseState = {
        tasks: {
            tasks: mockTasks,
            loading: false,
            error: null,
            filter: {
                status: 'all',
                searchQuery: '',
                assigneeId: null,
                priority: null,
            },
            selectedTaskIds: [],
        },
        users: {
            users: [],
            loading: false,
        },
    } as RootState;

    it('should count status and priority values correctly', () => {
        expect(selectTaskCounts(baseState)).toEqual({
            todo: 4,
            in_progress: 1,
            done: 1,
            low: 1,
            medium: 3,
            high: 2,
            all: 6,
        });
    });

    it('should filter tasks by status', () => {
        const state: RootState = {
            ...baseState,
            tasks: {
                ...baseState.tasks,
                filter: {
                    ...baseState.tasks.filter,
                    status: 'todo',
                },
            },
        };

        const result = selectFilteredTasks(state);
        expect(result).toHaveLength(4);
        expect(result.every((task) => task.status === 'todo')).toBe(true);
    });

    it('should filter tasks by search query case-insensitively', () => {
        const state: RootState = {
            ...baseState,
            tasks: {
                ...baseState.tasks,
                filter: {
                    ...baseState.tasks.filter,
                    searchQuery: 'completed',
                },
            },
        };

        expect(selectFilteredTasks(state)).toEqual([
            mockTasks.find((task) => task.id === 'done-high'),
        ]);
    });

    it('should filter tasks by assignee and priority', () => {
        const state: RootState = {
            ...baseState,
            tasks: {
                ...baseState.tasks,
                filter: {
                    ...baseState.tasks.filter,
                    assigneeId: 'u2',
                    priority: 'medium',
                },
            },
        };

        const result = selectFilteredTasks(state);

        expect(result).toHaveLength(2);
        expect(result.map((task) => task.id)).toEqual(['medium-todo-soon', 'medium-in-progress']);
    });

    it('should sort filtered tasks by group weight, due date, and creation date', () => {
        const result = selectFilteredTasks(baseState);

        expect(result.map((task) => task.id)).toEqual([
            'high-todo',
            'medium-todo-soon',
            'medium-todo-later',
            'low-todo',
            'medium-in-progress',
            'done-high',
        ]);
    });

    it('should return filtered task ids in sorted order', () => {
        expect(selectFilteredTaskIds(baseState)).toEqual([
            'high-todo',
            'medium-todo-soon',
            'medium-todo-later',
            'low-todo',
            'medium-in-progress',
            'done-high',
        ]);
    });
});
