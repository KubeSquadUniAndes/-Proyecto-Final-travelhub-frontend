import { ManageRoomsPage } from '../pages/ManageRoomsPage';

const manageRoomsPage = new ManageRoomsPage();

describe('Gestionar Habitaciones', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.loginAsUser('hotel');
    cy.visit('/manage-rooms');
  });

  context('Dado que el hotel accede a Gestionar Habitaciones', () => {
    it('Entonces debe ver el título y botón de nueva habitación', () => {
      manageRoomsPage.shouldShowTitle();
      manageRoomsPage.shouldShowNewRoomButton();
    });

    it('Entonces debe ver la navegación', () => {
      manageRoomsPage.shouldShowNavigation();
    });
  });

  context('Dado que el hotel quiere crear una habitación', () => {
    it('Cuando hace clic en Nueva Habitación, debe ver el formulario', () => {
      manageRoomsPage.clickNewRoom();
      manageRoomsPage.shouldShowModal();
    });

    it('Debe mostrar todos los campos del formulario', () => {
      manageRoomsPage.clickNewRoom();
      cy.get('#name').should('be.visible');
      cy.get('#room_type').should('be.visible');
      cy.get('#price').should('be.visible');
      cy.get('#capacity').should('be.visible');
    });

    it('Cuando cancela el formulario, el modal se cierra', () => {
      manageRoomsPage.clickNewRoom();
      manageRoomsPage.cancelForm();
      cy.get('.modal').should('not.exist');
    });

    it('El botón crear debe estar deshabilitado sin datos', () => {
      manageRoomsPage.clickNewRoom();
      cy.get('.modal').find('button:contains("Crear")').should('be.disabled');
    });

    it('El botón crear debe habilitarse con nombre y precio', () => {
      manageRoomsPage.clickNewRoom();
      cy.get('#name').type('Test Room');
      cy.get('#price').type('100.00');
      cy.get('.modal').find('button:contains("Crear")').should('not.be.disabled');
    });
  });

  context('Dado que el hotel quiere navegar', () => {
    it('Cuando hace clic en Inicio, debe ir al hotel-home', () => {
      manageRoomsPage.goToHome();
      cy.url().should('include', '/hotel-home');
    });

    it('Cuando hace clic en Dashboard, debe ir al hotel-dashboard', () => {
      manageRoomsPage.goToDashboard();
      cy.url().should('include', '/hotel-dashboard');
    });

    it('Cuando cierra sesión, debe ir al login', () => {
      manageRoomsPage.logout();
      cy.url().should('include', '/login');
    });
  });
});
