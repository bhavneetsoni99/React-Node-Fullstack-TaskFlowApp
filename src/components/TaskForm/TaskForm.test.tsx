import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { useEffect } from 'react';
import { TaskForm } from '../TaskForm/TaskForm';
import { TaskProvider, useTaskContext } from '../../context/TaskContext';
import { taskReducer } from '../../store/tasks/taskReducer';
import { userReducer } from '../../store/users/userReducer';
import { taskSagas } from '../../store/tasks/taskSaga';
import { userSagas } from '../../store/users/userSaga';
import type { Task, User } from '../../types/types';

const mockTask: Task = {
  id: '1',
  title: 'Original Title',
  description: 'Original Description',
  status: 'todo',
  priority: 'high',
  assigneeId: '1',
  dueDate: null,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.png',
  },
];

function createTestStore(initialTasks: Task[] = [], initialUsers: User[] = []) {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: {
      tasks: taskReducer,
      users: userReducer,
    },
    preloadedState: {
      tasks: {
        tasks: initialTasks,
        loading: false,
        error: null,
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

function FormOpener({ editingTask }: { editingTask?: Task | null }) {
  const { setFormState } = useTaskContext();
  useEffect(() => {
    setFormState({ isFormOpen: true, editingTask: editingTask ?? null });
  }, [editingTask, setFormState]);
  return null;
}

function renderForm(store: ReturnType<typeof createTestStore>, editingTask?: Task | null) {
  return render(
    <Provider store={store}>
      <TaskProvider>
        <FormOpener editingTask={editingTask} />
        <TaskForm />
      </TaskProvider>
    </Provider>
  );
}

describe('TaskForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render nothing when form is closed', () => {
    const store = createTestStore([mockTask], mockUsers);
    render(
      <Provider store={store}>
        <TaskProvider>
          <TaskForm />
        </TaskProvider>
      </Provider>
    );

    expect(screen.queryByTestId('task-form-modal')).not.toBeInTheDocument();
  });

  it('should render form fields when open for creating a task', () => {
    const store = createTestStore([], mockUsers);
    renderForm(store);

    expect(screen.getByTestId('task-form-modal')).toBeInTheDocument();
    expect(screen.getByTestId('form-title-input')).toHaveValue('');
    expect(screen.getByTestId('form-description-input')).toHaveValue('');
    expect(screen.getByTestId('form-status-input')).toHaveValue('todo');
    expect(screen.getByTestId('form-submit-button')).toHaveTextContent('Create Task');
  });

  it('should render form with edit mode when editing a task', () => {
    const store = createTestStore([mockTask], mockUsers);
    renderForm(store, mockTask);

    expect(screen.getByTestId('form-title-input')).toHaveValue('Original Title');
    expect(screen.getByTestId('form-description-input')).toHaveValue('Original Description');
    expect(screen.getByTestId('form-submit-button')).toHaveTextContent('Update Task');
  });

  it('should show validation error for empty title on submit', async () => {
    const user = userEvent.setup();
    const store = createTestStore([], mockUsers);
    renderForm(store);

    await user.click(screen.getByTestId('form-title-input'));
    await user.clear(screen.getByTestId('form-title-input'));
    await user.click(screen.getByTestId('form-submit-button'));

    expect(screen.getByTestId('form-title-error')).toBeInTheDocument();
    expect(screen.getByTestId('form-title-error')).toHaveTextContent('Please enter a title for the task.');
  });

  it('should show assignee validation error for high priority without assignee', async () => {
    const user = userEvent.setup();
    const store = createTestStore([], mockUsers);
    renderForm(store);

    await user.type(screen.getByTestId('form-title-input'), 'Test task');
    await user.selectOptions(screen.getByTestId('form-priority-input'), 'high');
    await user.click(screen.getByTestId('form-submit-button'));

    expect(screen.getByTestId('form-assignee-error')).toBeInTheDocument();
    expect(screen.getByTestId('form-assignee-error')).toHaveTextContent('High priority tasks must have an assignee.');
  });

  it('should clear assignee error when priority is changed from high', async () => {
    const user = userEvent.setup();
    const store = createTestStore([], mockUsers);
    renderForm(store);

    await user.type(screen.getByTestId('form-title-input'), 'Test task');
    await user.selectOptions(screen.getByTestId('form-priority-input'), 'high');
    await user.click(screen.getByTestId('form-submit-button'));
    expect(screen.getByTestId('form-assignee-error')).toBeInTheDocument();

    await user.selectOptions(screen.getByTestId('form-priority-input'), 'low');
    expect(screen.queryByTestId('form-assignee-error')).not.toBeInTheDocument();
  });

  it('should show status transition error for invalid workflow change', async () => {
    const user = userEvent.setup();
    const store = createTestStore([mockTask], mockUsers);
    renderForm(store, mockTask);

    await user.selectOptions(screen.getByTestId('form-status-input'), 'done');
    await user.click(screen.getByTestId('form-submit-button'));

    expect(screen.getByTestId('form-status-error')).toBeInTheDocument();
    expect(screen.getByTestId('form-status-error')).toHaveTextContent(/cannot move task/i);
  });

  it('should dispatch createTask on valid submission', async () => {
    const user = userEvent.setup();
    const store = createTestStore([], mockUsers);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    renderForm(store);

    await user.type(screen.getByTestId('form-title-input'), 'New Task');
    await user.type(screen.getByTestId('form-description-input'), 'New description');
    await user.selectOptions(screen.getByTestId('form-priority-input'), 'low');
    await user.click(screen.getByTestId('form-submit-button'));

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('createTaskTrigger'),
        })
      );
    });
  });

  it('should dispatch updateTask on valid edit submission', async () => {
    const user = userEvent.setup();
    const store = createTestStore([mockTask], mockUsers);
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    renderForm(store, mockTask);

    await user.clear(screen.getByTestId('form-title-input'));
    await user.type(screen.getByTestId('form-title-input'), 'Updated Title');
    await user.click(screen.getByTestId('form-submit-button'));

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('updateTaskTrigger'),
        })
      );
    });
  });

  it('should close the form and close button', async () => {
    const user = userEvent.setup();
    const store = createTestStore([], mockUsers);
    renderForm(store);

    expect(screen.getByTestId('task-form-modal')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByTestId('task-form-modal')).not.toBeInTheDocument();
  });
});
