import type { Task, User, TaskComment, TaskStatus, TaskPriority } from '../src/types/types';

// Helper function to generate dates relative to today
function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

const GENERATED_TASK_COUNT = 10_000;

const statuses: TaskStatus[] = ['todo', 'in_progress', 'done'];
const priorities: TaskPriority[] = ['low', 'medium', 'high'];
const titlePrefixes = [
  'Refactor',
  'Investigate',
  'Document',
  'Migrate',
  'Review',
  'Profile',
  'Harden',
  'Ship',
  'Polish',
  'Audit',
];
const titleSubjects = [
  'billing pipeline',
  'auth middleware',
  'search indexing',
  'mobile onboarding',
  'feature flag rollout',
  'cache layer',
  'report generator',
  'notification queue',
  'admin dashboard',
  'upload service',
];

function generateTask(index: number): Task {
  const id = `gen-${index}`;
  const status = statuses[index % statuses.length];
  const priority = priorities[index % priorities.length];
  const assigneeId = index % 5 === 0 ? null : String((index % 4) + 1);
  const dueOffset = ((index * 7) % 60) - 10;
  const createdOffset = -((index * 3) % 30) - 1;
  const updatedOffset = createdOffset + ((index % 3) + 1);
  const subject = titleSubjects[(index * 3) % titleSubjects.length];
  const title = `${titlePrefixes[index % titlePrefixes.length]} ${subject} #${index}`;

  return {
    id,
    title,
    description: `Work item covering the ${subject}.`,
    status,
    priority,
    assigneeId,
    dueDate: index % 7 === 0 ? null : daysFromNow(dueOffset),
    createdAt: daysFromNow(createdOffset),
    updatedAt: daysFromNow(updatedOffset),
  };
}

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
  },
  {
    id: '3',
    name: 'Carol Williams',
    email: 'carol@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
  },
  {
    id: '4',
    name: 'David Brown',
    email: 'david@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
  },
];

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Set up project structure',
    description: 'Create the initial project structure with all necessary configurations.',
    status: 'done',
    priority: 'high',
    assigneeId: '1',
    dueDate: daysFromNow(8),
    createdAt: daysFromNow(-4),
    updatedAt: daysFromNow(-3),
  },
  {
    id: '2',
    title: 'Implement user authentication',
    description: 'Add login and registration functionality with JWT tokens.',
    status: 'in_progress',
    priority: 'high',
    assigneeId: '2',
    dueDate: daysFromNow(32),
    createdAt: daysFromNow(-3),
    updatedAt: daysFromNow(-2),
  },
  {
    id: '3',
    title: 'Design dashboard UI',
    description: 'Create wireframes and mockups for the main dashboard interface.',
    status: 'todo',
    priority: 'medium',
    assigneeId: '3',
    dueDate: daysFromNow(-2), // Overdue task
    createdAt: daysFromNow(-5),
    updatedAt: daysFromNow(-5),
  },
  {
    id: '4',
    title: 'Write API documentation',
    description: 'Document all API endpoints using OpenAPI specification.',
    status: 'todo',
    priority: 'low',
    assigneeId: null,
    dueDate: null,
    createdAt: daysFromNow(-2),
    updatedAt: daysFromNow(-2),
  },
  {
    id: '5',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment.',
    status: 'in_progress',
    priority: 'medium',
    assigneeId: '4',
    dueDate: daysFromNow(36),
    createdAt: daysFromNow(-1),
    updatedAt: daysFromNow(-1),
  },
  {
    id: '6',
    title: 'Add unit tests',
    description: 'Write comprehensive unit tests for all utility functions.',
    status: 'todo',
    priority: 'high',
    assigneeId: '1',
    dueDate: daysFromNow(-4), // Overdue task
    createdAt: daysFromNow(-7),
    updatedAt: daysFromNow(-7),
  },
  {
    id: '7',
    title: 'Optimize database queries',
    description: 'Review and optimize slow database queries identified in performance testing.',
    status: 'done',
    priority: 'medium',
    assigneeId: '2',
    dueDate: daysFromNow(3),
    createdAt: daysFromNow(-5),
    updatedAt: daysFromNow(-4),
  },
  {
    id: '8',
    title: 'Implement search functionality',
    description: 'Add full-text search capability for tasks with filters.',
    status: 'todo',
    priority: 'medium',
    assigneeId: '3',
    dueDate: daysFromNow(42),
    createdAt: daysFromNow(0),
    updatedAt: daysFromNow(0),
  },
  ...Array.from({ length: GENERATED_TASK_COUNT }, (_, i) => generateTask(i + 1)),
];

export const mockComments: TaskComment[] = [
  {
    id: '1',
    taskId: '2',
    userId: '1',
    content: 'Started working on the JWT implementation. Should be done by EOD.',
    createdAt: daysFromNow(-2),
  },
  {
    id: '2',
    taskId: '2',
    userId: '2',
    content: 'Thanks! Let me know if you need help with the refresh token logic.',
    createdAt: daysFromNow(-2),
  },
  {
    id: '3',
    taskId: '5',
    userId: '4',
    content: 'CI pipeline is set up. Working on CD now.',
    createdAt: daysFromNow(-1),
  },
];
