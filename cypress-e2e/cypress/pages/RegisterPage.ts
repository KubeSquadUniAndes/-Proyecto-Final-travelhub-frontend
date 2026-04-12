export class RegisterPage {
  // Selectors
  private firstNameInput = 'input[id="first_name"]';
  private lastNameInput = 'input[id="last_name"]';
  private emailInput = 'input[id="email"]';
  private phoneInput = 'input[id="phone"]';
  private countryInput = 'input[id="country"]';
  private cityInput = 'input[id="city"]';
  private birthDateInput = 'input[id="birth_date"]';
  private idTypeSelect = 'select[id="identification_type"]';
  private idNumberInput = 'input[id="identification_number"]';
  private userTypeSelect = 'select[id="user_type"]';
  private passwordInput = 'input[id="password"]';
  private confirmPasswordInput = 'input[id="confirmPassword"]';
  private submitButton = 'button[type="submit"]';
  private errorAlert = '.alert-error';
  private successAlert = '.alert-success';
  private loginLink = '.link-btn';

  // Actions
  visit() {
    cy.visit('/register');
    return this;
  }

  fillForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    birthDate: string;
    idType?: string;
    idNumber: string;
    userType?: string;
    password: string;
    confirmPassword: string;
  }) {
    cy.get(this.firstNameInput).clear().type(data.firstName);
    cy.get(this.lastNameInput).clear().type(data.lastName);
    cy.get(this.emailInput).clear().type(data.email);
    cy.get(this.phoneInput).clear().type(data.phone);
    cy.get(this.countryInput).clear().type(data.country);
    cy.get(this.cityInput).clear().type(data.city);
    cy.get(this.birthDateInput).type(data.birthDate);
    if (data.idType) cy.get(this.idTypeSelect).select(data.idType);
    cy.get(this.idNumberInput).clear().type(data.idNumber);
    if (data.userType) cy.get(this.userTypeSelect).select(data.userType);
    cy.get(this.passwordInput).clear().type(data.password);
    cy.get(this.confirmPasswordInput).clear().type(data.confirmPassword);
    return this;
  }

  submit() {
    cy.get(this.submitButton).click();
    return this;
  }

  goToLogin() {
    cy.get(this.loginLink).click();
    return this;
  }

  // Assertions
  shouldShowError(message: string) {
    cy.get(this.errorAlert).should('contain.text', message);
    return this;
  }

  shouldShowSuccess() {
    cy.get(this.successAlert).should('be.visible');
    return this;
  }

  shouldShowFieldError(fieldId: string) {
    cy.get(`#${fieldId}`).should('have.class', 'input-error');
    return this;
  }

  shouldBeRedirectedTo(path: string) {
    cy.url().should('include', path);
    return this;
  }
}
