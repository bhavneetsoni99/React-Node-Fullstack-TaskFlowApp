import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { TaskList } from '../TaskList/TaskList';
import { TaskProvider } from '../../context/TaskContext';
import { taskReducer, taskActions } from '../../store/tasks/taskReducer';
import { userReducer } from '../../store/users/userReducer';
import { taskSagas } from '../../store/tasks/taskSaga';
import { userSagas } from '../../store/users/userSaga';
import type { Task, User, Nullable } from '../../types/types';
import { api } from '../../api/api';

vi.mock('../../api/api');

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Description 1',
    status: 'todo',
    priority: 'high',
    assigneeId: '1',
    dueDate: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Description 2',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: '2',
    dueDate: null,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Done Task',
    description: 'Completed',
    status: 'done' as const,
    priority: 'low' as const,
    assigneeId: null,
    dueDate: null,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'User 1',
    email: 'user1@test.com',
    avatar: 'https://example.com/avatar1.png',
  },
  {
    id: '2',
    name: 'User 2',
    email: 'user2@test.com',
    avatar: 'https://example.com/avatar2.png',
  },
];

function createTestStore(initialTasks: Task[] = [], initialUsers: User[] = [], loadingState = false, errorState: Nullable<string> = null) {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: {
      tasks: taskReducer,
      users: userReducer,
    },
    preloadedState: {
      tasks: {
        tasks: initialTasks,
        loading: loadingState,
        error: errorState,
        filter: { status: 'all' as const, searchQuery: '', assigneeId: null, priority: null },
        selectedTaskIds: [],
      },
      users: {
        users: initialUsers,
        loading: false,
      },
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
  });

  function* rootSaga() {
    yield all([taskSagas(), userSagas()]);
  }
  sagaMiddleware.run(rootSaga);

  return store;
}

function renderWithProviders(ui: React.ReactElement, store = createTestStore()) {
  return render(
    <Provider store={store}>
      <TaskProvider>{ui}</TaskProvider>
    </Provider>
  );
}

