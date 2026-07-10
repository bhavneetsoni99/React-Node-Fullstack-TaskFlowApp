import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from 'react';
import type { Nullable, FormState } from '../types/types';

interface TaskContextValue {
  formState: FormState;
  setFormState: (formState: FormState) => void;
}

const TaskContext = createContext<Nullable<TaskContextValue>>(null);

interface TaskProviderProps {
  children: ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const [formState, setFormState] = useState<FormState>({ isFormOpen: false, editingTask: null });

  const contextValue = useMemo(
    () => ({
      formState,
      setFormState,
    }),
    [
      formState,
      setFormState,
    ],
  );
  return (
    <TaskContext.Provider
      value={contextValue}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within TaskProvider');
  }
  return context;
}
