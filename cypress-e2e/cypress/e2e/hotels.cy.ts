describe('Hoteles', () => {
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
    });

    it('Entonces debe ver tarjetas de hoteles', () => {
      cy.get('.hotel-card').should('have.length.greaterThan', 0);
    });

    it('Entonces debe ver la navegación', () => {
      cy.contains('Home').should('be.visible');
      cy.contains('Hoteles').should('be.visible');
    });

    it('Entonces debe filtrar por ubicación', () => {
      cy.get('#f-destino').type('Cartagena');
      cy.get('.hotel-card').each(($card) => {
        cy.wrap($card).should('contain.text', 'Cartagena');
      });
    });

    it('Entonces debe mostrar estado vacío cuando no hay resultados', () => {
      cy.get('#f-destino').type('zzzzzzzzz');
      cy.contains('No se encontraron').should('be.visible');
    });

    it('Entonces debe limpiar filtros', () => {
      cy.get('#f-destino').type('Cartagena');
      cy.contains('Limpiar filtros').click();
      cy.get('.hotel-card').should('have.length.greaterThan', 5);
    });

    it('Cuando navega al Home, debe redirigir', () => {
      cy.contains('nav a', 'Home').click();
      cy.url().should('include', '/home');
    });
  });
});
