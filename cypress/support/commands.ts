/// <reference types="cypress" />

// =====================================================
// COMMANDES PERSONNALISÉES POUR LES TESTS E2E
// =====================================================

/**
 * Commande pour se connecter
 * @param email - Email de l'utilisateur
 * @param password - Mot de passe
 */
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[formControlName="login"]').type(email);
  cy.get('input[formControlName="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

/**
 * Commande pour se connecter avec un token en localStorage
 * @param token - JWT token
 */
Cypress.Commands.add('loginViaToken', (token: string) => {
  localStorage.setItem('token', token);
  cy.visit('/students');
});

/**
 * Commande pour se déconnecter
 */
Cypress.Commands.add('logout', () => {
  cy.contains('button', /déconnexion|logout/i).click();
  cy.url().should('include', '/login');
  cy.window().then((win) => {
    expect(win.localStorage.getItem('token')).to.be.null;
  });
});

/**
 * Commande pour remplir le formulaire d'inscription
 */
Cypress.Commands.add('fillRegisterForm', (data: {
  login: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  cy.get('input[formControlName="login"]').type(data.login);
  cy.get('input[formControlName="password"]').type(data.password);
  cy.get('input[formControlName="firstName"]').type(data.firstName);
  cy.get('input[formControlName="lastName"]').type(data.lastName);
});

/**
 * Commande pour remplir le formulaire étudiant
 */
Cypress.Commands.add('fillStudentForm', (data: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
}) => {
  cy.get('input[formControlName="firstName"]').clear().type(data.firstName);
  cy.get('input[formControlName="lastName"]').clear().type(data.lastName);
  cy.get('input[formControlName="email"]').clear().type(data.email);
  if (data.dateOfBirth) {
    cy.get('input[formControlName="dateOfBirth"]').clear().type(data.dateOfBirth);
  }
  if (data.phoneNumber) {
    cy.get('input[formControlName="phoneNumber"]').clear().type(data.phoneNumber);
  }
  if (data.address) {
    cy.get('textarea[formControlName="address"]').clear().type(data.address);
  }
});

/**
 * Commande pour vérifier que la navbar contient le bouton logout
 */
Cypress.Commands.add('checkLoggedInState', () => {
  cy.window().then((win) => {
    expect(win.localStorage.getItem('token')).to.not.be.null;
  });
});

/**
 * Commande pour vérifier que la navbar affiche le bouton login
 */
Cypress.Commands.add('checkLoggedOutState', () => {
  cy.window().then((win) => {
    expect(win.localStorage.getItem('token')).to.be.null;
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      loginViaToken(token: string): Chainable<void>;
      logout(): Chainable<void>;
      fillRegisterForm(data: {
        login: string;
        password: string;
        firstName: string;
        lastName: string;
      }): Chainable<void>;
      fillStudentForm(data: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber?: string;
        address?: string;
        dateOfBirth?: string;
      }): Chainable<void>;
      checkLoggedInState(): Chainable<void>;
      checkLoggedOutState(): Chainable<void>;
    }
  }
}

export {};