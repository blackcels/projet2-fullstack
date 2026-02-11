describe('Register Page E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  describe('Page Loading and UI', () => {
    it('should load register page with all form fields', () => {
      cy.url().should('include', '/register');
      cy.get('input[formControlName="login"]').should('be.visible');
      cy.get('input[formControlName="password"]').should('be.visible');
      cy.get('input[formControlName="firstName"]').should('be.visible');
      cy.get('input[formControlName="lastName"]').should('be.visible');
      cy.get('button.btn.btn-primary').should('be.visible');
    });
  });

  describe('Form Validation', () => {
    it('should display validation error for empty form on submit', () => {
      cy.get('button.btn.btn-primary').click();
      cy.get('.invalid-feedback').should('exist');
    });

    it('should validate required fields', () => {
      cy.get('input[formControlName="login"]').focus().blur();
      cy.get('input[formControlName="password"]').focus().blur();
      cy.get('input[formControlName="firstName"]').focus().blur();
      cy.get('input[formControlName="lastName"]').focus().blur();
    });

    it('should keep user on register page when form is invalid', () => {
      cy.get('input[formControlName="login"]').type('invalid-email');
      cy.get('input[formControlName="password"]').type('123');
      cy.get('button.btn.btn-primary').click();
      cy.url().should('include', '/register');
    });
  });

  describe('Successful Registration', () => {
    it('should submit form with valid data', () => {
      cy.intercept('POST', '**/api/register', {
        statusCode: 201,
        body: { message: 'User registered successfully' }
      }).as('registerRequest');

      cy.fillRegisterForm({
        login: 'newuser@example.com',
        password: 'ValidPassword123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      cy.get('button.btn.btn-primary').click();

      cy.wait('@registerRequest').then((interception) => {
        expect(interception.request.body).to.include({
          login: 'newuser@example.com',
          firstName: 'John',
          lastName: 'Doe'
        });
      });
    });

    it('should redirect to login page after successful registration', () => {
      cy.intercept('POST', '**/api/register', {
        statusCode: 201,
        body: { message: 'User registered successfully' }
      }).as('registerRequest');

      cy.fillRegisterForm({
        login: 'another@example.com',
        password: 'ValidPassword123!',
        firstName: 'Jane',
        lastName: 'Smith'
      });

      cy.get('button.btn.btn-primary').click();

      cy.wait('@registerRequest');
      cy.url().should('include', '/login');
    });

    it('should display success message after registration', () => {
      cy.intercept('POST', '**/api/register', {
        statusCode: 201,
        body: { message: 'User registered successfully' }
      }).as('registerRequest');

      const alertStub = cy.stub();
      cy.on('window:alert', alertStub);

      cy.fillRegisterForm({
        login: 'success@example.com',
        password: 'ValidPassword123!',
        firstName: 'Success',
        lastName: 'User'
      });

      cy.get('button.btn.btn-primary').click();

      cy.wait('@registerRequest');
      cy.wrap(alertStub).should('have.been.called');
      cy.url().should('include', '/login');
    });
  });

  describe('Registration Error Handling', () => {
    it('should display error message when email already exists', () => {
      cy.intercept('POST', '**/api/register', {
        statusCode: 409,
        body: { error: 'Email already exists' }
      }).as('registerRequest');

      cy.fillRegisterForm({
        login: 'existing@example.com',
        password: 'ValidPassword123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      cy.get('button.btn.btn-primary').click();

      cy.wait('@registerRequest');
      cy.url().should('include', '/register');
    });

    it('should display validation error from server', () => {
      cy.intercept('POST', '**/api/register', {
        statusCode: 400,
        body: { error: 'Invalid data provided' }
      }).as('registerRequest');

      cy.fillRegisterForm({
        login: 'invalid@example.com',
        password: 'ValidPassword123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      cy.get('button.btn.btn-primary').click();

      cy.wait('@registerRequest');
      cy.url().should('include', '/register');
    });

    it('should display error on server failure', () => {
      cy.intercept('POST', '**/api/register', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('registerRequest');

      cy.fillRegisterForm({
        login: 'error@example.com',
        password: 'ValidPassword123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      cy.get('button.btn.btn-primary').click();

      cy.wait('@registerRequest');
      cy.url().should('include', '/register');
    });

    it('should clear error message when user corrects the form', () => {
      cy.intercept('POST', '**/api/register', {
        statusCode: 409,
        body: { error: 'Email already exists' }
      }).as('registerRequest');

      cy.fillRegisterForm({
        login: 'existing@example.com',
        password: 'ValidPassword123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      cy.get('button.btn.btn-primary').click();

      cy.wait('@registerRequest');
      cy.url().should('include', '/register');

      // Réinitialiser le formulaire
      cy.get('button[type="reset"]').click();
      cy.get('input[formControlName="login"]').should('have.value', '');
    });
  });

  describe('Form Navigation', () => {
    it('should clear form data when user navigates away and comes back', () => {
      cy.fillRegisterForm({
        login: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      cy.visit('/login');
      cy.visit('/register');

      cy.get('input[formControlName="login"]').should('have.value', '');
    });
  });
});
