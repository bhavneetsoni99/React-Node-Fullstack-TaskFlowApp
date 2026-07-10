import { useCallback, useState, useEffect } from 'react';
import { useAppSelector, useTaskActions } from '../../hooks/hooks';
import { selectTaskFilter, selectTaskCounts } from '../../selectors';
import { selectUsers } from '../../selectors';
import type { TaskStatus, TaskPriority, AllTasks } from '../../types/types';
import { TASK_STATUS_OPTIONS, All_TASKS_MAP, TASK_PRIORITY_MAP, TASK_PRIORITY_OPTIONS } from '../../utils/constants';
import styles from './TaskFilter.module.scss';

const FILTER_OPTIONS = [
  { key: 'all' as AllTasks, label: All_TASKS_MAP.all },
  ...TASK_STATUS_OPTIONS,
  ...TASK_PRIORITY_OPTIONS
] as const;


export function TaskFilter() {
  const filter = useAppSelector(selectTaskFilter);
  const users = useAppSelector(selectUsers);
  const taskCounts = useAppSelector(selectTaskCounts);

  const { setFilter } = useTaskActions();
  const [localSearch, setLocalSearch] = useState(filter.searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filter.searchQuery) {
        setFilter({ searchQuery: localSearch });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setFilter, filter.searchQuery]);

  const handleStatusChange = useCallback(
    (key: TaskStatus | AllTasks | TaskPriority) => {
      if (key in TASK_PRIORITY_MAP) {
        return setFilter({ priority: key as TaskPriority });
      }
      return setFilter({ status: key as TaskStatus | AllTasks });
    },
    [setFilter]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setLocalSearch(e?.target?.value),
    []
  );

  const handleAssigneeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setFilter({ assigneeId: e?.target?.value || null }),
    [setFilter]
  );

  const activeFilterKey = filter.priority || filter.status || 'all';

  return (
    <div className={styles.filterContainer} data-testid="task-filter">
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search tasks..."
          value={localSearch}
          onChange={handleSearchChange}
          className={styles.searchInput}
          aria-label="Search tasks"
          data-testid="search-input"
        />
      </div>

      <div className={styles.filterTabs} role="radiogroup" aria-label="Filter by status or priority">
        {FILTER_OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            role="radio"
            aria-checked={activeFilterKey === key}
            onClick={() => handleStatusChange(key)}
            className={`${styles.filterTab} ${activeFilterKey === key ? styles.active : ''}`}
            data-testid={`filter-${key}`}
          >
            {label}
            <span className={styles.count} data-testid={`count-${key}`}>
              ({taskCounts[key]})
            </span>
          </button>
        ))}
      </div>

      <div className={styles.assigneeFilter}>
        <label htmlFor="assignee-filter" className={styles.visuallyHidden}>Filter by assignee</label>
        <select
          id="assignee-filter"
          value={filter.assigneeId || ''}
          onChange={handleAssigneeChange}
          className={styles.assigneeSelect}
          data-testid="assignee-filter"
        >
          <option value="">All Assignees</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
