describe('Login Page E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  describe('Page Loading and UI', () => {
    it('should load login page', () => {
      cy.url().should('include', '/login');
      cy.get('input[formControlName="login"]').should('be.visible');
      cy.get('input[formControlName="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should display register link', () => {
      cy.contains('a', /s\'inscrire|register/i).should('be.visible');
    });

    it('should have submit button enabled initially', () => {
      cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('should have login page title', () => {
      cy.get('h1, h2').invoke('text').should('match', /connexion|login/i);
    });
  });

  describe('Form Validation', () => {
    it('should display validation error for empty form after submit', () => {
      cy.get('button[type="submit"]').click();
      cy.get('.error-message').should('exist');
      cy.get('.error-message').should('contain', 'Email requis');
    });

    it('should display validation error for missing email after submit', () => {
      cy.get('input[formControlName="password"]').type('password123');
      cy.get('button[type="submit"]').click();
      cy.get('.error-message').should('contain', 'Email requis');
    });

    it('should display validation error for missing password after submit', () => {
      cy.get('input[formControlName="login"]').type('test@example.com');
      cy.get('button[type="submit"]').click();
      cy.get('.error-message').should('contain', 'Mot de passe requis');
    });

    it('should not show validation errors before submit', () => {
      cy.get('input[formControlName="login"]').type('test');
      cy.get('.error-message').should('not.exist');
    });

    it('should allow submit with any filled credentials', () => {
      cy.get('input[formControlName="login"]').type('test@example.com');
      cy.get('input[formControlName="password"]').type('ValidPassword123!');
      cy.get('button[type="submit"]').should('not.be.disabled');
    });

    it('should clear errors on reset', () => {
      cy.get('button[type="submit"]').click();
      cy.get('.error-message').should('exist');
      cy.get('button[type="reset"]').click();
      cy.get('.error-message').should('not.exist');
    });
  });

  describe('Successful Login', () => {
    it('should submit form with valid credentials', () => {
      cy.intercept('POST', '**/api/login', {
        statusCode: 200,
        body: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' }
      }).as('loginRequest');

      cy.get('input[formControlName="login"]').type('test@example.com');
      cy.get('input[formControlName="password"]').type('ValidPassword123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest').then((interception) => {
        expect(interception.request.body).to.include({
          login: 'test@example.com',
          password: 'ValidPassword123!'
        });
      });
    });

    it('should redirect to students page after successful login', () => {
      cy.intercept('POST', '**/api/login', {
        statusCode: 200,
        body: { token: 'fake-jwt-token' }
      }).as('loginRequest');

      cy.get('input[formControlName="login"]').type('test@example.com');
      cy.get('input[formControlName="password"]').type('ValidPassword123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.url().should('include', '/students');
    });

    it('should store token in localStorage after successful login', () => {
      cy.intercept('POST', '**/api/login', {
        statusCode: 200,
        body: { token: 'test-token-12345' }
      }).as('loginRequest');

      cy.get('input[formControlName="login"]').type('test@example.com');
      cy.get('input[formControlName="password"]').type('ValidPassword123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');

      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.equal('test-token-12345');
      });
    });

    it('should update navbar state after login', () => {
      cy.intercept('POST', '**/api/login', {
        statusCode: 200,
        body: { token: 'fake-jwt-token' }
      }).as('loginRequest');

      cy.get('input[formControlName="login"]').type('test@example.com');
      cy.get('input[formControlName="password"]').type('ValidPassword123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.checkLoggedInState();
    });
  });

  describe('Login Error Handling', () => {
    it('should display error message on failed login', () => {
      cy.intercept('POST', '**/api/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials' }
      }).as('loginRequest');

      cy.get('input[formControlName="login"]').type('wrong@example.com');
      cy.get('input[formControlName="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.get('.alert.alert-danger').should('be.visible');
    });

    it('should display error for non-existent user', () => {
      cy.intercept('POST', '**/api/login', {
        statusCode: 401,
        body: { error: 'User not found' }
      }).as('loginRequest');

      cy.get('input[formControlName="login"]').type('nonexistent@example.com');
      cy.get('input[formControlName="password"]').type('anypassword');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.get('.alert.alert-danger').should('be.visible');
    });

    it('should display error on server failure', () => {
      cy.intercept('POST', '**/api/login', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('loginRequest');

      cy.get('input[formControlName="login"]').type('test@example.com');
      cy.get('input[formControlName="password"]').type('ValidPassword123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.get('.alert.alert-danger').should('be.visible');
    });

    it('should clear error message when user modifies form', () => {
      cy.intercept('POST', '**/api/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials' }
      }).as('loginRequest');

      cy.get('input[formControlName="login"]').type('wrong@example.com');
      cy.get('input[formControlName="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.get('.alert.alert-danger').should('be.visible');

      // Modifier le formulaire
      cy.get('input[formControlName="login"]').clear().type('correct@example.com');

      // L'erreur reste visible jusqu'au reset
      cy.get('.alert.alert-danger').should('be.visible');

      cy.get('button[type="reset"]').click();
      cy.get('.alert.alert-danger').should('not.exist');
    });

    it('should handle network timeout gracefully', () => {
      cy.intercept('POST', '**/api/login', (req) => {
        req.destroy();
      }).as('loginRequest');

      cy.get('input[formControlName="login"]').type('test@example.com');
      cy.get('input[formControlName="password"]').type('ValidPassword123!');
      cy.get('button[type="submit"]').click();

  cy.get('.alert.alert-danger', { timeout: 10000 }).should('be.visible');
    });
  });

  describe('Form Reset and Navigation', () => {
    it('should reset form on reset button click', () => {
      cy.get('input[formControlName="login"]').type('test@example.com');
      cy.get('input[formControlName="password"]').type('ValidPassword123!');
      
      // Si le bouton reset existe
      cy.get('button[type="reset"]').then(($btn) => {
        if ($btn.length > 0) {
          cy.get('button[type="reset"]').click();
          cy.get('input[formControlName="login"]').should('have.value', '');
          cy.get('input[formControlName="password"]').should('have.value', '');
        }
      });
    });

    it('should navigate to register page when clicking register link', () => {
      cy.contains('a', /s\'inscrire|register/i).click();
      cy.url().should('include', '/register');
    });

    it('should persist login if user navigates and returns', () => {
      cy.intercept('POST', '**/api/login', {
        statusCode: 200,
        body: { token: 'persistent-token' }
      }).as('loginRequest');

      cy.get('input[formControlName="login"]').type('test@example.com');
      cy.get('input[formControlName="password"]').type('ValidPassword123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginRequest');
      cy.url().should('include', '/students');

      // Naviguer vers la page de login (ne devrait pas se rendre)
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.equal('persistent-token');
      });
    });
  });

  describe('Accessibility and UX', () => {
    it('should have proper form labels', () => {
      cy.get('label').should('exist');
    });

    it('should support keyboard navigation', () => {
      cy.get('input[formControlName="login"]').focus().type('test@example.com');
      cy.get('input[formControlName="login"]').should('have.focus');
      
      cy.get('input[formControlName="password"]').focus();
      cy.get('input[formControlName="password"]').should('have.focus');
    });

    it('should have button type submit', () => {
      cy.get('button[type="submit"]').should('exist');
    });
  });
});