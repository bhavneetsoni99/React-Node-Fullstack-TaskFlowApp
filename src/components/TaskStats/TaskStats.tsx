import { useAppSelector } from '../../hooks/hooks';
import styles from './TaskStats.module.scss';
import { selectTaskCounts } from '../../selectors';

interface TaskStatsProps {
  title?: string;
}

export function TaskStats({ title = '' }: TaskStatsProps) {
  const stats = useAppSelector(selectTaskCounts);

  const completionRate = stats.all > 0
    ? Math.round((stats.done / stats.all) * 100)
    : 0;

  const trimmedTitle = title.trim();
  const displayTitle = trimmedTitle ? `${trimmedTitle} Statistics` : 'Statistics';


  return (
    <div className={`${styles.statsContainer}`} data-testid="task-stats">
      <h2 className={styles.statsTitle}>{displayTitle}</h2>

      <div className={styles.statsGrid} data-testid="stats-grid">
        <div className={styles.statCard}>
          <div className={styles.statValue} aria-label={`${stats.all} total tasks`} data-testid="all-tasks" >{stats.all}</div>
          <div className={styles.statLabel}>Total Tasks</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue} aria-label={`${stats.todo} tasks to do`} data-testid="todo-tasks" >{stats.todo}</div>
          <div className={styles.statLabel}>To Do</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue} aria-label={`${stats.in_progress} tasks in progress`} data-testid="in-progress-tasks" >{stats.in_progress}</div>
          <div className={styles.statLabel}>In Progress</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue} aria-label={`${stats.done} tasks completed`} data-testid="done-tasks" >{stats.done}</div>
          <div className={styles.statLabel}>Completed</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue} aria-label={`${completionRate} percent completion rate`} data-testid="completion-rate" >{completionRate}%</div>
          <div className={styles.statLabel}>Completion Rate</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue} aria-label={`${stats.high} high priority tasks`} data-testid="high-priority-tasks" >{stats.high}</div>
          <div className={styles.statLabel}>High Priority</div>
        </div>
      </div>
    </div>
  );
}
