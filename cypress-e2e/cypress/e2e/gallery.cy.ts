describe('Galería Multimedia', () => {
  const mockRooms = [
    { id: 'room-1', hotel_id: 'test-user-id', name: 'Habitación 101', room_type: 'individual', price: '150.00', capacity: 2, beds: '1 cama doble', size: 25, amenities: 'WiFi, AC' },
    { id: 'room-2', hotel_id: 'test-user-id', name: 'Suite 201', room_type: 'suite', price: '350.00', capacity: 4, beds: '1 king', size: 45, amenities: 'WiFi, AC, Minibar' },
  ];

  const mockImages = [
    { id: 'img-1', room_id: 'room-1', url: 'https://via.placeholder.com/300', created_at: '2026-01-01T00:00:00Z' },
    { id: 'img-2', room_id: 'room-1', url: 'https://via.placeholder.com/301', created_at: '2026-01-02T00:00:00Z' },
  ];

  beforeEach(() => {
    cy.intercept('GET', '**/hospedajes/api/v1/rooms**', mockRooms).as('getRooms');
    cy.intercept('GET', '**/hospedajes/api/v1/rooms/room-1/images', mockImages).as('getImagesRoom1');
    cy.intercept('GET', '**/hospedajes/api/v1/rooms/room-2/images', []).as('getImagesRoom2');
    cy.intercept('POST', '**/hospedajes/api/v1/rooms/*/images', { statusCode: 201, body: { id: 'img-new', room_id: 'room-1', url: 'https://via.placeholder.com/302', created_at: new Date().toISOString() } }).as('uploadImage');
    cy.intercept('DELETE', '**/hospedajes/api/v1/rooms/images/*', { statusCode: 200, body: { message: 'deleted' } }).as('deleteImage');
    cy.intercept('GET', '**/hospedajes/api/v1/rates', []).as('getRates');

    cy.visit('/login');
    cy.loginAsUser('hotel');
    cy.visit('/manage-rooms');
    cy.get('.tab, .room-card, .empty-state, .loading, .error-state', { timeout: 10000 }).should('exist');
  });

  context('Dado que el hotel accede a la pestaña Galería', () => {
    it('Entonces debe ver los tabs Habitaciones y Galería', () => {
      cy.get('.tab').should('have.length', 2);
      cy.get('.tab').first().should('contain.text', 'Habitaciones');
      cy.get('.tab').last().should('contain.text', 'Galería');
    });

    it('Cuando hace clic en Galería, debe ver el selector de habitaciones', () => {
      cy.get('.tab').contains('Galería').click();
      cy.get('.room-selector').should('be.visible');
      cy.get('.room-selector-card').should('have.length', 2);
    });

    it('Entonces debe ver el contador de imágenes', () => {
      cy.get('.tab').contains('Galería').click();
      cy.get('.stat-badge').should('contain.text', 'imágenes');
    });

    it('Entonces no debe ver la zona de drop sin seleccionar habitación', () => {
      cy.get('.tab').contains('Galería').click();
      cy.get('.drop-zone').should('not.exist');
    });
  });

  context('Dado que el hotel selecciona una habitación en la galería', () => {
    beforeEach(() => {
      cy.get('.tab').contains('Galería').click();
    });

    it('Cuando hace clic en una tarjeta de habitación, debe resaltarse', () => {
      cy.get('.room-selector-card').first().click();
      cy.get('.room-selector-card').first().should('have.class', 'room-selector-active');
    });

    it('Entonces debe aparecer la zona de drag & drop', () => {
      cy.get('.room-selector-card').first().click();
      cy.get('.drop-zone').should('be.visible');
    });

    it('La zona de drop debe mostrar el nombre de la habitación', () => {
      cy.get('.room-selector-card').first().click();
      cy.get('.drop-zone').should('contain.text', 'Habitación 101');
    });

    it('Debe mostrar el botón de seleccionar archivos', () => {
      cy.get('.room-selector-card').first().click();
      cy.get('.drop-zone').find('label').should('contain.text', 'Seleccionar archivos');
    });
  });

  context('Dado que el hotel sube imágenes', () => {
    beforeEach(() => {
      cy.get('.tab').contains('Galería').click();
      cy.get('.room-selector-card').first().click();
    });

    it('Cuando selecciona un archivo válido, debe aparecer en la cola', () => {
      cy.get('#galleryFileInput').selectFile('cypress/fixtures/test-image.jpg', { force: true });
      cy.get('.upload-queue').should('be.visible');
      cy.get('.queue-item').should('have.length', 1);
    });

    it('Debe mostrar el nombre y tamaño del archivo en la cola', () => {
      cy.get('#galleryFileInput').selectFile('cypress/fixtures/test-image.jpg', { force: true });
      cy.get('.queue-name').should('contain.text', 'test-image.jpg');
      cy.get('.queue-size').should('be.visible');
    });

    it('Debe poder eliminar un archivo de la cola antes de subir', () => {
      cy.get('#galleryFileInput').selectFile('cypress/fixtures/test-image.jpg', { force: true });
      cy.get('.queue-item').find('button').click();
      cy.get('.queue-item').should('not.exist');
    });

    it('Cuando sube exitosamente, debe mostrar toast de éxito', () => {
      cy.get('#galleryFileInput').selectFile('cypress/fixtures/test-image.jpg', { force: true });
      cy.get('.btn-primary').contains('Subir todos').click();
      cy.wait('@uploadImage');
      cy.get('.toast').should('contain.text', 'subida');
    });
  });

  context('Dado que el hotel quiere eliminar una imagen', () => {
    it('Cuando hace clic en eliminar, la imagen desaparece', () => {
      cy.get('.tab').contains('Galería').click();
      cy.get('.gallery-item').should('have.length', 2);
      cy.get('.gallery-item').first().trigger('mouseenter');
      cy.get('.gallery-item').first().find('.btn-delete-img').click({ force: true });
      cy.wait('@deleteImage');
      cy.get('.toast').should('contain.text', 'eliminada');
    });
  });

  context('Dado que el hotel quiere volver a Habitaciones', () => {
    it('Cuando hace clic en el tab Habitaciones, debe ver las habitaciones', () => {
      cy.get('.tab').contains('Galería').click();
      cy.get('.room-selector').should('be.visible');
      cy.get('.tab').contains('Habitaciones').click();
      cy.get('.room-selector').should('not.exist');
      cy.get('.room-card').should('have.length', 2);
    });
  });
});
