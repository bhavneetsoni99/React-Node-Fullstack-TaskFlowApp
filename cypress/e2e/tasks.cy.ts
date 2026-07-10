/// <reference types="cypress" />
/// <reference path="../support/commands.ts" />

const mockTasks = [
  {
    id: "overdue-task-1",
    title: "Critical Overdue Database Migration",
    description: "This task must be highlighted in red.",
    status: "todo",
    priority: "high",
    dueDate: "2026-05-20",
    assigneeId: "1",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z"
  },
  {
    id: "1",
    title: "Set up project structure",
    description: "Create initial folders and files for the project.",
    status: "todo",
    priority: "high",
    dueDate: "2026-05-30",
    assigneeId: "1",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-01T00:00:00.000Z"
  },
  {
    id: "2",
    title: "Implement user authentication",
    description: "Set up JWT-based authentication for the app.",
    status: "in_progress",
    priority: "medium",
    dueDate: "2026-06-05",
    assigneeId: "2",
    createdAt: "2026-05-02T00:00:00.000Z",
    updatedAt: "2026-05-10T00:00:00.000Z"
  },
  {
    id: "3",
    title: "Design dashboard UI",
    description: "Create wireframes and mockups for the dashboard.",
    status: "done",
    priority: "low",
    dueDate: "2026-05-25",
    assigneeId: "3",
    createdAt: "2026-05-03T00:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z"
  }
];
describe('TaskFlow Application', () => {
  beforeEach(() => {
    cy.resetTasks();
    cy.intercept('GET', '/api/tasks', {
      statusCode: 200,
      body: {
        tasks: mockTasks
      }
    }).as('getMockTasks');
    cy.visit('/');
    cy.wait('@getMockTasks');
  });

  describe('Task List', () => {
    it('should display the task list on page load', () => {
      cy.get('[data-testid="task-list"]').should('be.visible');
      cy.get('[data-testid="task-card"]').its('length').should('be.gte', 1);
    });

    it('should display tasks with correct titles', () => {
      cy.contains('[data-testid="task-card"]', 'Set up project structure').should('be.visible');
      cy.contains('[data-testid="task-card"]', 'Implement user authentication').should('be.visible');
      cy.contains('[data-testid="task-card"]', 'Design dashboard UI').should('be.visible');
    });

    it('should display loading state when tasks are being fetched', () => {
      cy.intercept('GET', '/api/tasks', (req) => {
        req.on('response', (res) => {
          res.setDelay(2000); // Delay response by 2 seconds to simulate loading state
        });
      }).as('delayedFetchTasks');
      cy.visit('/');
      cy.contains('Loading tasks...').should('be.visible');
      cy.wait('@delayedFetchTasks');
      cy.contains('Loading tasks...').should('not.exist');
    });

    // TODO: Add more tests for task list functionality
    // - Test error state handling
  });

  describe('Task Creation', () => {
    const newTaskTitle = 'Test Task from E2E';
    const newTaskDescription = 'Created by Cypress test';
    it('should open the task form when clicking create button', () => {
      cy.get('[data-testid="create-task-button"]').click();
      cy.get('[data-testid="task-form-modal"]').should('be.visible');
    });


    it('should create a new task successfully', () => {
      cy.intercept('POST', '/api/tasks', {
        statusCode: 201,
        body: {
          id: 'new-task-1',
          title: newTaskTitle,
          description: newTaskDescription,
          status: 'todo',
          priority: 'medium',
          assigneeId: null,
          dueDate: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }).as('createTask');

      cy.get('[data-testid="create-task-button"]').click();
      cy.get('[data-testid="task-form-modal"]').should('be.visible');

      cy.get('[data-testid="form-title-input"]').type(newTaskTitle);
      cy.get('[data-testid="form-description-input"]').type(newTaskDescription);
      cy.get('[data-testid="form-status-input"]').select('todo');
      cy.get('[data-testid="form-priority-input"]').select('medium');

      cy.get('[data-testid="form-submit-button"]').click();
      cy.wait('@createTask').then((interception) => {
        expect(interception.request.body).to.have.property('title', newTaskTitle);
        expect(interception.request.body).to.have.property('description', newTaskDescription);
        expect(interception.request.body).to.have.property('priority', 'medium');
      });

      cy.get('[data-testid="task-form-modal"]').should('not.exist');
    });

    it('should show validation error for empty title', () => {
      cy.get('[data-testid="create-task-button"]').click();
      cy.get('[data-testid="task-form-modal"]').should('be.visible');

      cy.get('[data-testid="form-title-input"]').clear();
      cy.get('[data-testid="form-submit-button"]').click();

      cy.get('[data-testid="form-title-input"]').should('have.attr', 'aria-invalid', 'true');
      cy.contains('Please enter a title for the task.').should('be.visible');

      cy.get('[data-testid="form-title-input"]').type('New title');
      cy.get('[data-testid="form-title-input"]').should('have.attr', 'aria-invalid', 'false');
      cy.contains('Please enter a title for the task.').should('not.exist');
    });

    it('should show validation error for high priority task without assignee', () => {
      cy.get('[data-testid="create-task-button"]').click();
      cy.get('[data-testid="task-form-modal"]').should('be.visible');

      cy.get('[data-testid="form-title-input"]').type(newTaskTitle);
      cy.get('[data-testid="form-priority-input"]').select('high');

      cy.get('[data-testid="form-submit-button"]').click();

      cy.get('[data-testid="form-assignee-input"]').should('have.attr', 'aria-invalid', 'true');
      cy.contains('High priority tasks must have an assignee.').should('be.visible');

      cy.get('[data-testid="form-assignee-input"]').select('1');
      cy.get('[data-testid="form-assignee-input"]').should('have.attr', 'aria-invalid', 'false');
      cy.contains('High priority tasks must have an assignee.').should('not.exist');
    });
  });

  describe('Task Filtering', () => {
    it('should filter tasks by status', () => {
      cy.wait(500); // Wait for initial load
      cy.get('[data-testid="count-todo"]')
        .invoke('text').then((todoFilterButtonText) => {
          const statusCountTextWithTrailingBrackets = todoFilterButtonText.split('(')[1] || '0';
          const expectedCount = parseInt(statusCountTextWithTrailingBrackets);

          cy.get('[data-testid="filter-todo"]').click();
          // only showing the cards that matches the todo number
          cy.get('[data-testid="task-card"]').should('have.length', expectedCount);
        });
    });

    it('should filter tasks by search query', () => {
      cy.get('[data-testid="search-input"]').type('Implement user authentication{enter}');
      cy.wait(500); // Wait for debounce
      cy.get('[data-testid="task-card"]').should('have.length', 1);

      cy.get('[data-testid="search-input"]').clear().type('this-title-does-not-exist{enter}');
      cy.wait(500); // Wait for debounce
      cy.get('[data-testid="task-card"]').should('have.length', 0);
    });

    it('should filter tasks by assignee', () => {
      cy.get('[data-testid="assignee-filter"]').then(($select) => {
        const firstOption = $select.find('option:not([value=""])').first();

        const assigneeId = firstOption.val();
        const assigneeName = firstOption.text().trim();
        if (assigneeId) {
          cy.wrap($select).select(assigneeId);
          cy.wrap($select).should('have.value', assigneeId);
          cy.get('[data-testid="task-card"]').each(($card) => {
            cy.wrap($card).find('[data-testid="assignee-name"]')
              .should('contain.text', assigneeName);
          });
        }
      });
    });
    it('should display priority border colors on task cards', () => {
      cy.get('[data-testid="task-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="assignee-name"]');
        const priorityText = $card.text();
        const borderColor = $card.css('border-left-color');
        const isValidColor = borderColor === 'rgb(239, 68, 68)' ||
          borderColor === 'rgb(245, 158, 11)' ||
          borderColor === 'rgb(34, 197, 94)';
        expect(isValidColor, `Card "${priorityText.slice(0, 30)}..." has valid priority color`).to.be.true;
      });
    });


  });

  describe('Task Actions', () => {
    it('should edit a task', () => {
      cy.intercept('PUT', '/api/tasks/*', {
        statusCode: 200,
        body: { task: { id: '1', title: 'Updated Project', status: 'todo', priority: 'high', assigneeId: '1', dueDate: null, createdAt: '2026-05-01T00:00:00.000Z', updatedAt: new Date().toISOString() } }
      }).as('updateTask');

      cy.get('[data-testid="edit-button"]').first().click();
      cy.get('[data-testid="task-form-modal"]').should('be.visible');

      cy.get('[data-testid="form-title-input"]').clear().type('Updated Project');
      cy.get('[data-testid="form-submit-button"]').click();

      cy.wait('@updateTask').then((interception) => {
        expect(interception.request.body).to.have.property('title', 'Updated Project');
      });
      cy.get('[data-testid="task-form-modal"]').should('not.exist');
    });

    it('should delete a task', () => {
      cy.intercept('DELETE', '/api/tasks/*', {
        statusCode: 200,
        body: { success: true }
      }).as('deleteTask');

      cy.get('[data-testid="delete-button"]').first().click();
      cy.get('[data-testid="confirm-button"]').click();

      cy.wait('@deleteTask').then((interception) => {
        expect(interception.response?.statusCode).to.equal(200);
      });
    });

    it('should change task status', () => {
      cy.intercept('PUT', '/api/tasks/*', {
        statusCode: 200,
        body: { task: { id: '1', title: 'Set up project structure', status: 'in_progress', priority: 'high', assigneeId: '1', dueDate: null, createdAt: '2026-05-01T00:00:00.000Z', updatedAt: new Date().toISOString() } }
      }).as('updateTaskStatus');

      cy.get('[data-testid="task-status-select"]').first().select('in_progress');
      cy.wait('@updateTaskStatus').then((interception) => {
        expect(interception.request.body).to.have.property('status', 'in_progress');
      });
    });
  });

  describe('Task Statistics', () => {
    it('should display task statistics', () => {
      cy.get('[data-testid="task-stats"]').should('be.visible');
    });

    it('should show correct task counts', () => {
      cy.get('[data-testid="task-stats"]').within(() => {
        cy.get('[data-testid="all-tasks"]').should('have.text', '4');
        cy.get('[data-testid="todo-tasks"]').should('have.text', '2');
        cy.get('[data-testid="in-progress-tasks"]').should('have.text', '1');
        cy.get('[data-testid="done-tasks"]').should('have.text', '1');
        cy.get('[data-testid="completion-rate"]').should('have.text', '25%');
        cy.get('[data-testid="high-priority-tasks"]').should('have.text', '2');
      });
    });

    it('should keep stats visible after viewport change', () => {
      cy.viewport(760, 800); //compact layout
      cy.get('[data-testid="stats-grid"]')
        .should('have.css', 'grid-template-columns')
        .then((compactGridColumns) => {
          const columns = compactGridColumns.trim().split('px)')
          expect(columns).to.lengthOf(1);
        });

      cy.viewport(800, 800); //expanded layout
      cy.get('[data-testid="stats-grid"]')
        .should('have.css', 'grid-template-columns')
        .then((expandedGridColumns) => {
          const columns = expandedGridColumns.trim().split('px)')
          expect(columns).to.lengthOf(1);
        });
    });
  });

  /**
   * FEATURE: Due Dates
   *
   * These tests should be implemented after completing the TaskDueDate component.
   * The feature should display due dates and visually indicate overdue tasks.
   */
  describe('Due Dates (FEATURE)', () => {
    beforeEach(() => {
      cy.clock(Date.parse('2026-05-25'), ['Date']);
      cy.visit('/');
    });

    it('should display due dates on task cards', () => {
      cy.get('[data-testid="task-card"]').first().within(() => {
        cy.get('[data-testid="task-due-date"]').should('be.visible');
      });
    });

    it('should highlight overdue tasks', () => {
      cy.get('[data-testid="task-card"]').first()
        .within(() => {
          cy.get('[data-testid="task-due-date"]')
            .should('have.text', '5 days overdue')
            .should('have.attr', 'class')
            .and('match', /overdue/);
        });
    });

    it('should allow setting due date when creating task', () => {
      cy.intercept('POST', '/api/tasks', {
        statusCode: 201,
        body: { task: { id: 'new-task', title: 'Task with due date', description: '', status: 'todo', priority: 'medium', assigneeId: null, dueDate: '2026-06-15', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } }
      }).as('createTaskWithDueDate');

      cy.get('[data-testid="create-task-button"]').click();
      cy.get('[data-testid="task-form-modal"]').should('be.visible');

      cy.get('[data-testid="form-title-input"]').type('Task with due date');
      cy.get('[data-testid="form-due-date-input"]').type('2026-06-15');
      cy.get('[data-testid="form-submit-button"]').click();

      cy.wait('@createTaskWithDueDate').then((interception) => {
        expect(interception.request.body).to.have.property('dueDate', '2026-06-15');
      });
      cy.get('[data-testid="task-form-modal"]').should('not.exist');
    });
  });

  /**
   * FEATURE: Task Comments
   *
   * These tests should be implemented after completing the TaskComments component.
   * The feature should allow viewing and adding comments to tasks.
   */
  describe('Task Comments (FEATURE)', () => {
    it('should display comments section on task detail', () => {
      cy.intercept('GET', '/api/tasks/*/comments', {
        statusCode: 200,
        body: { comments: [] }
      }).as('getComments');

      cy.get('[data-testid="comments-toggle"]').first().click();
      cy.get('[data-testid="task-comments"]').should('be.visible');
      cy.contains('No comments yet').should('be.visible');
    });

    it('should add a new comment to a task', () => {
      cy.intercept('GET', '/api/tasks/*/comments', {
        statusCode: 200,
        body: { comments: [] }
      }).as('getComments');

      cy.intercept('POST', '/api/tasks/*/comments', {
        statusCode: 201,
        body: { comment: { id: 'new-comment', taskId: '1', userId: '1', content: 'Great work!', createdAt: new Date().toISOString() } }
      }).as('createComment');

      cy.get('[data-testid="comments-toggle"]').first().click();
      cy.get('[data-testid="task-comments"]').should('be.visible');

      cy.get('[data-testid="comment-input"]').type('Great work!');
      cy.get('[data-testid="add-comment-button"]').click();

      cy.wait('@createComment').then((interception) => {
        expect(interception.request.body).to.have.property('content', 'Great work!');
      });
      cy.contains('Great work!').should('be.visible');
    });

    it('should show commenter name and timestamp', () => {
      cy.intercept('GET', '/api/tasks/*/comments', {
        statusCode: 200,
        body: {
          comments: [
            { id: 'c1', taskId: '2', userId: '1', content: 'Started working on this.', createdAt: '2026-05-25T10:00:00.000Z' },
            { id: 'c2', taskId: '2', userId: '2', content: 'Looks good!', createdAt: '2026-05-26T14:30:00.000Z' }
          ]
        }
      }).as('getComments');

      cy.get('[data-testid="comments-toggle"]').eq(1).click();
      cy.get('[data-testid="task-comments"]').should('be.visible');

      cy.contains('Started working on this.').should('be.visible');
      cy.contains('Looks good!').should('be.visible');
      cy.contains('May 25').should('be.visible');
      cy.contains('May 26').should('be.visible');
    });
  });

  /**
   * FEATURE: Bulk Actions
   *
   * These tests should be implemented after completing the BulkActions component.
   * The feature should allow selecting multiple tasks and performing bulk operations.
   */
  describe('Bulk Actions (FEATURE)', () => {
    const clearSelectionSelector = '[data-testid="clear-selection"]';
    const bulkStatusSelector = '[data-testid="bulk-status-change"] select';
    const bulkDeleteSelector = '[data-testid="bulk-delete"]';
    const notificationContainer = '[data-testid="notification-container"]';

    beforeEach(() => {
      cy.resetTasks();
      cy.intercept('PUT', '/api/tasks').as('bulkUpdateNetwork');
      cy.intercept('DELETE', '/api/tasks').as('bulkDeleteNetwork');
    });

    it('should allow selecting multiple tasks', () => {
      cy.get('[data-testid="bulk-actions"]').should('be.visible');
      cy.get('[data-testid^="select-task-"]').first().click();
      cy.get('[data-testid^="select-task-"]').first().should('be.checked');
      cy.get('[data-testid="task-card"]').first()
        .should('have.attr', 'class')
        .and('match', /selected/);
      cy.get('[data-testid="selected-count"]').should('have.text', '1 task(s) selected');
      cy.get('[data-testid^="select-task-"]').eq(1).click();
      cy.get('[data-testid^="select-task-"]').eq(1).should('be.checked');
      cy.get('[data-testid="task-card"]').eq(1)
        .should('have.attr', 'class')
        .and('match', /selected/);
      cy.get('[data-testid="selected-count"]').should('have.text', '2 task(s) selected');
    });

    it('should bulk delete selected tasks and show confirmation notification', () => {
      cy.get('[data-testid^="select-task-"]').eq(2).click();
      cy.get('[data-testid^="select-task-"]').eq(3).click();
      cy.get(bulkDeleteSelector).click();
      cy.get(notificationContainer).within(() => {
        cy.get('[data-testid="modal-overlay"]').should('be.visible');
        cy.get('[data-testid="confirm-button"]').click();
      });
      cy.wait('@bulkDeleteNetwork').then((interception) => {
        expect(interception.request.body).to.have.property('ids');
        expect(interception.request.body.ids).to.include.members(['2', '3']);
      });
      cy.get('[data-testid="task-card"]').should('have.length', 2);
      cy.get('[data-testid="selected-count"]').should('have.text', '0 task(s) selected');
    });

    it('should bulk change status of selected tasks', () => {
      cy.get('[data-testid^="select-task-"]').eq(0).click();
      cy.get('[data-testid^="select-task-"]').eq(1).click();

      cy.get(bulkStatusSelector).select('in_progress');
      cy.wait('@bulkUpdateNetwork').then((interception) => {
        expect(interception.request.body.updates).to.be.an('array');
        expect(interception.request.body.updates[0]).to.have.property('status', 'in_progress');
      });
      cy.get('[data-testid="task-card"]').eq(0).should('contain.text', 'In Progress');
      cy.get('[data-testid="task-card"]').eq(1).should('contain.text', 'In Progress');

    });

    it('should clear selection when clear button is clicked', () => {
      cy.get('[data-testid^="select-task-"]').eq(0).click();
      cy.get('[data-testid^="select-task-"]').eq(1).click();
      cy.get(clearSelectionSelector).click();
      cy.get('[data-testid^="select-task-"]').eq(0).should('not.be.checked');
      cy.get('[data-testid^="select-task-"]').eq(1).should('not.be.checked');
      cy.get('[data-testid="task-card"]').eq(0)
        .should('have.attr', 'class')
        .and('not.match', /selected/);
      cy.get('[data-testid="task-card"]').eq(1)
        .should('have.attr', 'class')
        .and('not.match', /selected/);

      cy.get('[data-testid="selected-count"]').should('have.text', '0 task(s) selected');
      cy.get(clearSelectionSelector).should('not.exist');
    });

    it('should intercept disallowed transition and show alerts', () => {
      cy.get('[data-testid^="select-task-"]').first().click();
      cy.get(bulkStatusSelector).select('done');

      cy.get(notificationContainer).within(() => {
        cy.get('[data-testid="modal-overlay"]').should('be.visible');
        cy.contains('h2', 'No tasks can be updated').should('be.visible');
        cy.contains('p', 'could not be moved to done due to workflow restrictions').should('be.visible');

        cy.get('button').contains('OK').click();
      });
      cy.get('[data-testid="modal-overlay"]').should('not.exist');
    });

    it('should intercept deleting high priority tasks and show alerts', () => {
      cy.get('[data-testid^="select-task-"]').first().click();
      cy.get(bulkDeleteSelector).click();

      cy.get(notificationContainer).within(() => {
        cy.get('[data-testid="modal-overlay"]').should('be.visible');
        cy.contains('h2', 'No tasks can be deleted').should('be.visible');
        cy.contains('p', 'High priority tasks cannot be bulk deleted').should('be.visible');

        cy.get('button').contains('OK').click();
      });
      cy.get('[data-testid="modal-overlay"]').should('not.exist');
    });

    it('should skip deleting high priority tasks, show alert and delete others', () => {
      cy.get('[data-testid^="select-task-"]').first().click();
      cy.get('[data-testid^="select-task-"]').eq(2).click();

      cy.get(bulkDeleteSelector).click();

      cy.get(notificationContainer).within(() => {
        cy.get('[data-testid="modal-overlay"]').should('be.visible');
        cy.contains('li', '1 high-priority task will be skipped').should('be.visible');

        cy.get('button').contains('Confirm').click();
      });
      cy.wait('@bulkDeleteNetwork').then((interception) => {
        expect(interception.request.body).to.have.property('ids');
        expect(interception.request.body.ids).lengthOf(1);
      });
      cy.get('[data-testid="task-card"]').should('have.length', 3);
    });
  });
});
