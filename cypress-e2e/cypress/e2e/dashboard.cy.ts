import { LoginPage } from '../pages/LoginPage';

const loginPage = new LoginPage();

describe('Mis Reservas (Dashboard Viajero)', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      loginPage.visit();
      loginPage
        .fillEmail(users.existingUser.email)
        .fillPassword(users.existingUser.password)
        .submit();
      cy.url().should('not.include', '/login');
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
    });
  });

  context('Dado que el viajero accede a Mis Reservas', () => {
    it('Entonces debe ver el título Mis Reservas', () => {
      cy.contains('Mis Reservas').should('be.visible');
    });

    it('Entonces debe ver la navegación con Home y Mis Reservas', () => {
      cy.contains('Home').should('be.visible');
      cy.contains('Mis Reservas').should('be.visible');
    });

    it('Entonces debe ver el botón de Nueva Reserva', () => {
      cy.contains('Nueva Reserva').should('be.visible');
    });

    it('Entonces debe ver el botón de cerrar sesión', () => {
      cy.contains('Cerrar sesión').should('be.visible');
    });

    it('Entonces debe mostrar reservas o estado vacío', () => {
      cy.get('table, .empty-state, .error-state, .loading').should('be.visible');
    });
  });

  context('Dado que el viajero tiene reservas', () => {
    it('Entonces debe ver la tabla con columnas correctas', () => {
      cy.get('table').then(($table) => {
        if ($table.length) {
          cy.contains('th', 'Código').should('be.visible');
          cy.contains('th', 'Tipo').should('be.visible');
          cy.contains('th', 'Check-in').should('be.visible');
          cy.contains('th', 'Estado').should('be.visible');
          cy.contains('th', 'Acciones').should('be.visible');
        }
      });
    });

    it('Entonces debe ver los filtros de búsqueda', () => {
      cy.get('.filters-bar').then(($filters) => {
        if ($filters.length) {
          cy.get('#search').should('be.visible');
          cy.get('#estado').should('be.visible');
        }
      });
    });
  });

  context('Dado que el viajero quiere navegar', () => {
    it('Cuando hace clic en Home, debe ir al home', () => {
      cy.contains('nav a', 'Home').click();
      cy.url().should('include', '/home');
    });

    it('Cuando hace clic en Nueva Reserva, debe ir a búsqueda', () => {
      cy.contains('Nueva Reserva').click();
      cy.url().should('include', '/search');
    });

    it('Cuando cierra sesión, debe ir al login', () => {
      cy.contains('Cerrar sesión').click();
      cy.url().should('include', '/login');
    });
  });
});
