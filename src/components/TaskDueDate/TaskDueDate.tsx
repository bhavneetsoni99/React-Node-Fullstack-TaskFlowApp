import { useMemo } from 'react';
import styles from './TaskDueDate.module.scss';

interface TaskDueDateProps {
  dueDate: string | null;
  status: string;
}

export function TaskDueDate({ dueDate, status }: TaskDueDateProps) {
  const info = useMemo(() => {
    if (!dueDate) {
      return { className: styles.noDueDate, label: 'No due date' };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();



    const due = new Date(dueDate);
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();

    const diffMs = dueDay - today;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (status === 'done') {
      return { className: styles.dueDate, label: formatDueDate(due) };
    }

    if (diffDays === 0) {
      return { className: styles.dueToday, label: 'Due today' };
    }
    if (diffDays === 1) {
      return { className: styles.dueTomorrow, label: 'Due tomorrow' };
    }
    if (diffDays > 1 && diffDays <= 7) {
      return { className: styles.dueDate, label: `Due in ${diffDays} days` };
    }
    if (diffDays > 7) {
      return { className: styles.dueDate, label: formatDueDate(due) };
    }

    const absDays = Math.abs(diffDays);
    return {
      className: styles.overdue,
      label: absDays === 1 ? '1 day overdue' : `${absDays} days overdue`,
    };
  }, [dueDate, status]);

  return <span className={info.className} data-testid="task-due-date">{info.label}</span>;
}

function formatDueDate(due: Date): string {
  const formatted = due.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `Due ${formatted}`;
}
