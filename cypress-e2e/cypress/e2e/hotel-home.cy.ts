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
      cy.url().should('include', '/hotel-home');
    });
  });

  context('Dado que el usuario hotel inició sesión', () => {
    context('Cuando accede al home del hotel', () => {
      it('Entonces debe ver el nombre del hotel en el header', () => {
        hotelHomePage.shouldShowHotelName();
      });

      it('Entonces debe ver la navegación con Inicio y Dashboard', () => {
        hotelHomePage.shouldShowNavigation();
      });

      it('Entonces debe ver el menú de gestión con todas las opciones', () => {
        hotelHomePage.shouldShowGestionMenu();
      });

      it('Entonces debe ver el listado de reservas', () => {
        hotelHomePage.shouldShowReservasList();
      });

      it('Entonces debe ver reservas con diferentes estados', () => {
        hotelHomePage
          .shouldShowReservaWithStatus('Confirmada')
          .shouldShowReservaWithStatus('Pendiente')
          .shouldShowReservaWithStatus('En curso')
          .shouldShowReservaWithStatus('Completada')
          .shouldShowReservaWithStatus('Cancelada');
      });
    });

    context('Cuando navega al Dashboard', () => {
      it('Entonces debe redirigir a la página de dashboard', () => {
        // When
        hotelHomePage.goToDashboard();

        // Then
        dashboardPage.shouldBeOnDashboardPage();
      });
    });

    context('Cuando cierra sesión', () => {
      it('Entonces debe redirigir al login', () => {
        // When
        hotelHomePage.logout();

        // Then
        cy.url().should('include', '/login');
      });
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
      cy.url().should('include', '/hotel-home');
      hotelHomePage.goToDashboard();
      cy.url().should('include', '/hotel-dashboard');
    });
  });

  context('Dado que el usuario hotel está en el dashboard', () => {
    context('Cuando accede al dashboard', () => {
      it('Entonces debe ver el título Dashboard de Reservas', () => {
        dashboardPage.shouldShowTitle();
      });

      it('Entonces debe ver las métricas de reservas', () => {
        dashboardPage.shouldShowMetrics();
      });

      it('Entonces debe ver la tabla de reservas con sus columnas', () => {
        dashboardPage.shouldShowReservasTable();
      });

      it('Entonces debe ver el buscador de reservas', () => {
        dashboardPage.shouldShowSearchInput();
      });

      it('Entonces debe ver reservas con diferentes estados', () => {
        dashboardPage.shouldShowReservasWithDifferentStatuses();
      });
    });

    context('Cuando navega al Home', () => {
      it('Entonces debe redirigir al hotel-home', () => {
        // When
        dashboardPage.goToHome();

        // Then
        hotelHomePage.shouldBeOnHotelHomePage();
      });
    });
  });
});
