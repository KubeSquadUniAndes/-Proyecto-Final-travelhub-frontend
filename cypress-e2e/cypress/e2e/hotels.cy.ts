describe('Hoteles (Search)', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.loginAsUser('traveler');
    cy.visit('/search');
  });

  context('Dado que el viajero accede a la búsqueda de hoteles', () => {
    it('Entonces debe ver el título de hospedajes', () => {
      cy.contains('Hospedajes disponibles').should('be.visible');
    });

    it('Entonces debe ver los filtros de búsqueda', () => {
      cy.get('.filters').should('be.visible');
      cy.get('#f-destino').should('be.visible');
      cy.get('#f-checkin').should('be.visible');
      cy.get('#f-checkout').should('be.visible');
      cy.get('#f-huespedes').should('be.visible');
    });

    it('Entonces debe ver la navegación', () => {
      cy.contains('Home').should('be.visible');
      cy.contains('Hoteles').should('be.visible');
    });

    it('Entonces debe ver el botón Mis Reservas', () => {
      cy.contains('Mis Reservas').should('be.visible');
    });

    it('Entonces debe mostrar contenido (cards, vacío o cargando)', () => {
      cy.get('.hotel-card, .empty-state, .loading').should('exist');
    });

    it('Entonces debe mostrar estado vacío al buscar algo inexistente', () => {
      cy.get('#f-destino').type('zzzzzzzzz');
      cy.contains('No se encontraron').should('be.visible');
    });

    it('Cuando navega al Home, debe redirigir', () => {
      cy.contains('nav a', 'Home').click();
      cy.url().should('include', '/home');
    });

    it('Cuando cierra sesión, debe ir al login', () => {
      cy.contains('Cerrar sesión').click();
      cy.url().should('include', '/login');
    });
  });
});
