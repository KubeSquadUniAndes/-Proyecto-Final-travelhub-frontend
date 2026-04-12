import { RegisterPage } from '../pages/RegisterPage';
import { faker } from '@faker-js/faker';

const registerPage = new RegisterPage();

function generateUser(userType: 'traveler' | 'hotel' = 'traveler') {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email({ provider: 'travelhub.com' }),
    phone: `+57 ${faker.string.numeric(3)} ${faker.string.numeric(3)} ${faker.string.numeric(4)}`,
    country: faker.location.country(),
    city: faker.location.city(),
    birthDate: faker.date.birthdate({ min: 18, max: 60, mode: 'age' }).toISOString().split('T')[0],
    idType: 'CC',
    idNumber: faker.string.numeric(10),
    userType,
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!',
  };
}

const registerPage = new RegisterPage();

describe('Registro de usuario', () => {
  beforeEach(() => {
    registerPage.visit();
  });

  context('Dado que el usuario quiere registrarse', () => {
    context('Cuando envía el formulario vacío', () => {
      it('Entonces debe mostrar errores de validación en los campos requeridos', () => {
        // When
        registerPage.submit();

        // Then
        registerPage.shouldShowFieldError('first_name');
        registerPage.shouldShowFieldError('last_name');
        registerPage.shouldShowFieldError('email');
        registerPage.shouldShowFieldError('phone');
      });
    });

    context('Cuando ingresa contraseñas que no coinciden', () => {
      it('Entonces debe mostrar error de contraseñas no coinciden', () => {
        // Given
        cy.fixture('users').then((users) => {
          const user = { ...users.validUser, confirmPassword: 'OtraPass123!' };

          // When
          registerPage.fillForm(user).submit();

          // Then
          cy.get('.field-error').should('contain.text', 'Las contraseñas no coinciden');
        });
      });
    });

    context('Cuando ingresa un email inválido', () => {
      it('Entonces debe mostrar error de email inválido', () => {
        // When
        cy.get('input[id="email"]').type('correo-invalido');
        cy.get('input[id="first_name"]').click();

        // Then
        cy.get('.field-error').should('contain.text', 'válido');
      });
    });

    context('Cuando ingresa datos válidos con un email ya registrado', () => {
      it('Entonces debe mostrar error de email ya registrado', () => {
        // Given
        cy.fixture('users').then((users) => {
          const user = { ...users.validUser, email: users.existingUser.email };

          // When
          registerPage.fillForm(user).submit();

          // Then
          registerPage.shouldShowError('Este correo ya está registrado');
        });
      });
    });

    context('Cuando ingresa todos los datos válidos con email nuevo', () => {
      it('Entonces debe registrar exitosamente un usuario viajero y redirigir al login', () => {
        // Given
        const user = generateUser('traveler');

        // When
        registerPage.fillForm(user).submit();

        // Then
        registerPage.shouldShowSuccess();
        registerPage.shouldBeRedirectedTo('/login');
      });

      it('Entonces debe registrar exitosamente un usuario hotel y redirigir al login', () => {
        // Given
        const user = generateUser('hotel');

        // When
        registerPage.fillForm(user).submit();

        // Then
        registerPage.shouldShowSuccess();
        registerPage.shouldBeRedirectedTo('/login');
      });
    });
  });

  context('Dado que el usuario ya tiene cuenta', () => {
    context('Cuando hace clic en iniciar sesión', () => {
      it('Entonces debe navegar a la página de login', () => {
        // When
        registerPage.goToLogin();

        // Then
        registerPage.shouldBeRedirectedTo('/login');
      });
    });
  });
});
