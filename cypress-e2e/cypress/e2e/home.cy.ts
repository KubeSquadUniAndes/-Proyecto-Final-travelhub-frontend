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
    });

    it('Entonces debe ver el listado de hoteles', () => {
      cy.get('.hotel-card').should('have.length.greaterThan', 0);
    });

    it('Cuando cierra sesión, debe redirigir al login', () => {
      cy.contains('Cerrar sesión').click();
      cy.url().should('include', '/login');
    });
  });
});
