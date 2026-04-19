import { LoginPage } from '../pages/LoginPage';

const loginPage = new LoginPage();

describe('Inicio de sesión', () => {
  beforeEach(() => {
    loginPage.visit();
  });

  context('Dado que el usuario quiere iniciar sesión', () => {
    context('Cuando envía el formulario vacío', () => {
      it('Entonces debe mostrar errores de validación', () => {
        loginPage.submit();
        cy.get('.alert-error').should('be.visible');
      });
    });

    context('Cuando ingresa credenciales incorrectas', () => {
      it('Entonces debe mostrar error', () => {
        loginPage
          .fillEmail('noexiste@test.com')
          .fillPassword('WrongPass123!')
          .submit();
        cy.get('.alert-error').should('be.visible');
      });
    });

    context('Cuando ingresa solo el email sin contraseña', () => {
      it('Entonces debe mostrar error', () => {
        loginPage.fillEmail('juan.perez@example.com').submit();
        cy.get('.alert-error').should('be.visible');
      });
    });

    context('Cuando ingresa credenciales válidas', () => {
      it('Entonces debe iniciar sesión y redirigir', () => {
        cy.fixture('users').then((users) => {
          loginPage
            .fillEmail(users.existingUser.email)
            .fillPassword(users.existingUser.password)
            .submit();
          cy.url().should('not.include', '/login');
        });
      });
    });
  });

  context('Dado que el usuario no tiene cuenta', () => {
    context('Cuando hace clic en registrarse', () => {
      it('Entonces debe navegar a la página de registro', () => {
        loginPage.goToRegister();
        cy.url().should('include', '/register');
      });
    });
  });
});
