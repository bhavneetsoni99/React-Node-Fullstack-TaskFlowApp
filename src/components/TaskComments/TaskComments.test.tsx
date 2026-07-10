import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { TaskComments } from '../TaskComments/TaskComments';
import { taskReducer } from '../../store/tasks/taskReducer';
import { userReducer } from '../../store/users/userReducer';
import { api } from '../../api/api';
import type { User, TaskComment } from '../../types/types';

vi.mock('../../api/api');

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://example.com/avatar.png',
  },
];

const mockComments: TaskComment[] = [
  {
    id: 'c1',
    taskId: '1',
    userId: '1',
    content: 'First comment',
    createdAt: '2025-06-10T10:00:00Z',
  },
];

function createTestStore() {
  return configureStore({
    reducer: {
      tasks: taskReducer,
      users: userReducer,
    },
    preloadedState: {
      tasks: {
        tasks: [],
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

function renderComments(taskId = '1') {
  const store = createTestStore();
  return {
    store,
    ...render(
      <Provider store={store}>
        <TaskComments taskId={taskId} />
      </Provider>
    ),
  };
}

describe('TaskComments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch comments when component mounts', async () => {
    vi.mocked(api.fetchComments).mockResolvedValue({ comments: mockComments });
    renderComments();
    await waitFor(() => {
      expect(screen.getByText('First comment')).toBeInTheDocument();
    });
  });

  it('should display loading state while fetching', () => {
    vi.mocked(api.fetchComments).mockImplementation(() => new Promise(() => { }));
    renderComments();
    expect(screen.getByText('Loading comments...')).toBeInTheDocument();
  });

  it('should show empty state when no comments', async () => {
    vi.mocked(api.fetchComments).mockResolvedValue({ comments: [] });
    renderComments();
    await waitFor(() => {
      expect(screen.getByText('No comments yet')).toBeInTheDocument();
    });
  });

  it('should display user names for comments', async () => {
    vi.mocked(api.fetchComments).mockResolvedValue({ comments: mockComments });
    renderComments();
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });

  it('should add a new comment', async () => {
    const user = userEvent.setup();
    vi.mocked(api.fetchComments).mockResolvedValue({ comments: [] });
    vi.mocked(api.createComment).mockResolvedValue({
      comment: {
        id: 'c2',
        taskId: '1',
        userId: '1',
        content: 'New comment',
        createdAt: '2025-06-15T12:00:00Z',
      },
    });

    renderComments('1');
    await waitFor(() => {
      expect(screen.queryByText('Loading comments...')).not.toBeInTheDocument();
    });

    const input = screen.getByTestId('comment-input');
    const button = screen.getByTestId('add-comment-button');

    await user.type(input, 'New comment');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('New comment')).toBeInTheDocument();
    });
  });

  it('should render the comments section', () => {
    renderComments();
    expect(screen.getByTestId('task-comments')).toBeInTheDocument();
  });

  it('should have a comment input field', () => {
    renderComments();
    expect(screen.getByTestId('comment-input')).toBeInTheDocument();
  });

  it('should have an add comment button', () => {
    renderComments();
    expect(screen.getByTestId('add-comment-button')).toBeInTheDocument();
  });

  it('should handle API errors gracefully', async () => {
    vi.mocked(api.fetchComments).mockRejectedValue(new Error('Failed to load'));
    renderComments();
    await waitFor(() => {
      expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });
  });
});
