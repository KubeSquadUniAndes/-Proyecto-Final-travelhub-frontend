describe('Hotel Home', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.loginAsUser('hotel');
    cy.visit('/hotel-home');
  });

  context('Dado que el usuario hotel inició sesión', () => {
    it('Entonces debe ver el nombre del hotel', () => {
      cy.contains('Hotel Admin').should('be.visible');
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

    it('Entonces debe ver el sidebar con estadísticas', () => {
      cy.contains('Pendientes').should('be.visible');
      cy.contains('Confirmadas').should('be.visible');
      cy.contains('Rechazadas').should('be.visible');
    });

    it('Entonces debe mostrar contenido (reservas, vacío o error)', () => {
      cy.get('.reserva-card, .empty-state, .loading-state').should('exist');
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
      cy.contains('Ingresos').should('be.visible');
    });

    it('Entonces debe mostrar contenido (tabla, vacío o cargando)', () => {
      cy.get('table, .empty-state, .loading-state, .error-state').should('exist');
    });

    it('Entonces debe ver la navegación', () => {
      cy.contains('Inicio').should('be.visible');
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Habitaciones').should('be.visible');
    });

    it('Cuando navega al Inicio, debe redirigir', () => {
      cy.contains('nav a', 'Inicio').click();
      cy.url().should('include', '/hotel-home');
    });

    it('Cuando navega a Habitaciones, debe redirigir', () => {
      cy.contains('nav a', 'Habitaciones').click();
      cy.url().should('include', '/manage-rooms');
    });
  });
});
