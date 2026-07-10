import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useAppSelector, useTaskActions, useUserActions } from '../../hooks/hooks';
import { TaskCard } from '../TaskCard/TaskCard';
import { BulkActions } from '../BulkActions/BulkActions';
import {
  selectTasksError,
  selectTasksLoading,
  selectFilteredTasks,
  selectTasksSelectedSet,
  selectUsersSet
} from '../../selectors';
import styles from './TaskList.module.scss';
import type { Task } from '../../types/types'

const CARD_MIN_WIDTH = 300;
const GAP = 16;
const ESTIMATED_CARD_HEIGHT = 220;

function VirtualColumn({
  tasks,
  usersSet,
  selectedTaskIdsSet
}: {
  tasks: Task[];
  usersSet: any;
  selectedTaskIdsSet: any;
}) {

  const columnVirtualizer = useWindowVirtualizer({
    count: tasks.length,
    estimateSize: () => ESTIMATED_CARD_HEIGHT,
    overscan: 5,
  });

  return (
    <div
      className={styles.virtualContainer}
      style={{ height: `${columnVirtualizer.getTotalSize()}px` }}
    >
      {columnVirtualizer.getVirtualItems().map((virtualItem) => {
        const task = tasks[virtualItem.index];
        if (!task) return null;

        const assignee = task.assigneeId ? (usersSet[task.assigneeId] || null) : null;
        const isSelected = selectedTaskIdsSet.has(task.id);

        return (
          <div
            key={task.id}
            data-index={virtualItem.index}
            ref={columnVirtualizer.measureElement}
            className={styles.virtualItem}
            style={{
              transform: `translateY(${virtualItem.start}px)`,
              paddingBottom: `${GAP}px`
            }}
          >
            <TaskCard task={task} assignee={assignee} isSelected={isSelected} />
          </div>
        );
      })}
    </div>
  );
}

export function TaskList() {
  const filteredTasks = useAppSelector(selectFilteredTasks);
  const error = useAppSelector(selectTasksError);
  const loading = useAppSelector(selectTasksLoading);
  const selectedTaskIdsSet = useAppSelector(selectTasksSelectedSet);
  const usersSet = useAppSelector(selectUsersSet);

  const { fetchTasks } = useTaskActions();
  const { fetchUsers } = useUserActions();

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [fetchTasks, fetchUsers]);

  const [containerWidth, setContainerWidth] = useState(1200);
  const [isReady, setIsReady] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);

  const taskListRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (node !== null) {
      setContainerWidth(node.getBoundingClientRect().width);
      setIsReady(true);

      const observer = new ResizeObserver((entries) => {
        requestAnimationFrame(() => {
          for (const entry of entries) {
            setContainerWidth(entry.contentRect.width);
          }
        });
      });

      observer.observe(node);
      observerRef.current = observer;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const columnsCount = useMemo(
    () => Math.max(1, Math.floor(containerWidth / (CARD_MIN_WIDTH + GAP))),
    [containerWidth]
  );

  const masonryColumns = useMemo(() => {
    const columns: any[][] = Array.from({ length: columnsCount }, () => []);
    if (filteredTasks.length === 0) return columns;

    filteredTasks.forEach((task) => {
      const shortestColumn = columns.reduce(
        (shortIdx, col, currentIdx) => col.length < columns[shortIdx].length ? currentIdx : shortIdx,
        0
      );
      columns[shortestColumn].push(task);
    });

    return columns;
  }, [filteredTasks, columnsCount]);

  if (loading && filteredTasks.length === 0) {
    return <div className={styles.loading} role="status" aria-live="polite">Loading tasks...</div>;
  }

  if (error) {
    return <div className={styles.error} role="alert">{error}</div>;
  }

  return (
    <div ref={taskListRef} className={styles.taskList} data-testid="task-list">
      {filteredTasks.length === 0 ? (
        <div className={styles.emptyState} role="status">
          No tasks found. Create your first task!
        </div>
      ) : (
        <>
          <BulkActions />
          {isReady && (
            <div className={styles.virtualRowFlex} style={{ gap: `${GAP}px` }}>
              {masonryColumns.map((colTasks, colIdx) => (
                <VirtualColumn
                  key={colIdx}
                  tasks={colTasks}
                  usersSet={usersSet}
                  selectedTaskIdsSet={selectedTaskIdsSet}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
