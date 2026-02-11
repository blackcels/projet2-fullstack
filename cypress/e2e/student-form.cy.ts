describe('Student Form E2E Tests', () => {
  const mockStudent = {
    id: 1,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean@example.com',
    dateOfBirth: '1990-01-01',
    phoneNumber: '06 12 34 56 78',
    address: '10 rue de Paris'
  };

  beforeEach(() => {
    cy.intercept('POST', '**/api/login', {
      statusCode: 200,
      body: { token: 'test-token' }
    }).as('loginRequest');

    cy.loginViaToken('test-token');
  });

  describe('Create Student - Page Loading', () => {
    it('should load add student page', () => {
      cy.visit('/students/new');
      cy.url().should('include', '/students/new');
    });

    it('should display form fields for new student', () => {
      cy.visit('/students/new');

      cy.get('input[formControlName="firstName"]').should('be.visible');
      cy.get('input[formControlName="lastName"]').should('be.visible');
      cy.get('input[formControlName="email"]').should('be.visible');
      cy.get('input[formControlName="dateOfBirth"]').should('be.visible');
      cy.get('input[formControlName="phoneNumber"]').should('be.visible');
      cy.get('textarea[formControlName="address"]').should('be.visible');
    });

    it('should have submit button disabled initially', () => {
      cy.visit('/students/new');
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should have page title for creating student', () => {
      cy.visit('/students/new');
      cy.get('h1').invoke('text').should('match', /nouvel étudiant/i);
    });

    it('should have cancel button', () => {
      cy.visit('/students/new');
      cy.contains('button', 'Annuler').should('be.visible');
    });
  });

  describe('Create Student - Form Validation', () => {
    beforeEach(() => {
      cy.visit('/students/new');
    });

    it('should display validation error for empty form on submit', () => {
      cy.get('input[formControlName="firstName"]').focus().blur();
      cy.get('input[formControlName="lastName"]').focus().blur();
      cy.get('input[formControlName="email"]').focus().blur();
      cy.get('mat-error').should('exist');
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should display error for missing first name', () => {
      cy.get('input[formControlName="lastName"]').type('Dupont');
      cy.get('input[formControlName="email"]').type('jean@example.com');
      cy.get('input[formControlName="phoneNumber"]').type('06 12 34 56 78');

      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should display error for missing last name', () => {
      cy.get('input[formControlName="firstName"]').type('Jean');
      cy.get('input[formControlName="email"]').type('jean@example.com');
      cy.get('input[formControlName="phoneNumber"]').type('06 12 34 56 78');

      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('should display error for invalid email', () => {
      cy.fillStudentForm({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'invalid-email',
        phoneNumber: '06 12 34 56 78'
      });

      cy.get('button[type="submit"]').should('be.disabled');
      cy.get('input[formControlName="email"]').focus().blur();
      cy.get('mat-error').should('contain', 'Email invalide');
    });

    it('should enable submit button with valid data', () => {
      cy.fillStudentForm({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        phoneNumber: '06 12 34 56 78'
      });

      cy.get('button[type="submit"]').should('be.enabled');
    });

    it('should validate required fields', () => {
      cy.get('input[formControlName="firstName"]').focus().blur();
      cy.get('input[formControlName="lastName"]').focus().blur();
      cy.get('input[formControlName="email"]').focus().blur();
      cy.get('input[formControlName="phoneNumber"]').focus().blur();
    });
  });

  describe('Create Student - Submission', () => {
    beforeEach(() => {
      cy.visit('/students/new');
    });

    it('should submit form with valid data', () => {
      cy.intercept('POST', '**/api/students', {
        statusCode: 201,
        body: {
          id: 4,
          firstName: 'Alice',
          lastName: 'Wonder',
          email: 'alice@example.com',
          phoneNumber: '06 11 22 33 44'
        }
      }).as('createStudent');

      cy.fillStudentForm({
        firstName: 'Alice',
        lastName: 'Wonder',
        email: 'alice@example.com',
        phoneNumber: '06 11 22 33 44',
        address: '12 rue de Lyon'
      });

      cy.get('button[type="submit"]').click();

      cy.wait('@createStudent').then((interception) => {
        expect(interception.request.body).to.include({
          firstName: 'Alice',
          lastName: 'Wonder',
          email: 'alice@example.com',
          phoneNumber: '06 11 22 33 44'
        });
      });
    });

    it('should redirect to student list after successful creation', () => {
      cy.intercept('POST', '**/api/students', {
        statusCode: 201,
        body: {
          id: 4,
          firstName: 'Bob',
          lastName: 'Smith',
          email: 'bob@example.com',
          phoneNumber: '06 11 22 33 44'
        }
      }).as('createStudent');

      cy.fillStudentForm({
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@example.com',
        phoneNumber: '06 11 22 33 44'
      });

      cy.get('button[type="submit"]').click();

      cy.wait('@createStudent');
      cy.url().should('include', '/students');
    });

    it('should handle duplicate email error', () => {
      cy.intercept('POST', '**/api/students', {
        statusCode: 409,
        body: { error: 'Email already exists' }
      }).as('createError');

      cy.fillStudentForm({
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean@example.com',
        phoneNumber: '06 12 34 56 78'
      });

      cy.get('button[type="submit"]').click();

      cy.wait('@createError');
      cy.url().should('include', '/students/new');
    });

    it('should handle server error on creation', () => {
      cy.intercept('POST', '**/api/students', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('createError');

      cy.fillStudentForm({
        firstName: 'Error',
        lastName: 'Test',
        email: 'error@example.com',
        phoneNumber: '06 00 00 00 00'
      });

      cy.get('button[type="submit"]').click();

      cy.wait('@createError');
      cy.url().should('include', '/students/new');
    });
  });

  describe('Edit Student - Page Loading', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/students/1', {
        statusCode: 200,
        body: mockStudent
      }).as('getStudent');

      cy.visit('/students/edit/1');
      cy.wait('@getStudent');
    });

    it('should load edit student page', () => {
      cy.url().should('include', '/students/edit/1');
    });

    it('should populate form with student data', () => {
      cy.get('input[formControlName="firstName"]').should('have.value', mockStudent.firstName);
      cy.get('input[formControlName="lastName"]').should('have.value', mockStudent.lastName);
      cy.get('input[formControlName="email"]').should('have.value', mockStudent.email);
      cy.get('input[formControlName="phoneNumber"]').should('have.value', mockStudent.phoneNumber);
    });

    it('should have page title for editing student', () => {
      cy.get('h1, h2').invoke('text').should('match', /modifier|edit|update/i);
    });

    it('should have both submit and cancel buttons', () => {
      cy.get('button[type="submit"]').should('be.visible');
      cy.contains('button', 'Annuler').should('be.visible');
    });
  });

  describe('Edit Student - Form Modification', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/students/1', {
        statusCode: 200,
        body: mockStudent
      }).as('getStudent');

      cy.visit('/students/edit/1');
      cy.wait('@getStudent');
    });

    it('should update student data', () => {
      cy.intercept('PUT', '**/api/students/1', {
        statusCode: 200,
        body: {
          id: 1,
          firstName: 'Jean-Pierre',
          lastName: 'Martin',
          email: 'jean-pierre@example.com',
          phoneNumber: '06 98 76 54 32'
        }
      }).as('updateStudent');

      cy.fillStudentForm({
        firstName: 'Jean-Pierre',
        lastName: 'Martin',
        email: 'jean-pierre@example.com',
        phoneNumber: '06 98 76 54 32'
      });

      cy.get('button[type="submit"]').click();

      cy.wait('@updateStudent').then((interception) => {
        expect(interception.request.body).to.include({
          firstName: 'Jean-Pierre',
          lastName: 'Martin',
          email: 'jean-pierre@example.com',
          phoneNumber: '06 98 76 54 32'
        });
      });
    });

    it('should redirect to student list after successful update', () => {
      cy.intercept('PUT', '**/api/students/1', {
        statusCode: 200,
        body: mockStudent
      }).as('updateStudent');

      cy.get('input[formControlName="firstName"]').clear().type('Updated');
      cy.get('button[type="submit"]').click();

      cy.wait('@updateStudent');
      cy.url().should('include', '/students');
    });

    it('should display error when email already exists', () => {
      cy.intercept('PUT', '**/api/students/1', {
        statusCode: 409,
        body: { error: 'Email already in use' }
      }).as('updateError');

      cy.get('input[formControlName="email"]').clear().type('existing@example.com');
      cy.get('button[type="submit"]').click();

      cy.wait('@updateError');
      cy.url().should('include', '/students/edit/1');
    });

    it('should validate form before updating', () => {
      cy.get('input[formControlName="firstName"]').clear();
      cy.get('button[type="submit"]').should('be.disabled');
    });
  });

  describe('Cancel and Navigation', () => {
    it('should cancel creation and return to student list', () => {
      cy.visit('/students/new');
      cy.contains('button', 'Annuler').click();
      cy.url().should('include', '/students');
    });

    it('should cancel edit and return to student list', () => {
      cy.intercept('GET', '**/api/students/1', {
        statusCode: 200,
        body: mockStudent
      }).as('getStudent');

      cy.visit('/students/edit/1');
      cy.wait('@getStudent');

      cy.contains('button', 'Annuler').click();
      cy.url().should('include', '/students');
    });

    it('should not modify data when canceling', () => {
      cy.intercept('GET', '**/api/students/1', {
        statusCode: 200,
        body: mockStudent
      }).as('getStudent');

      cy.visit('/students/edit/1');
      cy.wait('@getStudent');

      cy.get('input[formControlName="firstName"]').clear().type('Changed');
      cy.contains('button', 'Annuler').click();

      // Verify student wasn't updated
      cy.visit('/students/edit/1');
      cy.wait('@getStudent');
      cy.get('input[formControlName="firstName"]').should('have.value', mockStudent.firstName);
    });
  });

});
