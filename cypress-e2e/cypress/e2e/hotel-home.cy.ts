import { LoginPage } from '../pages/LoginPage';
import { HotelHomePage } from '../pages/HotelHomePage';
import { HotelDashboardPage } from '../pages/HotelDashboardPage';

const loginPage = new LoginPage();
const hotelHomePage = new HotelHomePage();
const dashboardPage = new HotelDashboardPage();

describe('Hotel Home', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      loginPage.visit();
      loginPage
        .fillEmail(users.hotelUser.email)
        .fillPassword(users.hotelUser.password)
        .submit();
      cy.url().should('not.include', '/login');
      cy.visit('/hotel-home');
    });
  });

  context('Dado que el usuario hotel inició sesión', () => {
    it('Entonces debe ver el nombre del hotel en el header', () => {
      hotelHomePage.shouldShowHotelName();
    });

    it('Entonces debe ver la navegación', () => {
      hotelHomePage.shouldShowNavigation();
    });

    it('Entonces debe ver el menú de gestión', () => {
      hotelHomePage.shouldShowGestionMenu();
    });

    it('Entonces debe ver el listado de reservas', () => {
      hotelHomePage.shouldShowReservasList();
    });

    it('Entonces debe ver reservas con estado Pendiente', () => {
      hotelHomePage.shouldShowReservaWithStatus('Pendiente');
    });

    it('Entonces debe ver reservas con estado Confirmada', () => {
      hotelHomePage.shouldShowReservaWithStatus('Confirmada');
    });

    it('Cuando navega al Dashboard, debe redirigir', () => {
      hotelHomePage.goToDashboard();
      dashboardPage.shouldBeOnDashboardPage();
    });

    it('Cuando cierra sesión, debe redirigir al login', () => {
      hotelHomePage.logout();
      cy.url().should('include', '/login');
    });
  });
});

describe('Hotel Dashboard', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      loginPage.visit();
      loginPage
        .fillEmail(users.hotelUser.email)
        .fillPassword(users.hotelUser.password)
        .submit();
      cy.url().should('not.include', '/login');
      cy.visit('/hotel-dashboard');
    });
  });

  context('Dado que el usuario hotel está en el dashboard', () => {
    it('Entonces debe ver el título Dashboard de Reservas', () => {
      dashboardPage.shouldShowTitle();
    });

    it('Entonces debe ver las métricas', () => {
      dashboardPage.shouldShowMetrics();
    });

    it('Entonces debe ver la tabla de reservas', () => {
      dashboardPage.shouldShowReservasTable();
    });

    it('Entonces debe ver el buscador', () => {
      dashboardPage.shouldShowSearchInput();
    });

    it('Cuando navega al Home, debe redirigir', () => {
      dashboardPage.goToHome();
      hotelHomePage.shouldBeOnHotelHomePage();
    });
  });
});
