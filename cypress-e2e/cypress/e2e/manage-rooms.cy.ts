import { LoginPage } from '../pages/LoginPage';
import { ManageRoomsPage } from '../pages/ManageRoomsPage';

const loginPage = new LoginPage();
const manageRoomsPage = new ManageRoomsPage();

describe('Gestionar Habitaciones', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      loginPage.visit();
      loginPage
        .fillEmail(users.hotelUser.email)
        .fillPassword(users.hotelUser.password)
        .submit();
      // Wait for redirect after login
      cy.url().should('not.include', '/login');
      cy.visit('/manage-rooms');
      cy.url().should('include', '/manage-rooms');
    });
  });

  context('Dado que el hotel accede a Gestionar Habitaciones', () => {
    it('Entonces debe ver el título y botón de nueva habitación', () => {
      manageRoomsPage.shouldShowTitle();
      manageRoomsPage.shouldShowNewRoomButton();
    });

    it('Entonces debe ver la navegación con Inicio, Dashboard y Habitaciones', () => {
      manageRoomsPage.shouldShowNavigation();
    });
  });

  context('Dado que el hotel quiere crear una habitación', () => {
    it('Cuando hace clic en Nueva Habitación, entonces debe ver el formulario', () => {
      manageRoomsPage.clickNewRoom();
      manageRoomsPage.shouldShowModal();
    });

    it('Cuando llena el formulario, debe mostrar los campos correctos', () => {
      manageRoomsPage.clickNewRoom();
      cy.get('#name').should('be.visible');
      cy.get('#room_type').should('be.visible');
      cy.get('#price').should('be.visible');
      cy.get('#capacity').should('be.visible');
      cy.get('#beds').should('be.visible');
      cy.get('#size').should('be.visible');
      cy.get('#amenities').should('be.visible');
    });

    it('Cuando cancela el formulario, entonces el modal se cierra', () => {
      manageRoomsPage.clickNewRoom();
      manageRoomsPage.shouldShowModal();
      manageRoomsPage.cancelForm();
      cy.get('.modal').should('not.exist');
    });

    it('El botón crear debe estar deshabilitado sin nombre ni precio', () => {
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
    it('Cuando hace clic en Inicio, entonces debe ir al hotel-home', () => {
      manageRoomsPage.goToHome();
      cy.url().should('include', '/hotel-home');
    });

    it('Cuando hace clic en Dashboard, entonces debe ir al hotel-dashboard', () => {
      manageRoomsPage.goToDashboard();
      cy.url().should('include', '/hotel-dashboard');
    });

    it('Cuando cierra sesión, entonces debe ir al login', () => {
      manageRoomsPage.logout();
      cy.url().should('include', '/login');
    });
  });
});
