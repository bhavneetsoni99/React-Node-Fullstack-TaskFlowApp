import type { Task, TaskComment, User } from '../types/types';

const BASE_URL = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

export const api = {
  async fetchTasks(): Promise<{ tasks: Task[] }> {
    const response = await fetch(`${BASE_URL}/tasks`);
    return handleResponse(response);
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ task: Task }> {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    return handleResponse(response);
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<{ task: Task }> {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  async bulkUpdateTasks(updates: Partial<Task>[]): Promise<{ tasks: Task[] }> {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    });
    return handleResponse(response);
  },

  async deleteTask(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  async bulkDeleteTasks(ids: string[]): Promise<{ success: boolean; deletedCount: number }> {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    return handleResponse(response);
  },

  async fetchUsers(): Promise<{ users: User[] }> {
    const response = await fetch(`${BASE_URL}/users`);
    return handleResponse(response);
  },

  async fetchComments(taskId: string): Promise<{ comments: TaskComment[] }> {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}/comments`);
    return handleResponse(response);
  },

  async createComment(taskId: string, userId: string, content: string): Promise<{ comment: TaskComment }> {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, content }),
    });
    return handleResponse(response);
  },
};
