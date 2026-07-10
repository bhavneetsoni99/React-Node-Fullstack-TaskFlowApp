# TaskFlow

A task management dashboard built with React, TypeScript, Redux, and Redux Saga.

## Features

- View tasks in different states (Todo, In Progress, Done)
- Create, edit, and delete tasks
- Filter tasks by status, search query, and assignee
- View task statistics and completion rates
- Assign tasks to team members


## Tech Stack

- **Frontend**: React 18, TypeScript
- **State Management**: Redux, Redux Saga
- **Styling**: CSS Modules with SCSS
- **Build Tool**: Vite
- **Testing**: Vitest, React Testing Library, Cypress

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm ci
```

### Development

Start the mock API server:
```bash
npm run server
```

Start the development server:
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Testing

Run unit tests:
```bash
npm test
```

Run E2E tests:
```bash
npm run cypress
```

## Project Structure
src
├── api
│   └── api.ts
├── App.tsx
├── components
│   ├── BulkActions
│   │   ├── BulkActions.module.scss
│   │   ├── BulkActions.test.tsx
│   │   └── BulkActions.tsx
│   ├── NotificationManager
│   │   ├── index.ts
│   │   ├── NotificationManager.test.tsx
│   │   ├── NotificationManager.tsx
│   │   └── Notification.module.scss
│   ├── TaskCard
│   │   ├── TaskCard.module.scss
│   │   ├── TaskCard.test.tsx
│   │   └── TaskCard.tsx
│   ├── TaskComments
│   │   ├── TaskComments.module.scss
│   │   ├── TaskComments.test.tsx
│   │   └── TaskComments.tsx
│   ├── TaskDueDate
│   │   ├── TaskDueDate.module.scss
│   │   ├── TaskDueDate.test.tsx
│   │   └── TaskDueDate.tsx
│   ├── TaskFilter
│   │   ├── TaskFilter.module.scss
│   │   ├── TaskFilter.test.tsx
│   │   └── TaskFilter.tsx
│   ├── TaskForm
│   │   ├── TaskForm.module.scss
│   │   ├── TaskForm.test.tsx
│   │   └── TaskForm.tsx
│   ├── TaskList
│   │   ├── TaskList.module.scss
│   │   ├── TaskList.test.tsx
│   │   └── TaskList.tsx
│   ├── TaskStats
│   │   ├── TaskStats.module.scss
│   │   └── TaskStats.tsx
│   ├── TaskStatusSelect
│   │   ├── index.ts
│   │   └── TaskStatusSelect.tsx
│   └── tests
│       └── setup.ts
├── context
│   └── TaskContext.tsx
├── hooks
│   └── hooks.ts
├── main.tsx
├── providers
├── selectors
│   ├── index.ts
│   ├── taskSelectors.test.ts
│   ├── taskSelectors.ts
│   └── userSelectors.ts
├── store
│   ├── store.ts
│   ├── tasks
│   │   ├── taskActions.ts
│   │   ├── taskReducer.ts
│   │   └── taskSaga.ts
│   └── users
│       ├── userActions.ts
│       ├── userReducer.ts
│       └── userSaga.ts
├── styles
│   ├── _colors.scss
│   ├── global.scss
│   └── styles.module.scss
├── types
│   └── types.ts
├── utils
│   └── constants.ts
└── vite-env.d.ts

### Features Implemented

#### Due Dates
   Implemented a memoised `{dueDateLabel, style classname }` object based on the dueDate and task status

   - if no due date - return text and gray text style
   - Completed tasks (`status === 'done'`) display in normal style regardless of date
   - converted Todays Date and Due Date into time of midnight
   - compared dates with simple difference between Due Date Time and Todays Date Time in miliisecs and convert it to days (1000 ms x 60s x 60 min x 24 hrs)
      - if diff is 0 -> due today
      - if diff 1 => tomorrow 
      - if diff more than 1 -> return date 
      - catch all (-ve diff - due date has passed) - convert days to absolute number and return label with text

   - Color-coded indicators: yellow for today, blue for tomorrow, red for overdue, 
   - Added `dueDate` state and date picker input to `TaskForm.tsx`
   - Integrated `TaskDueDate` into `TaskCard.tsx`

#### Task Comments
   Implemented comment functionality in `TaskComments.tsx`:
   - Maintaining Comments as a local component state instead of the Redux (global state)
   - Fetches comments on mount via `GET /api/tasks/:taskId/comments`
   - Posts new comments via `POST /api/tasks/:taskId/comments`
   - Displays commenter name (resolved from users list, since we do not have loggedin user id defaulting to first user in the userlist), content, and formatted timestamp
   - Handles loading, error, and empty states
   - Added `fetchComments` and `createComment` methods to `api.ts`
   - Added a toggle button in `TaskCard` to show/hide comments section

#### Bulk Actions
   Implemented bulk actions in `BulkActions.tsx` with full PRD compliance:
   - Individual task selection via checkboxes on each `TaskCard`
   - "Select All" checkbox that selects/deselects all currently visible (filtered) tasks
   - Clear selection button
   - Bulk delete with confirmation dialog:
   - High-priority tasks are excluded from deletion (shows count of skipped tasks)
   - Calls `DELETE /api/tasks` bulk endpoint via saga (`bulkDeleteSaga`)
   - Bulk status change dropdown:
   - Validates each task against the PRD status transition rules
   - Skips tasks with invalid transitions and shows a summary alert
   - Added Redux actions/reducers/selectors for bulk actions (bulkUpdate, bulk delete, select all, clear all)`selectAllTasks`, `clearSelection`, `bulkDeleteSuccess`
   - Added `bulkDeleteTrigger` `bulkUpdateTrigger` sagas and `bulkDeleteTasks` and `bulkUpdateTasks` API methods
   - updated Server to support bulkUpdate methods limited to 100 tasks

### Code Organization

   Colocate test and style files within the component folders. All components live in Component Directories under `src/components/` (BulkActions, TaskCard, TaskComments, TaskDueDate, TaskFilter, TaskForm, TaskList, TaskStats, Modal) . Actions, Reducers, sagas are split into `src/store/tasks/` and `src/store/users/`. Selectors live in `src/selectors/`, utilities in `src/utils/`, and the API layer in `src/api.ts`. Below is the Folder structure


### Performance Improvements

API pagination and filtering
