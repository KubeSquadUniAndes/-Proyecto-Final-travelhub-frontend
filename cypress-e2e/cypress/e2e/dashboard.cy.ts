describe('Mis Reservas (Dashboard Viajero)', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.loginAsUser('traveler');
    cy.visit('/dashboard');
  });

  context('Dado que el viajero accede a Mis Reservas', () => {
    it('Entonces debe ver el título Mis Reservas', () => {
      cy.contains('Mis Reservas').should('be.visible');
    });

    it('Entonces debe ver la navegación', () => {
      cy.contains('Home').should('be.visible');
      cy.contains('Mis Reservas').should('be.visible');
    });

    it('Entonces debe ver el botón de Nueva Reserva', () => {
      cy.contains('Nueva Reserva').should('be.visible');
    });

    it('Entonces debe ver el botón de cerrar sesión', () => {
      cy.contains('Cerrar sesión').should('be.visible');
    });

    it('Entonces debe mostrar contenido (reservas, vacío o error)', () => {
      cy.get('table, .empty-state, .error-state, .loading').should('exist');
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
