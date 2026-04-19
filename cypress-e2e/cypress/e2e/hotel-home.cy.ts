describe('Hotel Home', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.loginAsUser('hotel');
    cy.visit('/hotel-home');
  });

  context('Dado que el usuario hotel inició sesión', () => {
    it('Entonces debe ver el nombre del hotel', () => {
      cy.contains('Grand Seaside Resort').should('be.visible');
    });

    it('Entonces debe ver la navegación', () => {
      cy.contains('Inicio').should('be.visible');
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Habitaciones').should('be.visible');
    });

    it('Entonces debe ver el menú de gestión', () => {
      cy.contains('Ver detalle').should('be.visible');
      cy.contains('Aprobar reserva').should('be.visible');
      cy.contains('Rechazar reserva').should('be.visible');
    });

    it('Entonces debe ver el listado de reservas', () => {
      cy.get('.reserva-card').should('have.length.greaterThan', 0);
    });

    it('Entonces debe ver reservas con estado Pendiente', () => {
      cy.contains('Pendiente').should('be.visible');
    });

    it('Cuando navega al Dashboard, debe redirigir', () => {
      cy.contains('nav a', 'Dashboard').click();
      cy.url().should('include', '/hotel-dashboard');
    });

    it('Cuando cierra sesión, debe ir al login', () => {
      cy.contains('Cerrar sesión').click();
      cy.url().should('include', '/login');
    });
  });
});

describe('Hotel Dashboard', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.loginAsUser('hotel');
    cy.visit('/hotel-dashboard');
  });

  context('Dado que el usuario hotel está en el dashboard', () => {
    it('Entonces debe ver el título Dashboard de Reservas', () => {
      cy.contains('Dashboard de Reservas').should('be.visible');
    });

    it('Entonces debe ver las métricas', () => {
      cy.contains('Total Reservas').should('be.visible');
      cy.contains('Confirmadas').should('be.visible');
      cy.contains('Pendientes').should('be.visible');
    });

    it('Entonces debe ver la tabla de reservas', () => {
      cy.contains('Huésped').should('be.visible');
      cy.contains('Check-in').should('be.visible');
      cy.contains('Estado').should('be.visible');
    });

    it('Entonces debe ver el buscador', () => {
      cy.get('input[placeholder*="Buscar"]').should('be.visible');
    });

    it('Cuando navega al Home, debe redirigir', () => {
      cy.contains('nav a', 'Home').click();
      cy.url().should('include', '/hotel-home');
    });
  });
});
