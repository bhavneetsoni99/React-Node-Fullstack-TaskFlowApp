/// <reference types="cypress" />

import './commands';

Cypress.on('uncaught:exception', () => {
  return false;
});
