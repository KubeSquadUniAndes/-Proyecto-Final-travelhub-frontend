export class HotelHomePage {
  // Selectors
  private navDashboard = 'nav a:contains("Dashboard")';
  private cerrarSesionLink = 'a:contains("Cerrar sesión")';
  private reservaCards = '.reserva-card';
  private menuGestion = '.menu-item';

  // Assertions
  shouldBeOnHotelHomePage() {
    cy.url().should('include', '/hotel-home');
    return this;
  }

  shouldShowHotelName() {
    cy.contains('Grand Seaside Resort').should('be.visible');
    return this;
  }

  shouldShowNavigation() {
    cy.contains('Inicio').should('be.visible');
    cy.contains('Dashboard').should('be.visible');
    return this;
  }

  shouldShowGestionMenu() {
    cy.contains('Ver detalle').should('be.visible');
    cy.contains('Aprobar reserva').should('be.visible');
    cy.contains('Cancelar reserva').should('be.visible');
    cy.contains('Reportes / Dashboard').should('be.visible');
    return this;
  }

  shouldShowReservasList() {
    cy.contains('Reservas de Grand Seaside Resort').should('be.visible');
    cy.get(this.reservaCards).should('have.length.greaterThan', 0);
    return this;
  }

  shouldShowReservaWithStatus(status: string) {
    cy.contains(status).should('be.visible');
    return this;
  }

  goToDashboard() {
    cy.get(this.navDashboard).click();
    return this;
  }

  logout() {
    cy.get(this.cerrarSesionLink).click();
    return this;
  }
}