describe('TaskList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state when no tasks exist', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue({ tasks: [] });
    vi.mocked(api.fetchUsers).mockResolvedValue({ users: [] });
    renderWithProviders(<TaskList />);
    await waitFor(() => {
      expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
    });
  });

  it('should display loading state', () => {
    const store = createTestStore([], [], true);
    renderWithProviders(<TaskList />, store);
    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();
  });

  it('should render task cards when tasks exist', () => {
    vi.mocked(api.fetchTasks).mockResolvedValue({ tasks: mockTasks });
    vi.mocked(api.fetchUsers).mockResolvedValue({ users: mockUsers });
    const store = createTestStore(mockTasks, mockUsers);
    renderWithProviders(<TaskList />, store);

    expect(screen.getByText('Test Task 1')).toBeInTheDocument();
    expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    expect(screen.getByText('Done Task')).toBeInTheDocument();
  });

  it('should render the correct number of task cards', () => {
    vi.mocked(api.fetchTasks).mockResolvedValue({ tasks: mockTasks });
    vi.mocked(api.fetchUsers).mockResolvedValue({ users: mockUsers });
    const store = createTestStore(mockTasks, mockUsers);
    renderWithProviders(<TaskList />, store);

    const taskCards = screen.getAllByTestId('task-card');
    expect(taskCards).toHaveLength(3);
  });

  it('should filter tasks by status', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue({ tasks: mockTasks });
    vi.mocked(api.fetchUsers).mockResolvedValue({ users: mockUsers });
    const store = createTestStore(mockTasks, mockUsers);
    renderWithProviders(<TaskList />, store);

    expect(screen.queryByText('Test Task 2')).toBeInTheDocument();
    expect(screen.queryByText('Done Task')).toBeInTheDocument();
    expect(screen.getAllByTestId('task-card')).toHaveLength(3);

    store.dispatch(taskActions.setFilter({ filter: { status: 'todo' } }));

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Task 2')).not.toBeInTheDocument();
      expect(screen.queryByText('Done Task')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('task-card')).toHaveLength(1);
    });
  });


  it('should filter tasks by assignee', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue({ tasks: mockTasks });
    vi.mocked(api.fetchUsers).mockResolvedValue({ users: mockUsers });
    const store = createTestStore(mockTasks, mockUsers);
    renderWithProviders(<TaskList />, store);

    store.dispatch(taskActions.setFilter({ filter: { assigneeId: '2' } }));

    await waitFor(() => {
      expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
      expect(screen.queryByText('Done Task')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('task-card')).toHaveLength(1);
    });
  });

  it('should filter tasks by search query', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue({ tasks: mockTasks });
    vi.mocked(api.fetchUsers).mockResolvedValue({ users: mockUsers });
    const store = createTestStore(mockTasks, mockUsers);
    renderWithProviders(<TaskList />, store);

    store.dispatch(taskActions.setFilter({ filter: { searchQuery: '  dONe  ' } }));

    await waitFor(() => {
      expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Task 2')).not.toBeInTheDocument();
      expect(screen.getByText('Done Task')).toBeInTheDocument();
      expect(screen.getAllByTestId('task-card')).toHaveLength(1);
    });
  });

  it('should combine status and assignee filters', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue({ tasks: mockTasks });
    vi.mocked(api.fetchUsers).mockResolvedValue({ users: mockUsers });
    const store = createTestStore(mockTasks, mockUsers);
    renderWithProviders(<TaskList />, store);

    store.dispatch(taskActions.setFilter({
      filter: { status: 'todo', assigneeId: '1' },
    }));

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getAllByTestId('task-card')).toHaveLength(1);
    });
  });

  it('should combine status and search filters', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue({ tasks: mockTasks });
    vi.mocked(api.fetchUsers).mockResolvedValue({ users: mockUsers });
    const store = createTestStore(mockTasks, mockUsers);
    renderWithProviders(<TaskList />, store);

    store.dispatch(taskActions.setFilter({
      filter: { status: 'in_progress', searchQuery: 'task' },
    }));

    await waitFor(() => {
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
      expect(screen.getAllByTestId('task-card')).toHaveLength(1);
    });
  });

  it('should show empty state when no tasks match the filter', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue({ tasks: mockTasks });
    vi.mocked(api.fetchUsers).mockResolvedValue({ users: mockUsers });
    const store = createTestStore(mockTasks, mockUsers);
    renderWithProviders(<TaskList />, store);

    store.dispatch(taskActions.setFilter({ filter: { status: 'done' as const, assigneeId: '1' } }));

    await waitFor(() => {
      expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
    });
  });

  it('should reset to all tasks when filter is cleared', async () => {
    vi.mocked(api.fetchTasks).mockResolvedValue({ tasks: mockTasks });
    vi.mocked(api.fetchUsers).mockResolvedValue({ users: mockUsers });
    const store = createTestStore(mockTasks, mockUsers);
    renderWithProviders(<TaskList />, store);

    store.dispatch(taskActions.setFilter({ filter: { status: 'todo' } }));
    await waitFor(() => {
      expect(screen.getAllByTestId('task-card')).toHaveLength(1);
    });

    store.dispatch(taskActions.setFilter({ filter: { status: 'all' as const } }));
    await waitFor(() => {
      expect(screen.getAllByTestId('task-card')).toHaveLength(3);
    });
  });
});

it('should display error state', async () => {
  vi.mocked(api.fetchTasks).mockRejectedValue(new Error('Failed to fetch tasks'));
  vi.mocked(api.fetchUsers).mockResolvedValue({ users: [] });
  const store = createTestStore([], [], false, 'Failed to fetch tasks');

  renderWithProviders(<TaskList />, store);
  await waitFor(() => {
    expect(screen.getByText(/Failed to fetch tasks/i)).toBeInTheDocument();
  });
});
