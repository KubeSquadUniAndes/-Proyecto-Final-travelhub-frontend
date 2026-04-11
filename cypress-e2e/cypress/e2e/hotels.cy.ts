import { LoginPage } from '../pages/LoginPage';

const loginPage = new LoginPage();

describe('Hoteles', () => {
  beforeEach(() => {
    cy.fixture('users').then((users) => {
      loginPage.visit();
      loginPage
        .fillEmail(users.existingUser.email)
        .fillPassword(users.existingUser.password)
        .submit();
      cy.url().should('include', '/home');
      cy.contains('Hoteles').click();
      cy.url().should('include', '/search');
    });
  });

  context('Dado que el viajero accede al menú de Hoteles', () => {
    context('Cuando accede a la página de hoteles', () => {
      it('Entonces debe ver el título Buscar Hoteles', () => {
        cy.contains('Buscar Hoteles').should('be.visible');
      });

      it('Entonces debe ver el buscador de hoteles', () => {
        cy.get('input[placeholder="Buscar por nombre de hotel..."]').should('be.visible');
      });

      it('Entonces debe ver el listado de hoteles', () => {
        cy.contains('Hotel Paradise').should('be.visible');
        cy.contains('Beach Resort').should('be.visible');
        cy.contains('City Center Hotel').should('be.visible');
      });

      it('Entonces debe ver el menú igual al del home', () => {
        cy.contains('Inicio').should('be.visible');
        cy.contains('Hoteles').should('be.visible');
        cy.contains('Mis Reservas').should('be.visible');
        cy.contains('Cerrar sesión').should('be.visible');
      });
    });

    context('Cuando filtra por nombre', () => {
      it('Entonces debe mostrar solo los hoteles que coinciden', () => {
        // When
        cy.get('input[placeholder="Buscar por nombre de hotel..."]').type('Beach');

        // Then
        cy.contains('Beach Resort').should('be.visible');
        cy.contains('Hotel Paradise').should('not.exist');
        cy.contains('City Center Hotel').should('not.exist');
      });

      it('Entonces debe mostrar mensaje cuando no hay resultados', () => {
        // When
        cy.get('input[placeholder="Buscar por nombre de hotel..."]').type('xyz123');

        // Then
        cy.contains('No se encontraron hoteles').should('be.visible');
      });

      it('Entonces debe mostrar todos al limpiar el filtro', () => {
        // Given
        cy.get('input[placeholder="Buscar por nombre de hotel..."]').type('Beach');
        cy.contains('Hotel Paradise').should('not.exist');

        // When
        cy.get('input[placeholder="Buscar por nombre de hotel..."]').clear();

        // Then
        cy.contains('Hotel Paradise').should('be.visible');
        cy.contains('Beach Resort').should('be.visible');
        cy.contains('City Center Hotel').should('be.visible');
      });
    });

    context('Cuando navega de vuelta al Inicio', () => {
      it('Entonces debe redirigir al home', () => {
        // When
        cy.contains('Inicio').click();

        // Then
        cy.url().should('include', '/home');
      });
    });
  });
});
