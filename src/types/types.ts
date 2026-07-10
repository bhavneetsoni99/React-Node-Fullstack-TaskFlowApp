import type { TaskStatus, TaskPriority, AllTasks } from '../utils/constants';

export type { RootState, AppDispatch } from '../store/store';
export type { TaskStatus, TaskPriority, AllTasks } from '../utils/constants';

export type ID = string;
export type Nullable<T> = T | null;
export interface Task {
  id: ID;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: Nullable<ID>;
  dueDate: string | null; // FEATURE: Due date support (partially implemented)
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: ID;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  avatar: string;
}

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: Nullable<string>;
  filter: TaskFilter;
  selectedTaskIds: string[]; // FEATURE: Bulk selection (not implemented)
}

export interface TaskFilter {
  status: TaskStatus | AllTasks;
  searchQuery: string;
  assigneeId: Nullable<ID>;
  priority: Nullable<TaskPriority>; // FEATURE: Priority filter (partially implemented)
}

export interface UsersState {
  users: User[];
  loading: boolean;
}

export interface FormState {
  isFormOpen: boolean;
  editingTask: Nullable<Task>;
}
