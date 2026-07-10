import { memo, useState, useCallback } from 'react';
import type { Task, Nullable, User, TaskStatus, TaskPriority } from '../../types/types';
import { VALID_TRANSITIONS } from '../../utils/constants';
import { TaskDueDate } from '../TaskDueDate/TaskDueDate';
import { TaskComments } from '../TaskComments/TaskComments';
import { TaskStatusSelect } from '../TaskStatusSelect';
import { useTaskContext } from '../../context/TaskContext';
import { useTaskActions } from '../../hooks/hooks';
import { notify } from '../NotificationManager';
import styles from './TaskCard.module.scss';

interface TaskCardProps {
  task: Task;
  assignee: Nullable<User>;
  isSelected?: boolean;
}

const PRIORITY_CLASSES: Record<TaskPriority, string> = {
  high: styles.priorityHigh,
  medium: styles.priorityMedium,
  low: styles.priorityLow,
};

function TaskCardComponent({ task, assignee, isSelected }: TaskCardProps) {
  const { deleteTask, updateTask, toggleTaskSelection } = useTaskActions();
  const { setFormState } = useTaskContext();
  const [showComments, setShowComments] = useState(false);

  const { id, title, description, priority, status, dueDate } = task;

  const handleEditClick = useCallback(() => {
    setFormState({
      isFormOpen: true,
      editingTask: { ...task },
    });
  }, [setFormState, task]);

  const handleDeleteClick = useCallback(() => {
    notify.confirm('Confirm Delete', 'Are you sure you want to delete this task?').then((confirmed) => {
      confirmed && deleteTask(id);
    });
  }, [deleteTask, id]);

  const handleStatusChange = useCallback((newStatus: TaskStatus) => {
    if (newStatus === status) return;

    const allowedTransitions = VALID_TRANSITIONS[status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      notify.error('Action not Allowed', [
        `Cannot move task from ${status} to ${newStatus}.`,
        `Tasks must follow the workflow: ${status === 'todo' ? 'Todo → In Progress → Done' : 'Done → In Progress → Todo'}.`
      ]);
      return;
    }
    updateTask(id, { status: newStatus });
  }, [updateTask, id, status]);

  const handleToggleClick = useCallback(() => {
    toggleTaskSelection(id);
  }, [toggleTaskSelection, id]);

  const toggleCommentsVisibility = useCallback(() => {
    setShowComments((prev) => !prev);
  }, []);

  return (
    <article className={`${styles.taskCard} ${PRIORITY_CLASSES[priority]} ${isSelected ? styles.selected : ''}`} data-testid="task-card">
      <div className={styles.taskHeader}>
        <label className={styles.taskCheckbox}>
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={handleToggleClick}
            aria-label={`Select task: ${title}`}
            data-testid={`select-task-${id}`}
          />
        </label>
        <h3 className={styles.taskTitle}>{title}</h3>
        <div className={styles.taskActions}>
          <button onClick={handleEditClick} className={styles.editButton} data-testid="edit-button">
            Edit
          </button>
          <button onClick={handleDeleteClick} className={styles.deleteButton} data-testid="delete-button">
            Delete
          </button>
        </div>
      </div>

      <p className={styles.taskDescription}>{description}</p>

      <div className={styles.taskMeta}>
        <div className={styles.statusSelector}>
          <label>Status: <TaskStatusSelect value={status} onChange={handleStatusChange} /></label>
        </div>

        {assignee && (
          <div className={styles.assignee}>
            <img src={assignee.avatar} alt={assignee.name} className={styles.avatar} />
            <span data-testid="assignee-name">{assignee.name}</span>
          </div>
        )}

        <div className={styles.priority}>
          Priority: {priority || 'Unknown'}
        </div>

        <TaskDueDate dueDate={dueDate} status={status} />
      </div>

      <div className={styles.commentsSection}>
        <button
          onClick={toggleCommentsVisibility}
          className={styles.commentsToggle}
          data-testid="comments-toggle"
        >
          {showComments ? 'Hide Comments' : 'Show Comments'}
        </button>
        {showComments && <TaskComments taskId={id} />}
      </div>
    </article>
  );
}

export const TaskCard = memo(TaskCardComponent);
