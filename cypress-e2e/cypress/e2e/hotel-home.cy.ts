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

describe('Hotel Dashboard Analítico', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.loginAsUser('hotel');
    cy.visit('/hotel-dashboard');
  });

  context('Dado que el usuario hotel está en el dashboard analítico', () => {
    it('Entonces debe ver el título Dashboard Analítico', () => {
      cy.contains('Dashboard Anal').should('be.visible');
    });

    it('Entonces debe ver los KPIs principales', () => {
      cy.contains('Ingresos Brutos').should('be.visible');
      cy.contains('Tasa de Ocupación').should('be.visible');
      cy.contains('ADR').should('be.visible');
      cy.contains('RevPAR').should('be.visible');
    });

    it('Entonces debe ver los filtros de periodo', () => {
      cy.get('.period-buttons').should('be.visible');
      cy.contains('button', 'Hoy').should('be.visible');
      cy.contains('button', '7 días').should('be.visible');
      cy.contains('button', 'Mes').should('be.visible');
      cy.contains('button', 'Año').should('be.visible');
    });

    it('Entonces debe ver la sección de gráficos', () => {
      cy.get('.charts-grid').should('exist');
      cy.contains('Tendencia de Reservas').should('be.visible');
      cy.contains('Distribución por Tipo').should('be.visible');
    });

    it('Entonces debe ver la sección de habitaciones populares', () => {
      cy.contains('Habitaciones Más Populares').should('be.visible');
    });

    it('Entonces debe ver el botón de generar reporte', () => {
      cy.contains('Generar Reporte').should('be.visible');
    });

    it('Cuando cambia el periodo a Año, debe actualizar', () => {
      cy.contains('button', 'Año').click();
      cy.get('.period-buttons button.active').should('contain', 'Año');
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
  });

  context('Dado que el hotel quiere generar un reporte', () => {
    it('Cuando hace clic en Generar Reporte, debe abrir el modal', () => {
      cy.contains('Generar Reporte').click();
      cy.get('.report-modal').should('be.visible');
      cy.contains('Reporte de Ingresos').should('be.visible');
    });

    it('Entonces debe ver el formulario con opciones', () => {
      cy.contains('Generar Reporte').click();
      cy.get('#rFrom').should('be.visible');
      cy.get('#rTo').should('be.visible');
      cy.get('#rGroup').should('be.visible');
      cy.get('#rType').should('be.visible');
    });

    it('Cuando genera el reporte, debe mostrar resultados', () => {
      cy.contains('Generar Reporte').click();
      cy.get('.report-modal').find('button').contains('Generar Reporte').click();
      cy.get('.report-results').should('be.visible');
    });

    it('Entonces debe ver botones de exportación', () => {
      cy.contains('Generar Reporte').click();
      cy.get('.report-modal').find('button').contains('Generar Reporte').click();
      cy.contains('Descargar PDF').should('be.visible');
      cy.contains('Descargar Excel').should('be.visible');
    });

    it('Cuando cierra el modal, debe desaparecer', () => {
      cy.contains('Generar Reporte').click();
      cy.contains('button', 'Cerrar').click();
      cy.get('.report-modal').should('not.exist');
    });
  });
});
