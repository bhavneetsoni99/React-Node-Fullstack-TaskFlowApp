import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BulkActions } from '../BulkActions/BulkActions';
import { taskReducer, taskActions } from '../../store/tasks/taskReducer';
import { userReducer } from '../../store/users/userReducer';
import { taskTriggerActions } from '../../store/tasks/taskActions';
import { notify } from '../NotificationManager';
import type { Task } from '../../types/types';

const tasks: Task[] = [
  {
    id: '1',
    title: 'Task one',
    description: 'First task',
    status: 'todo',
    priority: 'high',
    assigneeId: null,
    dueDate: '2026-05-30',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Task two',
    description: 'Second task',
    status: 'todo',
    priority: 'low',
    assigneeId: null,
    dueDate: '2026-05-20',
    createdAt: '2026-05-02T00:00:00Z',
    updatedAt: '2026-05-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Task three',
    description: 'Third task',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: null,
    dueDate: null,
    createdAt: '2026-05-03T00:00:00Z',
    updatedAt: '2026-05-03T00:00:00Z',
  },
];

function createTestStore(selectedTaskIds: string[] = []) {
  return configureStore({
    reducer: {
      tasks: taskReducer,
      users: userReducer,
    },
    preloadedState: {
      tasks: {
        tasks,
        loading: false,
        error: null,
        filter: { status: 'all' as const, searchQuery: '', assigneeId: null, priority: null },
        selectedTaskIds,
      },
      users: {
        users: [],
        loading: false,
      },
    },
  });
}

describe('BulkActions', () => {
  beforeEach(() => {
    vi.spyOn(notify, 'confirm').mockResolvedValue(false);
    vi.spyOn(notify, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render the bulk actions container but not show action buttons when no tasks are selected', () => {
    const store = createTestStore([]);
    render(
      <Provider store={store}>
        <BulkActions />
      </Provider>
    );

    expect(screen.getByTestId('bulk-actions')).toBeInTheDocument();
    expect(screen.getByTestId('selected-count')).toHaveTextContent('0 task(s) selected');
    expect(screen.queryByTestId('clear-selection')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bulk-delete')).not.toBeInTheDocument();
    expect(screen.queryByTestId('bulk-status-change')).not.toBeInTheDocument();
  });

  it('should display count of selected tasks', () => {
    const store = createTestStore(['1', '2']);
    render(
      <Provider store={store}>
        <BulkActions />
      </Provider>
    );

    expect(screen.getByTestId('selected-count')).toHaveTextContent('2 task(s) selected');
  });

  it('should clear selection when button is clicked', async () => {
    const store = createTestStore(['1']);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <BulkActions />
      </Provider>
    );

    await userEvent.click(screen.getByTestId('clear-selection'));

    expect(dispatchSpy).toHaveBeenCalledWith(taskActions.clearSelection());
  });

  it('should show confirmation dialog before bulk delete', async () => {
    const store = createTestStore(['1', '2']);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <BulkActions />
      </Provider>
    );

    await userEvent.click(screen.getByTestId('bulk-delete'));

    expect(notify.confirm).toHaveBeenCalledWith(
      'Confirm Delete',
      expect.arrayContaining([
        expect.stringContaining('You have selected 2 tasks for deletion.'),
      ]),
    );
    expect(dispatchSpy).not.toHaveBeenCalledWith(taskTriggerActions.bulkDeleteTrigger({ ids: ['2'] }));
  });

  it('should dispatch bulk delete action when confirmed', async () => {
    vi.spyOn(notify, 'confirm').mockResolvedValue(true);
    const store = createTestStore(['1', '2']);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <BulkActions />
      </Provider>
    );

    await userEvent.click(screen.getByTestId('bulk-delete'));

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(taskTriggerActions.bulkDeleteTrigger({ ids: ['2'] }));
    });
  });

  it('should dispatch bulk status change action', async () => {
    const store = createTestStore(['2']);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <BulkActions />
      </Provider>
    );

    await userEvent.selectOptions(screen.getByLabelText('Change status of selected tasks'), 'in_progress');

    expect(dispatchSpy).toHaveBeenCalledWith(
      taskTriggerActions.bulkUpdateTrigger({ updates: [{ id: '2', status: 'in_progress' }] }),
    );
  });

  it('should render when tasks are selected', () => {
    const store = createTestStore(['1', '2']);
    render(
      <Provider store={store}>
        <BulkActions />
      </Provider>
    );
    expect(screen.getByTestId('bulk-actions')).toBeInTheDocument();
  });
});
