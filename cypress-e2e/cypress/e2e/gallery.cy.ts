describe('Galería Multimedia', () => {
  const mockRooms = [
    { id: 'room-1', hotel_id: 'test-user-id', name: 'Habitación 101', room_type: 'individual', price: '150.00', capacity: 2, beds: '1 cama doble', size: 25, amenities: 'WiFi, AC' },
    { id: 'room-2', hotel_id: 'test-user-id', name: 'Suite 201', room_type: 'suite', price: '350.00', capacity: 4, beds: '1 king', size: 45, amenities: 'WiFi, AC, Minibar' },
  ];

  beforeEach(() => {
    cy.intercept('GET', '**/hospedajes/api/v1/rooms**', mockRooms).as('getRooms');
    cy.intercept('GET', '**/hospedajes/api/v1/rooms/*/images', []).as('getImages');
    cy.intercept('GET', '**/hospedajes/api/v1/rates', []).as('getRates');
    cy.visit('/login');
    cy.loginAsUser('hotel');
    cy.visit('/manage-rooms');
    cy.get('.tab, .room-card, .empty-state, .loading, .error-state', { timeout: 10000 }).should('exist');
  });

  context('Dado que el hotel accede a gestionar habitaciones', () => {
    it('Entonces debe ver la página de habitaciones', () => {
      cy.contains('Habitaciones').should('be.visible');
    });

    it('Entonces debe ver el botón de nueva habitación', () => {
      cy.get('button').contains(/Nueva|Crear/).should('be.visible');
    });

    it('Entonces debe ver la navegación del hotel', () => {
      cy.contains('Inicio').should('be.visible');
      cy.contains('Dashboard').should('be.visible');
    });
  });
});
