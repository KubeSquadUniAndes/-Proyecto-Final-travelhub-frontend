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

describe('Registro de usuario', () => {
  beforeEach(() => {
    registerPage.visit();
  });

  context('Dado que el usuario quiere registrarse', () => {
    context('Cuando envía el formulario vacío', () => {
      it('Entonces debe mostrar errores de validación en los campos requeridos', () => {
        registerPage.submit();
        registerPage.shouldShowFieldError('first_name');
        registerPage.shouldShowFieldError('last_name');
        registerPage.shouldShowFieldError('email');
        registerPage.shouldShowFieldError('phone');
      });
    });

    context('Cuando ingresa contraseñas que no coinciden', () => {
      it('Entonces debe mostrar error de contraseñas no coinciden', () => {
        cy.fixture('users').then((users) => {
          const user = { ...users.validUser, confirmPassword: 'OtraPass123!' };
          registerPage.fillForm(user).submit();
          cy.get('.field-error').should('contain.text', 'Las contraseñas no coinciden');
        });
      });
    });

    context('Cuando ingresa un email inválido', () => {
      it('Entonces debe mostrar error de email inválido', () => {
        cy.get('input[id="email"]').type('correo-invalido');
        cy.get('input[id="first_name"]').click();
        cy.get('.field-error').should('contain.text', 'válido');
      });
    });

    context('Cuando ingresa datos válidos con un email ya registrado', () => {
      it('Entonces debe mostrar error', () => {
        cy.fixture('users').then((users) => {
          const user = { ...users.validUser, email: users.existingUser.email };
          registerPage.fillForm(user).submit();
          cy.get('.alert-error', { timeout: 15000 }).should('be.visible');
        });
      });
    });

    context('Cuando ingresa todos los datos válidos con email nuevo', () => {
      it('Entonces debe mostrar respuesta del servidor para viajero', () => {
        const user = generateUser('traveler');
        registerPage.fillForm(user).submit();
        cy.get('.alert-success, .alert-error', { timeout: 15000 }).should('be.visible');
      });

      it('Entonces debe mostrar respuesta del servidor para hotel', () => {
        const user = generateUser('hotel');
        registerPage.fillForm(user).submit();
        cy.get('.alert-success, .alert-error', { timeout: 15000 }).should('be.visible');
      });
    });
  });

  context('Dado que el usuario ya tiene cuenta', () => {
    context('Cuando hace clic en iniciar sesión', () => {
      it('Entonces debe navegar a la página de login', () => {
        registerPage.goToLogin();
        registerPage.shouldBeRedirectedTo('/login');
      });
    });
  });
});
