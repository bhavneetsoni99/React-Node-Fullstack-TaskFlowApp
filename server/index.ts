import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { mockTasks, mockUsers, mockComments } from './mockData';
import type { Task, TaskComment } from '../src/types/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let tasks = [...mockTasks];
const users = [...mockUsers];
let comments = [...mockComments];

app.get('/api/tasks', async (_req, res) => {
  await delay(500);
  res.json({ tasks });
});

app.post('/api/tasks', async (req, res) => {
  await delay(300);
  const newTask: Task = {
    ...req.body,
    id: Date.now().toString(),
    dueDate: req.body.dueDate || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  res.json({ task: newTask });
});

app.put('/api/tasks', async (req, res) => {
  await delay(200);
  const { updates } = req.body as { updates: Partial<Task>[] };
  if (!updates || !Array.isArray(updates)) {
    res.status(400).json({ error: 'Invalid request: array required' });
    return;
  }
  if (updates.length > 100) {
    res.status(400).json({ error: 'Invalid request: too many records' });
    return;
  }
  const updatedTasks: Task[] = [];
  updates.forEach(({ id, ...updateData }) => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks[index] = {
        ...tasks[index],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      updatedTasks.push(tasks[index]);
    }
  });
  res.json({ tasks: updatedTasks });
});

app.put('/api/tasks/:id', async (req, res) => {
  await delay(200);
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index !== -1) {
    tasks[index] = {
      ...tasks[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    res.json({ task: tasks[index] });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  await delay(200);
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index !== -1) {
    tasks.splice(index, 1);
    comments = comments.filter((c) => c.taskId !== req.params.id);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});

app.delete('/api/tasks', async (req, res) => {
  await delay(300);
  const { ids } = req.body as { ids: string[] };
  if (!ids || !Array.isArray(ids)) {
    res.status(400).json({ error: 'Invalid request: ids array required' });
    return;
  }
  tasks = tasks.filter((t) => !ids.includes(t.id));
  comments = comments.filter((c) => !ids.includes(c.taskId));
  res.json({ success: true, deletedCount: ids.length });
});

app.get('/api/users', async (_req, res) => {
  await delay(200);
  res.json({ users });
});

app.get('/api/tasks/:taskId/comments', async (req, res) => {
  await delay(200);
  const taskComments = comments.filter((c) => c.taskId === req.params.taskId);
  res.json({ comments: taskComments });
});

app.post('/api/tasks/:taskId/comments', async (req, res) => {
  await delay(200);
  const newComment: TaskComment = {
    id: Date.now().toString(),
    taskId: req.params.taskId,
    userId: req.body.userId,
    content: req.body.content,
    createdAt: new Date().toISOString(),
  };
  comments.push(newComment);
  res.json({ comment: newComment });
});

app.delete('/api/comments/:id', async (req, res) => {
  await delay(200);
  const index = comments.findIndex((c) => c.id === req.params.id);
  if (index !== -1) {
    comments.splice(index, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Comment not found' });
  }
});

app.post('/api/reset', async (_req, res) => {
  tasks = [...mockTasks];
  comments = [...mockComments];
  res.json({ success: true });
});

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

app.listen(Number(PORT), HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
