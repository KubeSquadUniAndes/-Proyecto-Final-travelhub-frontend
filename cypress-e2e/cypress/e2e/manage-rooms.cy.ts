import { LoginPage } from '../pages/LoginPage';
import { ManageRoomsPage } from '../pages/ManageRoomsPage';

const loginPage = new LoginPage();
const manageRoomsPage = new ManageRoomsPage();

const uniqueRoomName = `Habitación E2E ${Date.now()}`;

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
      manageRoomsPage.clickNewRoom();
      manageRoomsPage.fillRoomForm({
        name: uniqueRoomName,
        type: 'doble',
        price: '250.00',
        capacity: 3,
        beds: '2 camas sencillas',
        size: 30,
        amenities: 'WiFi, AC, TV, Minibar',
      });
      manageRoomsPage.submitForm();
      manageRoomsPage.shouldShowToast('creada');
      manageRoomsPage.shouldShowRoomWithName(uniqueRoomName);
    });

    it('Cuando cancela el formulario, entonces no debe crear la habitación', () => {
      manageRoomsPage.clickNewRoom();
      manageRoomsPage.fillRoomForm({ name: 'Habitación Cancelada', price: '100.00' });
      manageRoomsPage.cancelForm();
      manageRoomsPage.shouldNotShowRoomWithName('Habitación Cancelada');
    });
  });

  context('Dado que existe una habitación creada', () => {
    it('Cuando edita la habitación, entonces debe actualizar los datos', () => {
      // Primero crear una habitación para editar
      manageRoomsPage.clickNewRoom();
      const editRoomName = `Edit Room ${Date.now()}`;
      manageRoomsPage.fillRoomForm({ name: editRoomName, price: '150.00', capacity: 2 });
      manageRoomsPage.submitForm();
      manageRoomsPage.shouldShowToast('creada');

      // Editar
      manageRoomsPage.clickEditRoom(editRoomName);
      manageRoomsPage.shouldShowModal();
      cy.get('#price').clear().type('200.00');
      manageRoomsPage.submitForm();
      manageRoomsPage.shouldShowToast('actualizada');
    });

    it('Cuando elimina la habitación, entonces debe desaparecer del listado', () => {
      // Crear habitación para eliminar
      manageRoomsPage.clickNewRoom();
      const deleteRoomName = `Delete Room ${Date.now()}`;
      manageRoomsPage.fillRoomForm({ name: deleteRoomName, price: '100.00' });
      manageRoomsPage.submitForm();
      manageRoomsPage.shouldShowToast('creada');

      // Eliminar
      manageRoomsPage.clickDeleteRoom(deleteRoomName);
      manageRoomsPage.confirmDelete();
      manageRoomsPage.shouldShowToast('eliminada');
    });

    it('Cuando cancela la eliminación, entonces la habitación debe seguir visible', () => {
      manageRoomsPage.clickNewRoom();
      const keepRoomName = `Keep Room ${Date.now()}`;
      manageRoomsPage.fillRoomForm({ name: keepRoomName, price: '100.00' });
      manageRoomsPage.submitForm();
      manageRoomsPage.shouldShowToast('creada');

      manageRoomsPage.clickDeleteRoom(keepRoomName);
      manageRoomsPage.cancelDelete();
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
