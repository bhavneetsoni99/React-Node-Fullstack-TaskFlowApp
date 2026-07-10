import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskDueDate } from '../TaskDueDate/TaskDueDate';

// Tests that don't depend on specific relative dates
describe('TaskDueDate', () => {
  it('should show "No due date" when dueDate is null', () => {
    render(<TaskDueDate dueDate={null} status="todo" />);
    expect(screen.getByText('No due date')).toBeInTheDocument();
    expect(screen.getByTestId('task-due-date').className).toMatch(/noDueDate/);
  });

  it('should render without crashing', () => {
    render(<TaskDueDate dueDate={null} status="todo" />);
    expect(screen.getByText(/no due date/i)).toBeInTheDocument();
  });

  it('should show formatted date when due date is provided', () => {
    render(<TaskDueDate dueDate="2026-12-25T00:00:00.000Z" status="todo" />);
    expect(screen.getByText(/^Due /)).toBeInTheDocument();
  });

  it('should not show overdue styling for completed tasks', () => {
    render(<TaskDueDate dueDate="2020-01-01T00:00:00.000Z" status="done" />);
    expect(screen.getByTestId('task-due-date').className).not.toMatch(/overdue/);
    expect(screen.getByTestId('task-due-date').className).toMatch(/dueDate/);
  });

  it('should show formatted date for completed tasks with a past due', () => {
    render(<TaskDueDate dueDate="2020-01-01T00:00:00.000Z" status="done" />);
    expect(screen.getByText(/^Due /)).toBeInTheDocument();
  });
});
