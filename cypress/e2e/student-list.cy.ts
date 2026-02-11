describe('Student List E2E Tests', () => {
  const mockStudents = [
    {
      id: 1,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@example.com',
      phoneNumber: '06 12 34 56 78'
    },
    {
      id: 2,
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie@example.com',
      phoneNumber: '06 87 65 43 21'
    },
    {
      id: 3,
      firstName: 'Pierre',
      lastName: 'Bernard',
      email: 'pierre@example.com',
      phoneNumber: '06 34 56 78 90'
    }
  ];

  beforeEach(() => {
    cy.intercept('GET', '**/api/students', {
      statusCode: 200,
      body: mockStudents
    }).as('getStudents');

    // Navigate to students page with token
    cy.loginViaToken('test-token');
    cy.wait('@getStudents');
  });

  describe('Page Loading and Display', () => {
    it('should load student list page', () => {
      cy.url().should('include', '/students');
    });

    it('should display all students in a table', () => {
      cy.get('table').should('exist');
      cy.get('table')
        .find('tr.mat-mdc-row, tr.mat-row, tr[mat-row]')
        .should('have.length', 3);
    });

    it('should display student information correctly', () => {
      mockStudents.forEach((student, index) => {
        cy.get('table')
          .find('tr.mat-mdc-row, tr.mat-row, tr[mat-row]')
          .eq(index)
          .within(() => {
          cy.contains(student.firstName).should('be.visible');
          cy.contains(student.lastName).should('be.visible');
          cy.contains(student.email).should('be.visible');
        });
      });
    });

    it('should have a button to add new student', () => {
      cy.contains('button', 'Nouvel Étudiant').should('be.visible');
    });

    it('should have a page title', () => {
      cy.get('h1').should('contain.text', 'Liste des Étudiants');
    });

    it('should show empty message when no students', () => {
      cy.intercept('GET', '**/api/students', {
        statusCode: 200,
        body: []
      }).as('getEmptyStudents');

      cy.visit('/students');
      cy.wait('@getEmptyStudents');

      cy.get('.empty-state').should('exist');
    });
  });

  describe('Student List Operations', () => {
    it('should navigate to edit page when clicking edit button', () => {
      cy.get('button[title="Modifier"]').first().should('be.visible').click();
      cy.url().should('include', '/students/edit/1');
    });

    it('should delete student when clicking delete button', () => {
      cy.intercept('DELETE', '**/api/students/1', {
        statusCode: 204,
        body: {}
      }).as('deleteStudent');

      cy.intercept('GET', '**/api/students', {
        statusCode: 200,
        body: mockStudents.slice(1)
      }).as('getUpdatedStudents');

      cy.on('window:confirm', () => true);
      cy.get('button[title="Supprimer"]').first().click();

      cy.wait('@deleteStudent');
      cy.wait('@getUpdatedStudents');
    });

    it('should handle delete error gracefully', () => {
      cy.intercept('DELETE', '**/api/students/1', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('deleteError');

      cy.on('window:confirm', () => true);
      cy.get('button[title="Supprimer"]').first().click();

      cy.wait('@deleteError');
      cy.contains('Erreur lors de la suppression').should('be.visible');
    });

    it('should navigate to add student page', () => {
      cy.contains('button', 'Nouvel Étudiant').click();
      cy.url().should('include', '/students/new');
    });
  });

  describe('Logout from Student List', () => {
    it('should logout when clicking logout button', () => {
      cy.checkLoggedInState();
      cy.logout();
      cy.url().should('include', '/login');
    });

    it('should clear session data on logout', () => {
      cy.logout();

      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.be.null;
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error when loading students fails', () => {
      cy.intercept('GET', '**/api/students', {
        statusCode: 500,
        body: { error: 'Server error' }
      }).as('getStudentsError');

      cy.visit('/students');
      cy.wait('@getStudentsError');

      cy.contains('Erreur lors du chargement des étudiants').should('be.visible');
    });
  });
});
