/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      resetTasks(): Chainable<void>;
      createTask(title: string, description?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('resetTasks', () => {
  cy.request('POST', 'http://127.0.0.1:3001/api/reset');
});

Cypress.Commands.add('createTask', (title: string, description = '') => {
  cy.get('[data-testid="create-task-button"]').click();
  cy.get('[data-testid="form-title-input"]').type(title);
  if (description) {
    cy.get('[data-testid="form-description-input"]').type(description);
  }
  cy.get('[data-testid="form-submit-button"]').click();
});

export {};
