describe('Navigation and Navbar E2E Tests', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/students', {
      statusCode: 200,
      body: [
        { id: 1, firstName: 'Jean', lastName: 'Dupont', email: 'jean@example.com', phoneNumber: '06 12 34 56 78' }
      ]
    }).as('getStudents');
  });

  it('should display navbar on login page', () => {
    cy.visit('/login');
    cy.get('app-navbar').should('be.visible');
  });

  it('should show app title in navbar', () => {
    cy.visit('/login');
    cy.contains('Gestion Étudiants').should('be.visible');
  });

  describe('Navbar Display - Not Logged In', () => {
    it('should hide students and logout buttons when not logged in', () => {
      cy.visit('/login');
      cy.contains('button', 'Étudiants').should('not.exist');
      cy.contains('button', 'Déconnexion').should('not.exist');
    });
  });

  describe('Navbar Display - Logged In', () => {
    beforeEach(() => {
      cy.loginViaToken('test-token');
      cy.wait('@getStudents');
    });

    it('should show students and logout buttons', () => {
      cy.contains('button', 'Étudiants').should('be.visible');
      cy.contains('button', 'Déconnexion').should('be.visible');
    });

    it('should navigate to students page when clicking students button', () => {
      cy.contains('button', 'Étudiants').click();
      cy.url().should('include', '/students');
    });
  });

  describe('Logout Functionality', () => {
    beforeEach(() => {
      cy.loginViaToken('test-token');
      cy.wait('@getStudents');
    });

    it('should logout when clicking logout button', () => {
      cy.contains('button', 'Déconnexion').click();
      cy.url().should('include', '/login');
    });

    it('should clear token from localStorage on logout', () => {
      cy.contains('button', 'Déconnexion').click();

      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing students page without token', () => {
      cy.visit('/students');
      cy.url().should('include', '/login');
    });

    it('should redirect to login when accessing form page without token', () => {
      cy.visit('/students/new');
      cy.url().should('include', '/login');
    });

    it('should redirect to login when accessing edit page without token', () => {
      cy.visit('/students/edit/1');
      cy.url().should('include', '/login');
    });

    it('should allow access to students page with valid token', () => {
      cy.loginViaToken('test-token');
      cy.wait('@getStudents');
      cy.url().should('include', '/students');
    });
  });
});
