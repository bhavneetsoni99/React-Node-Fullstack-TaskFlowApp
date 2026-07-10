import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskFilter } from '../TaskFilter/TaskFilter';
import type { Task, User, TaskStatus, RootState } from '../../types/types';

const mockTasks: Task[] = [
    { id: '1', title: 'T1', description: '', status: 'todo', priority: 'low', assigneeId: null, dueDate: null, createdAt: '', updatedAt: '' },
    { id: '2', title: 'T2', description: '', status: 'in_progress', priority: 'medium', assigneeId: null, dueDate: null, createdAt: '', updatedAt: '' },
    { id: '3', title: 'T3', description: '', status: 'in_progress', priority: 'high', assigneeId: null, dueDate: null, createdAt: '', updatedAt: '' },
    { id: '4', title: 'T4', description: '', status: 'done', priority: 'low', assigneeId: null, dueDate: null, createdAt: '', updatedAt: '' },
];

const mockUsers: User[] = [
    { id: 'u1', name: 'Alice', email: 'alice@example.com', avatar: '' },
];

const mockSetFilter = vi.fn();

vi.mock('../../hooks/hooks', () => ({
    useAppSelector: <T,>(selector: (state: RootState) => T) => selector({
        tasks: {
            tasks: mockTasks,
            loading: false,
            error: null,
            filter: { status: 'all', searchQuery: '', assigneeId: null, priority: null },
            selectedTaskIds: [],
        },
        users: {
            users: mockUsers,
            loading: false,
        },
    }),
    useTaskActions: () => ({
        setFilter: mockSetFilter,
    }),
}));


describe('TaskFilter – taskCounts UI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render correct counts for each status tab', () => {
        render(<TaskFilter />);

        const expectedCounts: Record<TaskStatus | 'all', number> = {
            all: mockTasks.length,
            todo: 1,
            in_progress: 2,
            done: 1,
        };

        (['all', 'todo', 'in_progress', 'done'] as const).forEach((status) => {
            const btn = screen.getByTestId(`filter-${status}`);
            const countSpan = btn.querySelector('span');
            expect(countSpan).toBeInTheDocument();
            expect(countSpan?.textContent).toBe(`(${expectedCounts[status]})`);
        });
    });

    it('should call setFilter with the selected status when a tab is clicked', async () => {
        const user = userEvent.setup();
        render(<TaskFilter />);

        const doneBtn = screen.getByTestId('filter-done');
        await user.click(doneBtn);

        expect(mockSetFilter).toHaveBeenCalledTimes(1);
        expect(mockSetFilter).toHaveBeenCalledWith({ status: 'done' });
    });

    it('should update search query after debounce', async () => {
        const user = userEvent.setup();
        render(<TaskFilter />);

        const searchInput = screen.getByTestId('search-input');
        await user.type(searchInput, 'test search');

        await new Promise((r) => setTimeout(r, 400));

        expect(mockSetFilter).toHaveBeenCalledWith({ searchQuery: 'test search' });
    });
});
