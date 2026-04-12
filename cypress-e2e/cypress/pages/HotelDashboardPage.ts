export class HotelDashboardPage {
  // Selectors
  private navHome = 'nav a:contains("Home")';
  private searchInput = 'input[placeholder="Buscar por huésped o ID..."]';
  private reservasTable = 'table, .reservas-table';

  // Assertions
  shouldBeOnDashboardPage() {
    cy.url().should('include', '/hotel-dashboard');
    return this;
  }

  shouldShowTitle() {
    cy.contains('Dashboard de Reservas').should('be.visible');
    return this;
  }

  shouldShowMetrics() {
    cy.contains('Total Reservas').should('be.visible');
    cy.contains('Confirmadas').should('be.visible');
    cy.contains('Pendientes').should('be.visible');
    cy.contains('Ingresos').should('be.visible');
    return this;
  }

  shouldShowMetricValues() {
    cy.contains('Total Reservas').parent().find('*').should('not.be.empty');
    return this;
  }

  shouldShowReservasTable() {
    cy.contains('Reservas').should('be.visible');
    cy.contains('Huésped').should('be.visible');
    cy.contains('Check-in').should('be.visible');
    cy.contains('Check-out').should('be.visible');
    cy.contains('Estado').should('be.visible');
    return this;
  }

  shouldShowSearchInput() {
    cy.get(this.searchInput).should('be.visible');
    return this;
  }

  shouldShowReservasWithDifferentStatuses() {
    cy.contains('Confirmada').should('be.visible');
    cy.contains('Pendiente').should('be.visible');
    return this;
  }

  goToHome() {
    cy.get(this.navHome).click();
    return this;
  }
}
