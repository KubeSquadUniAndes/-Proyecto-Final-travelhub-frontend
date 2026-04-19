import { LoginPage } from '../pages/LoginPage';

const loginPage = new LoginPage();

describe('Inicio de sesión', () => {
  beforeEach(() => {
    loginPage.visit();
  });

  context('Dado que el usuario está en la página de login', () => {
    it('Entonces debe ver el formulario de login', () => {
      cy.get('input[id="email"]').should('be.visible');
      cy.get('input[id="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('Entonces debe ver el link de registro', () => {
      cy.get('.link-btn').should('be.visible');
    });

    it('Cuando envía el formulario vacío, debe mostrar error', () => {
      loginPage.submit();
      cy.get('.alert-error').should('be.visible');
    });

    it('Cuando hace clic en registrarse, debe navegar al registro', () => {
      loginPage.goToRegister();
      cy.url().should('include', '/register');
    });
  });
});
