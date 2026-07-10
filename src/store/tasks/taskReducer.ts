import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TasksState, Task, TaskFilter, TaskStatus } from '../../types/types';

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  filter: {
    status: 'all',
    searchQuery: '',
    assigneeId: null,
    priority: null
  },
  selectedTaskIds: [],
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    fetchTasksStarted(state) {
      state.loading = true;
      state.error = null;
    },
    fetchTasksSuccess(state, action: PayloadAction<{ tasks: Task[] }>) {
      state.loading = false;
      state.tasks = action.payload.tasks;
    },
    fetchTasksFailure(state, action: PayloadAction<{ error: string }>) {
      state.loading = false;
      state.error = action.payload.error;
    },
    createTaskStarted(state) {
      state.loading = true;
    },
    createTaskSuccess(state, action: PayloadAction<{ task: Task }>) {
      state.loading = false;
      state.tasks.push(action.payload.task);
    },
    updateTaskSuccess(state, action: PayloadAction<{ task: Task }>) {
      const index = state.tasks.findIndex((t) => t.id === action.payload.task.id);
      if (index !== -1) {
        state.tasks[index] = action.payload.task;
      }
    },
    deleteTaskSuccess(state, action: PayloadAction<{ id: string }>) {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload.id);
    },
    setFilter(state, action: PayloadAction<{ filter: Partial<TaskFilter> }>) {
      const statusChanged = action.payload.filter.status !== undefined;
      const priorityChanged = action.payload.filter.priority !== undefined;

      // If status filter is being set to a specific status, clear priority filter
      if (statusChanged && action.payload.filter.status) {
        state.filter.priority = null;
      }

      // If priority filter is being set, clear status filter
      if (priorityChanged && action.payload.filter.priority) {
        state.filter.status = 'all';
      }
      state.filter = { ...state.filter, ...action.payload.filter };
    },
    updateTaskStatus(state, action: PayloadAction<{ id: string; status: TaskStatus }>) {
      const { id, status } = action.payload;
      const task = state.tasks.find((t) => t.id === id);
      if (task) {
        task.status = status;
        task.updatedAt = new Date().toISOString();
      }
    },

    toggleTaskSelection(state, action: PayloadAction<{ id: string }>) {
      const { id } = action.payload;
      const index = state.selectedTaskIds.indexOf(id);
      if (index === -1) {
        state.selectedTaskIds.push(id);
      } else {
        state.selectedTaskIds.splice(index, 1);
      }
    },

    selectAllTasks(state, action: PayloadAction<{ ids: string[] }>) {
      state.selectedTaskIds = action.payload.ids;
    },

    clearSelection(state) {
      state.selectedTaskIds = [];
    },
    bulkUpdateSuccess(state, action: PayloadAction<{ updates: Partial<Task>[] }>) {
      state.tasks = state.tasks.map((t) => {
        const update = action.payload.updates.find((u) => u.id === t.id);
        if (update) {
          return { ...t, ...update, updatedAt: new Date().toISOString() };
        }
        return t;
      });
      state.selectedTaskIds = state.selectedTaskIds.filter((id) => !action.payload.updates.some((u) => u.id === id));
    },
    bulkDeleteSuccess(state, action: PayloadAction<{ ids: string[] }>) {
      state.tasks = state.tasks.filter((t) => !action.payload.ids.includes(t.id));
      state.selectedTaskIds = state.selectedTaskIds.filter((id) => !action.payload.ids.includes(id));
    },
    clearError(state) {
      state.error = null;
    },
  },
});

export const taskActions = taskSlice.actions;
export const taskReducer = taskSlice.reducer;
