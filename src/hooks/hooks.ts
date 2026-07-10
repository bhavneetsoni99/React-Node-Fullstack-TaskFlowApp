import { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch, Task, TaskFilter, TaskStatus } from '../types/types';
import { taskTriggerActions } from '../store/tasks/taskActions';
import { taskActions } from '../store/tasks/taskReducer';
import { userTriggerActions } from '../store/users/userActions';

export function useAppDispatch() {
  return useDispatch<AppDispatch>();
}

export function useAppSelector<T>(selector: (state: RootState) => T): T {
  return useSelector(selector);
}

export function useTaskActions() {
  const dispatch = useAppDispatch();

  const fetchTasks = useCallback(() => dispatch(taskTriggerActions.fetchTasksTrigger()), [dispatch]);
  const createTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) =>
    dispatch(taskTriggerActions.createTaskTrigger({ task })), [dispatch]);
  const updateTask = useCallback((id: string, updates: Partial<Task>) =>
    dispatch(taskTriggerActions.updateTaskTrigger({ id, updates })), [dispatch]);
  const deleteTask = useCallback((id: string) => dispatch(taskTriggerActions.deleteTaskTrigger({ id })), [dispatch]);
  const setFilter = useCallback((filter: Partial<TaskFilter>) =>
    dispatch(taskActions.setFilter({ filter })), [dispatch]);
  const toggleTaskSelection = useCallback((id: string) =>
    dispatch(taskActions.toggleTaskSelection({ id })), [dispatch]);
  const selectAllTasks = useCallback((ids: string[]) =>
    dispatch(taskActions.selectAllTasks({ ids })), [dispatch]);
  const clearSelection = useCallback(() =>
    dispatch(taskActions.clearSelection()), [dispatch]);
  const bulkDeleteTasks = useCallback((ids: string[]) =>
    dispatch(taskTriggerActions.bulkDeleteTrigger({ ids })), [dispatch]);
  const bulkUpdateTasks = useCallback((updates: { id: string; status: TaskStatus }[]) =>
    dispatch(taskTriggerActions.bulkUpdateTrigger({ updates })), [dispatch]);
  const clearError = useCallback(() =>
    dispatch(taskActions.clearError()), [dispatch]);

  return useMemo(
    () => ({
      fetchTasks,
      createTask,
      updateTask,
      deleteTask,
      setFilter,
      toggleTaskSelection,
      selectAllTasks,
      clearSelection,
      bulkDeleteTasks,
      bulkUpdateTasks,
      clearError,
    }),
    [fetchTasks, createTask, updateTask, deleteTask, setFilter,
      toggleTaskSelection, selectAllTasks, clearSelection, bulkDeleteTasks, bulkUpdateTasks, clearError]
  );
}

export function useUserActions() {
  const dispatch = useAppDispatch();
  const fetchUsers = useCallback(() => dispatch(userTriggerActions.fetchUsersTrigger()), [dispatch]);

  return useMemo(
    () => ({
      fetchUsers,
    }),
    [fetchUsers]
  );
}