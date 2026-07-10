import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TaskCard } from '../TaskCard/TaskCard';
import { TaskProvider } from '../../context/TaskContext';
import { taskReducer } from '../../store/tasks/taskReducer';
import { userReducer } from '../../store/users/userReducer';
import type { Task, User, TaskPriority } from '../../types/types';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Test Description',
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

const mockAssignee: User = mockUsers[0];

function createTestStore() {
  return configureStore({
    reducer: {
      tasks: taskReducer,
      users: userReducer,
    },
    preloadedState: {
      tasks: {
        tasks: [mockTask],
        loading: false,
        error: null,
        filter: { status: 'all' as const, searchQuery: '', assigneeId: null, priority: null },
        selectedTaskIds: [],
      },
      users: {
        users: mockUsers,
        loading: false,
      },
    },
  });
}

function renderCard(overrides?: { task?: Task; assignee?: User | null; isSelected?: boolean }) {
  const store = createTestStore();
  return {
    store,
    ...render(
      <Provider store={store}>
        <TaskProvider>
          <TaskCard
            task={overrides?.task ?? mockTask}
            assignee={overrides?.assignee !== undefined ? overrides.assignee : mockAssignee}
            isSelected={overrides?.isSelected}
          />
        </TaskProvider>
      </Provider>
    ),
  };
}

describe('TaskCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render task title and description', () => {
    renderCard();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should display assignee name when task has an assignee', () => {
    renderCard();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should not display assignee when task has no assignee', () => {
    renderCard({ assignee: null });
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('should display checkbox for selection', () => {
    renderCard();
    expect(screen.getByTestId('select-task-1')).toBeInTheDocument();
  });

  it('should have edit and delete buttons', () => {
    renderCard();
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  it('should have status selector', () => {
    renderCard();
    expect(screen.getByLabelText('Status:')).toBeInTheDocument();
  });

  it('should show comments toggle button', () => {
    renderCard();
    expect(screen.getByTestId('comments-toggle')).toBeInTheDocument();
    expect(screen.getByText('Show Comments')).toBeInTheDocument();
  });

  it('should render due date component', () => {
    renderCard();
    expect(screen.getByTestId('task-due-date')).toBeInTheDocument();
  });

  it.each([
    ['high', 'priorityHigh'],
    ['medium', 'priorityMedium'],
    ['low', 'priorityLow'],
  ])('should apply %s priority class', (priority, expectedClass) => {
    const task = { ...mockTask, priority: priority as TaskPriority };
    renderCard({ task });
    expect(screen.getByTestId('task-card').className).toMatch(expectedClass);
  });
});
