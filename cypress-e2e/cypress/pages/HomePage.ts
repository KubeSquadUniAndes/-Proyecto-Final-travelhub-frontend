export class HomePage {
  // Selectors
  private logo = 'a:contains("TravelHub")';
  private navHome = 'nav a:contains("Home")';
  private navHotels = 'nav a:contains("Hotels")';
  private navDashboard = 'nav a:contains("Dashboard")';
  private misReservasBtn = 'button:contains("Mis Reservas")';
  private cerrarSesionBtn = 'button:contains("Cerrar sesión")';
  private heroTitle = 'h1';
  private searchInput = 'input[id="destino"]';
  private searchBtn = 'button:contains("Buscar")';
  private hotelCards = 'h3';
  private reservarBtns = 'button:contains("Reservar")';

  // Assertions
  shouldBeOnHomePage() {
    cy.url().should('include', '/home');
    return this;
  }

  shouldShowNavigation() {
    cy.contains('TravelHub').should('be.visible');
    cy.contains('Home').should('be.visible');
    cy.contains('Hoteles').should('be.visible');
    return this;
  }

  shouldShowHeroSection() {
    cy.get(this.heroTitle).should('contain.text', 'Encuentra tu hotel ideal');
    return this;
  }

  shouldShowSearchForm() {
    cy.get(this.searchInput).should('be.visible');
    cy.get(this.searchBtn).should('be.visible');
    return this;
  }

  shouldShowHotelListings() {
    cy.get(this.reservarBtns).should('have.length.greaterThan', 0);
    return this;
  }

  shouldShowLogoutButton() {
    cy.get(this.cerrarSesionBtn).should('be.visible');
    return this;
  }

  logout() {
    cy.get(this.cerrarSesionBtn).click();
    return this;
  }
}
