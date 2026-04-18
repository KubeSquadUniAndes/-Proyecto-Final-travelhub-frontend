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
      cy.url().should('include', '/hotel-home');
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

    it('Cuando llena el formulario y lo envía, entonces debe crear la habitación', () => {
      const roomName = `Hab E2E ${Date.now()}`;
      manageRoomsPage.clickNewRoom();
      manageRoomsPage.fillRoomForm({
        name: roomName,
        type: 'doble',
        price: '250.00',
        capacity: 3,
        beds: '2 camas sencillas',
        size: 30,
        amenities: 'WiFi, AC, TV',
      });
      manageRoomsPage.submitForm();
      // Wait for modal to close and room to appear
      cy.get('.modal').should('not.exist');
      manageRoomsPage.shouldShowRoomWithName(roomName);
    });

    it('Cuando cancela el formulario, entonces no debe crear la habitación', () => {
      manageRoomsPage.clickNewRoom();
      manageRoomsPage.fillRoomForm({ name: 'Habitación Cancelada', price: '100.00' });
      manageRoomsPage.cancelForm();
      cy.get('.modal').should('not.exist');
    });
  });

  context('Dado que existe una habitación creada', () => {
    const editRoomName = `Edit ${Date.now()}`;
    const deleteRoomName = `Del ${Date.now()}`;
    const keepRoomName = `Keep ${Date.now()}`;

    beforeEach(() => {
      // Create rooms needed for these tests
      [editRoomName, deleteRoomName, keepRoomName].forEach((name) => {
        manageRoomsPage.clickNewRoom();
        manageRoomsPage.fillRoomForm({ name, price: '150.00', capacity: 2 });
        manageRoomsPage.submitForm();
        cy.get('.modal').should('not.exist');
        manageRoomsPage.shouldShowRoomWithName(name);
      });
    });

    it('Cuando edita la habitación, entonces debe actualizar los datos', () => {
      manageRoomsPage.clickEditRoom(editRoomName);
      manageRoomsPage.shouldShowModal();
      cy.get('#price').clear().type('200.00');
      manageRoomsPage.submitForm();
      cy.get('.modal').should('not.exist');
    });

    it('Cuando elimina la habitación, entonces debe desaparecer del listado', () => {
      manageRoomsPage.clickDeleteRoom(deleteRoomName);
      manageRoomsPage.confirmDelete();
      cy.get('.modal').should('not.exist');
      manageRoomsPage.shouldNotShowRoomWithName(deleteRoomName);
    });

    it('Cuando cancela la eliminación, entonces la habitación debe seguir visible', () => {
      manageRoomsPage.clickDeleteRoom(keepRoomName);
      manageRoomsPage.cancelDelete();
      cy.get('.modal').should('not.exist');
      manageRoomsPage.shouldShowRoomWithName(keepRoomName);
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
