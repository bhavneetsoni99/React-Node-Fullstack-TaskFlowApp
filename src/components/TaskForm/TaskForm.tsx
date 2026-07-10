import { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useTaskActions } from '../../hooks/hooks';
import { useTaskContext } from '../../context/TaskContext';
import { TaskStatusSelect } from '../TaskStatusSelect';
import type { TaskStatus, TaskPriority, Task } from '../../types/types';
import { selectUsers } from '../../selectors';
import { VALID_TRANSITIONS } from '../../utils/constants';
import styles from './TaskForm.module.scss';

export function TaskForm() {
  const users = useAppSelector(selectUsers);
  const { createTask, updateTask } = useTaskActions();
  const { formState, setFormState } = useTaskContext();
  const { isFormOpen, editingTask } = formState;

  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [assigneeError, setAssigneeError] = useState('');
  const [statusChangeError, setStatusChangeError] = useState('');
  const [dueDate, setDueDate] = useState<string>('');

  const resetForm = useCallback(() => {
    setTitle('');
    setTitleError('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setAssigneeId('');
    setAssigneeError('');
    setStatusChangeError('');
    setDueDate('');
  }, []);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setTitleError('');
      setDescription(editingTask.description);
      setStatus(editingTask.status);
      setPriority(editingTask.priority);
      setAssigneeId(editingTask.assigneeId || '');
      setAssigneeError('');
      setStatusChangeError('');
      setDueDate(editingTask.dueDate ? editingTask.dueDate.split('T')[0] : '');
    } else {
      resetForm();
    }
  }, [editingTask, resetForm]);

  const handleStatusChange = useCallback((newStatus: TaskStatus) => {
    setStatus(newStatus);

    // 1. Clears workflow validation errors dynamically the instant the user fixes the selection
    if (editingTask) {
      const allowedTransitions = VALID_TRANSITIONS[editingTask.status] || [];
      if (allowedTransitions.includes(newStatus) || editingTask.status === newStatus) {
        setStatusChangeError('');
      }
    }
  }, [editingTask]);

  const handlePriorityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value as TaskPriority;
    setPriority(newPriority);

    if (newPriority !== 'high') {
      setAssigneeError('');
    }
  }, []);

  const handleClose = useCallback(() => {
    setFormState({ isFormOpen: false, editingTask: null });
    resetForm();
  }, [setFormState, resetForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTitleError('Please enter a title for the task.');
      return;
    }

    if (editingTask) {
      const allowedTransitions = VALID_TRANSITIONS[editingTask.status] || [];
      if (status !== editingTask.status && !allowedTransitions.includes(status)) {
        setStatusChangeError(
          `Cannot move task from ${editingTask.status} to ${status}. Tasks must follow the workflow hierarchy.`
        );
        return;
      }
    }

    if (priority === 'high' && !assigneeId) {
      setAssigneeError('High priority tasks must have an assignee.');
      return;
    }

    const taskPayload: Partial<Task> = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
    };

    if (editingTask) {
      updateTask(editingTask.id, taskPayload);
    } else {
      createTask(taskPayload as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>);
    }

    handleClose();
  };

  if (!isFormOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="form-dialog-title" data-testid="task-form-modal">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 id="form-dialog-title">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
          <button onClick={handleClose} className={styles.closeButton} aria-label="Close">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={`${styles.formGroup} ${titleError ? styles.formGroupError : ''}`}>
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(''); }}
              placeholder="Enter task title"
              aria-invalid={!!titleError}
              aria-describedby={titleError ? 'title-error' : undefined}
              data-testid="form-title-input"
            />
            {titleError && <p id="title-error" className={styles.fieldError} role="alert" data-testid="form-title-error">{titleError}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
              data-testid="form-description-input"
            />
          </div>

          <div className={styles.formRow}>
            <div className={`${styles.formGroup} ${statusChangeError ? styles.formGroupError : ''}`}>
              <TaskStatusSelect
                id="status"
                value={status}
                onChange={handleStatusChange}
                testId="form-status-input"
                label="Status"
              />
              {statusChangeError && <p className={styles.fieldError} role="alert" data-testid="form-status-error">{statusChangeError}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={handlePriorityChange}
                data-testid="form-priority-input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className={`${styles.formGroup} ${assigneeError ? styles.formGroupError : ''}`}>
            <label htmlFor="assignee">Assignee</label>
            <select
              id="assignee"
              value={assigneeId}
              onChange={(e) => { setAssigneeId(e.target.value); setAssigneeError(''); }}
              aria-invalid={!!assigneeError}
              aria-describedby={assigneeError ? 'assignee-error' : undefined}
              data-testid="form-assignee-input"
            >
              <option value="">Unassigned</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            {assigneeError && <p id="assignee-error" className={styles.fieldError} role="alert" data-testid="form-assignee-error">{assigneeError}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              data-testid="form-due-date-input"
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={handleClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} data-testid="form-submit-button">
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
