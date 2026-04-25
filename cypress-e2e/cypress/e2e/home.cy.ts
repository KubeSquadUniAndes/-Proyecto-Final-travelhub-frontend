describe('Home', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.loginAsUser('traveler');
    cy.visit('/home');
  });

  context('Dado que el usuario inició sesión', () => {
    it('Entonces debe ver la barra de navegación', () => {
      cy.contains('Home').should('be.visible');
      cy.contains('Hoteles').should('be.visible');
    });

    it('Entonces debe ver el hero con título', () => {
      cy.contains('Encuentra tu hotel ideal').should('be.visible');
    });

    it('Entonces debe ver el formulario de búsqueda', () => {
      cy.get('#destino').should('be.visible');
      cy.get('#checkIn').should('be.visible');
      cy.get('#checkOut').should('be.visible');
      cy.get('#huespedes').should('be.visible');
    });

    it('Entonces debe ver las feature cards', () => {
      cy.get('.feature-card').should('have.length', 3);
    });

    it('Entonces debe ver la sección de hospedajes', () => {
      cy.contains('Hospedajes disponibles').should('be.visible');
    });

    it('Entonces debe ver el botón Mis Reservas', () => {
      cy.contains('Mis Reservas').should('be.visible');
    });

    it('Cuando busca, debe navegar a search con parámetros', () => {
      cy.get('#destino').type('Bogotá');
      cy.get('.btn-search').click();
      cy.url().should('include', '/search');
      cy.url().should('include', 'destino=Bogot');
    });

    it('Cuando cierra sesión, debe redirigir al login', () => {
      cy.contains('Cerrar sesión').click();
      cy.url().should('include', '/login');
    });
  });
});
