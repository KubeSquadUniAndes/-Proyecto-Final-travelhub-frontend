import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';

const loginPage = new LoginPage();
const homePage = new HomePage();

describe('Home', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      loginPage.visit();
      loginPage
        .fillEmail(users.existingUser.email)
        .fillPassword(users.existingUser.password)
        .submit();
      cy.url().should('include', '/home');
    });
  });

  context('Dado que el usuario inició sesión exitosamente', () => {
    context('Cuando accede al home', () => {
      it('Entonces debe ver la barra de navegación', () => {
        homePage.shouldShowNavigation();
      });

      it('Entonces debe ver el hero con el buscador', () => {
        homePage.shouldShowHeroSection().shouldShowSearchForm();
      });

      it('Entonces debe ver el listado de hoteles disponibles', () => {
        homePage.shouldShowHotelListings();
      });

      it('Entonces debe ver el botón de cerrar sesión', () => {
        homePage.shouldShowLogoutButton();
      });
    });

    context('Cuando cierra sesión', () => {
      it('Entonces debe redirigir al login', () => {
        // When
        homePage.logout();

        // Then
        cy.url().should('include', '/login');
      });
    });
  });
});
