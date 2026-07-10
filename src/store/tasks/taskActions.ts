import { createAction } from '@reduxjs/toolkit';
import type { Task } from '../../types/types';

export const taskTriggerActions = {
  fetchTasksTrigger: createAction('tasks/fetchTasksTrigger'),
  createTaskTrigger: createAction<{ task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> }>('tasks/createTaskTrigger'),
  updateTaskTrigger: createAction<{ id: string; updates: Partial<Task> }>('tasks/updateTaskTrigger'),
  deleteTaskTrigger: createAction<{ id: string }>('tasks/deleteTaskTrigger'),
  bulkDeleteTrigger: createAction<{ ids: string[] }>('tasks/bulkDeleteTrigger'),
  bulkUpdateTrigger: createAction<{ updates: Partial<Task>[] }>('tasks/bulkUpdateTrigger'),
};
