export class ManageRoomsPage {
  // Selectors
  private newRoomBtn = 'button:contains("Nueva Habitación")';
  private roomCards = '.room-card';
  private modal = '.modal';
  private modalOverlay = '.modal-overlay';
  private toast = '.toast';
  private emptyState = '.empty-state';
  private errorState = '.error-state';
  private loadingState = '.loading';

  // Form selectors
  private nameInput = '#name';
  private roomTypeSelect = '#room_type';
  private priceInput = '#price';
  private capacityInput = '#capacity';
  private bedsInput = '#beds';
  private sizeInput = '#size';
  private amenitiesInput = '#amenities';

  // Navigation
  visit() {
    cy.visit('/manage-rooms');
    return this;
  }

  shouldBeOnManageRoomsPage() {
    cy.url().should('include', '/manage-rooms');
    return this;
  }

  // Page assertions
  shouldShowTitle() {
    cy.contains('Gestionar Habitaciones').should('be.visible');
    return this;
  }

  shouldShowNavigation() {
    cy.contains('Inicio').should('be.visible');
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Habitaciones').should('be.visible');
    return this;
  }

  shouldShowNewRoomButton() {
    cy.contains('Nueva Habitación').should('be.visible');
    return this;
  }

  shouldShowRoomCards() {
    cy.get(this.roomCards).should('have.length.greaterThan', 0);
    return this;
  }

  shouldShowEmptyState() {
    cy.get(this.emptyState).should('be.visible');
    cy.contains('No hay habitaciones').should('be.visible');
    return this;
  }

  shouldShowRoomWithName(name: string) {
    cy.contains(name).should('be.visible');
    return this;
  }

  shouldNotShowRoomWithName(name: string) {
    cy.contains(name).should('not.exist');
    return this;
  }

  // Actions
  clickNewRoom() {
    cy.contains('Nueva Habitación').first().click();
    return this;
  }

  shouldShowModal() {
    cy.get(this.modal).should('be.visible');
    return this;
  }

  fillRoomForm(room: { name: string; type?: string; price: string; capacity?: number; beds?: string; size?: number; amenities?: string }) {
    cy.get(this.nameInput).clear().type(room.name);
    if (room.type) cy.get(this.roomTypeSelect).select(room.type);
    cy.get(this.priceInput).clear().type(room.price);
    if (room.capacity) cy.get(this.capacityInput).clear().type(room.capacity.toString());
    if (room.beds) cy.get(this.bedsInput).clear().type(room.beds);
    if (room.size) cy.get(this.sizeInput).clear().type(room.size.toString());
    if (room.amenities) cy.get(this.amenitiesInput).clear().type(room.amenities);
    return this;
  }

  submitForm() {
    cy.get(this.modal).find('button:contains("Crear"), button:contains("Guardar")').click();
    return this;
  }

  cancelForm() {
    cy.get(this.modal).find('button:contains("Cancelar")').click();
    return this;
  }

  clickEditRoom(name: string) {
    cy.contains(name).parents('.room-card').find('button:contains("Editar")').click();
    return this;
  }

  clickDeleteRoom(name: string) {
    cy.contains(name).parents('.room-card').find('button:contains("Eliminar")').click();
    return this;
  }

  confirmDelete() {
    cy.get('.modal').find('button:contains("Eliminar")').click();
    return this;
  }

  cancelDelete() {
    cy.get('.modal').find('button:contains("Cancelar")').click();
    return this;
  }

  // Toast
  shouldShowToast(text: string) {
    cy.get(this.toast).should('contain.text', text);
    return this;
  }

  // Navigation actions
  goToHome() {
    cy.contains('nav a', 'Inicio').click();
    return this;
  }

  goToDashboard() {
    cy.contains('nav a', 'Dashboard').click();
    return this;
  }

  logout() {
    cy.contains('Cerrar sesión').click();
    return this;
  }
}
