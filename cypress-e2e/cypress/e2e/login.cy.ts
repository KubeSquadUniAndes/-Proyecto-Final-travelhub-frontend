import { LoginPage } from '../pages/LoginPage';

const loginPage = new LoginPage();

describe('Inicio de sesión', () => {
  beforeEach(() => {
    loginPage.visit();
  });

  context('Dado que el usuario quiere iniciar sesión', () => {
    context('Cuando envía el formulario vacío', () => {
      it('Entonces debe mostrar errores de validación', () => {
        // When
        loginPage.submit();

        // Then
        loginPage.shouldShowError('El correo no es válido');
      });
    });

    context('Cuando ingresa credenciales incorrectas', () => {
      it('Entonces debe mostrar error de credenciales inválidas', () => {
        // When
        loginPage
          .fillEmail('noexiste@test.com')
          .fillPassword('WrongPass123!')
          .submit();

        // Then
        loginPage.shouldShowError('Correo o contraseña incorrectos');
      });
    });

    context('Cuando ingresa solo el email sin contraseña', () => {
      it('Entonces debe mostrar error', () => {
        // When
        loginPage.fillEmail('juan.perez@example.com').submit();

        // Then
        loginPage.shouldShowError('Correo o contraseña incorrectos');
      });
    });

    context('Cuando ingresa credenciales válidas', () => {
      it('Entonces debe iniciar sesión y redirigir al home', () => {
        // Given
        cy.fixture('users').then((users) => {
          // When
          loginPage
            .fillEmail(users.existingUser.email)
            .fillPassword(users.existingUser.password)
            .submit();

          // Then
          loginPage.shouldBeRedirectedTo('/home');
        });
      });
    });
  });

  context('Dado que el usuario no tiene cuenta', () => {
    context('Cuando hace clic en registrarse', () => {
      it('Entonces debe navegar a la página de registro', () => {
        // When
        loginPage.goToRegister();

        // Then
        cy.url().should('include', '/register');
      });
    });
  });
});
