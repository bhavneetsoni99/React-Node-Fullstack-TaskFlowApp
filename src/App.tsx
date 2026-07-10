import { Provider } from 'react-redux';
import { store } from './store/store';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import { TaskList } from './components/TaskList/TaskList';
import { TaskForm } from './components/TaskForm/TaskForm';
import { TaskFilter } from './components/TaskFilter/TaskFilter';
import { TaskStats } from './components/TaskStats/TaskStats';
import styles from './styles/styles.module.scss';
import { NotificationManager } from "./components/NotificationManager";

function AppContent() {
  const { setFormState } = useTaskContext();
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>TaskFlow</h1>
        <button
          onClick={() => setFormState({ isFormOpen: true, editingTask: null })}
          className={styles.createButton}
          data-testid="create-task-button"
        >
          + New Task
        </button>
      </header>

      <main id="main-content" className={styles.main}>
        <aside className={styles.sidebar}>
          <TaskStats title="Task" />
        </aside>

        <section className={styles.content}>
          <TaskFilter />
          <TaskList />
        </section>
      </main>

      <TaskForm />
    </div>
  );
}

export function App() {
  return (
    <Provider store={store}>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
      <NotificationManager />
    </Provider>
  );
}
