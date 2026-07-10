import { memo, useMemo, useCallback, useState } from 'react';
import { useAppSelector, useTaskActions } from '../../hooks/hooks';
import { notify } from '../NotificationManager';
import { TaskStatusSelect } from '../TaskStatusSelect';
import type { TaskStatus } from '../../types/types';
import styles from './BulkActions.module.scss';
import { selectTasksSelectedIds, selectFilteredTasks, selectFilteredTaskIds } from '../../selectors';
import { VALID_TRANSITIONS } from '../../utils/constants';

const BulkActionsComponent = () => {
  const selectedTaskIds = useAppSelector(selectTasksSelectedIds);

  const filteredTasks = useAppSelector(selectFilteredTasks);
  const filteredTaskIds = useAppSelector(selectFilteredTaskIds);

  const { clearSelection, selectAllTasks, bulkDeleteTasks, bulkUpdateTasks } = useTaskActions();

  const [selectValue, setSelectValue] = useState<TaskStatus | ''>('');

  const selectedTasks = useMemo(
    () => {
      const selectedSet = new Set(selectedTaskIds);
      return filteredTasks.filter((t) => selectedSet.has(t.id));
    },
    [filteredTasks, selectedTaskIds]
  );

  const handleSelectAll = useCallback(() => {
    selectAllTasks(filteredTaskIds);
  }, [filteredTaskIds, selectAllTasks]);

  const handleClearSelection = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleBulkDelete = useCallback(() => {
    const highPriorityTasks = selectedTasks.filter((t) => t.priority === 'high');
    const deletableTasks = selectedTasks.filter((t) => t.priority !== 'high');
    const deletableIds = deletableTasks.map((t) => t.id);

    const totalSelected = selectedTasks.length;
    const highPriorityCount = highPriorityTasks.length;
    const deletingCount = deletableIds.length;
    if (deletableIds.length === 0) {
      notify.error('No tasks can be deleted', 'High priority tasks cannot be bulk deleted.');
      return;
    }
    let message = [`You have selected ${totalSelected} task${totalSelected > 1 ? 's' : ''} for deletion.`];

    if (totalSelected !== deletingCount) {
      message = [
        `You have selected ${totalSelected} task${totalSelected > 1 ? 's' : ''} for deletion.`,
        `${deletingCount} task${deletingCount > 1 ? 's' : ''} will be deleted.`,
        `${highPriorityCount} high-priority task${highPriorityCount > 1 ? 's' : ''} will be skipped. High priority tasks cannot be bulk deleted.`
      ];
    }

    notify.confirm('Confirm Delete', message).then((confirmed) => {
      confirmed && bulkDeleteTasks(deletableIds);
    })
  }, [selectedTasks, bulkDeleteTasks]);

  const handleBulkStatusChange = useCallback((status: TaskStatus) => {
    setSelectValue(status);
    let transitionNotAllowedTasks = 0;
    const updates = selectedTasks.filter((t) => {
      if (t.status === status) return false;
      const allowedTransitions = VALID_TRANSITIONS[t.status];
      if (allowedTransitions?.includes(status)) {
        return true;
      }
      transitionNotAllowedTasks++;
      return false;
    }).map(({ id }) => ({ id, status }));

    if (updates.length > 100) {
      notify.error('Too many tasks', 'You can only update up to 100 tasks at a time. Please reduce your selection and try again.');
      setSelectValue('');
      return
    }
    if (updates.length) {
      bulkUpdateTasks(updates)
    }
    if (transitionNotAllowedTasks) {
      const errorTitle = updates.length === 0 ? 'No tasks can be updated' : 'Some tasks could not be updated';
      const errorMessage = `${transitionNotAllowedTasks} task${transitionNotAllowedTasks > 1 ? 's' : ''} could not be moved to ${status} due to workflow restrictions.`;

      notify.error(errorTitle, errorMessage);
    }

    setSelectValue('');
  }, [selectedTasks, bulkUpdateTasks]);

  return (
    <div className={styles.bulkActions} data-testid="bulk-actions">
      <span className={styles.selectedCount} data-testid="selected-count">
        {selectedTaskIds.length} task(s) selected
      </span>

      <div className={styles.bulkActionButtons}>
        <button
          disabled={filteredTaskIds.length === 0}
          onClick={handleSelectAll} data-testid="select-all">
          Select All{filteredTaskIds.length > 0 ? ` (${filteredTaskIds.length})` : ''}
        </button>
        {selectedTaskIds.length > 0 && (
          <>
            <button
              onClick={handleClearSelection} data-testid="clear-selection">
              Clear Selection
            </button>

            <label data-testid="bulk-status-change">
              <span className={styles.visuallyHidden}>Change status of selected tasks</span>
              <TaskStatusSelect value={selectValue} onChange={handleBulkStatusChange}
                includePlaceholder />
            </label>

            <button
              onClick={handleBulkDelete}
              className={styles.deleteButton}
              data-testid="bulk-delete"
            >
              Delete Selected
            </button>
          </>)}
      </div>
    </div>
  );
};

export const BulkActions = memo(BulkActionsComponent);
