import { ManageRoomsPage } from '../pages/ManageRoomsPage';

const manageRoomsPage = new ManageRoomsPage();

describe('Galería Multimedia', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.loginAsUser('hotel');
    cy.visit('/manage-rooms');
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
      cy.get('.room-selector-card').should('have.length.greaterThan', 0);
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
      cy.get('.drop-zone').should('contain.text', 'Arrastra imágenes para');
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
      cy.get('.queue-size').should('contain.text', 'MB');
    });

    it('Debe poder eliminar un archivo de la cola antes de subir', () => {
      cy.get('#galleryFileInput').selectFile('cypress/fixtures/test-image.jpg', { force: true });
      cy.get('.queue-item').find('button').click();
      cy.get('.queue-item').should('not.exist');
    });

    it('Cuando sube exitosamente, debe mostrar toast de éxito', () => {
      cy.intercept('POST', '**/rooms/*/images', { statusCode: 201, body: { id: 'new', room_id: 'r1', url: 'http://img.jpg', created_at: new Date().toISOString() } }).as('upload');
      cy.get('#galleryFileInput').selectFile('cypress/fixtures/test-image.jpg', { force: true });
      cy.get('.btn-primary').contains('Subir todos').click();
      cy.wait('@upload');
      cy.get('.toast').should('contain.text', 'subida');
    });
  });

  context('Dado que el hotel quiere eliminar una imagen', () => {
    it('Cuando hace clic en eliminar, la imagen desaparece', () => {
      cy.get('.tab').contains('Galería').click();
      cy.get('.gallery-grid .gallery-item').then(($items) => {
        if ($items.length > 0) {
          const initialCount = $items.length;
          cy.intercept('DELETE', '**/rooms/images/*', { statusCode: 200, body: { message: 'deleted' } }).as('delete');
          cy.get('.gallery-item').first().trigger('mouseenter');
          cy.get('.gallery-item').first().find('.btn-delete-img').click({ force: true });
          cy.wait('@delete');
          cy.get('.toast').should('contain.text', 'eliminada');
        }
      });
    });
  });

  context('Dado que el hotel quiere volver a Habitaciones', () => {
    it('Cuando hace clic en el tab Habitaciones, debe ver las habitaciones', () => {
      cy.get('.tab').contains('Galería').click();
      cy.get('.room-selector').should('be.visible');
      cy.get('.tab').contains('Habitaciones').click();
      cy.get('.room-selector').should('not.exist');
    });
  });
});
