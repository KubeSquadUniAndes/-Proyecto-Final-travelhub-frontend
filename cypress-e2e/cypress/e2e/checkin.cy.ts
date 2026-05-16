describe('Check-In QR', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.loginAsUser('hotel');
    cy.visit('/checkin');
  });

  context('Dado que el hotel accede al Check-In', () => {
    it('Entonces debe ver el título Check-In con QR', () => {
      cy.contains('Check-In con QR').should('be.visible');
    });

    it('Entonces debe ver la navegación completa', () => {
      cy.contains('Inicio').should('be.visible');
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Habitaciones').should('be.visible');
      cy.contains('Check-In').should('be.visible');
    });

    it('Entonces debe ver el escáner o mensaje de cámara', () => {
      cy.get('.scanner-card, .status-card').should('exist');
    });

    it('Entonces debe ver la instrucción de escaneo', () => {
      cy.contains('Apunte la cámara').should('be.visible');
    });

    it('Cuando cierra sesión, debe ir al login', () => {
      cy.contains('Cerrar sesión').click();
      cy.url().should('include', '/login');
    });
  });
});
