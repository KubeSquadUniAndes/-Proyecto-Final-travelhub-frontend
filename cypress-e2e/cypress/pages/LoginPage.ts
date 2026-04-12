export class LoginPage {
  // Selectors
  private emailInput = 'input[id="email"]';
  private passwordInput = 'input[id="password"]';
  private submitButton = 'button[type="submit"]';
  private errorAlert = '.alert-error';
  private registerLink = '.link-btn';

  // Actions
  visit() {
    cy.visit('/login');
    return this;
  }

  fillEmail(email: string) {
    cy.get(this.emailInput).clear().type(email);
    return this;
  }

  fillPassword(password: string) {
    cy.get(this.passwordInput).clear().type(password);
    return this;
  }

  submit() {
    cy.get(this.submitButton).click();
    return this;
  }

  goToRegister() {
    cy.get(this.registerLink).click();
    return this;
  }

  // Assertions
  shouldShowError(message: string) {
    cy.get(this.errorAlert).should('contain.text', message);
    return this;
  }

  shouldBeOnLoginPage() {
    cy.url().should('include', '/login');
    return this;
  }

  shouldBeRedirectedTo(path: string) {
    cy.url().should('include', path);
    return this;
  }
}
