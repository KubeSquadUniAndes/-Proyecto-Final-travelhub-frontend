import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../services/auth.service';
import { Booking } from '../../services/bookings.service';

const mockBookings: Booking[] = [
  { id: 'b1', resource_id: 'r1', start_time: '2026-09-01T14:00:00Z', end_time: '2026-09-05T12:00:00Z', room_type: 'Suite', num_guests: 2, price_per_night: '200.00', traveler_name: 'Juan', traveler_email: 'j@e.com', traveler_phone: '+57300', traveler_document: 'CC-123', status: 'confirmed', status_display: 'Confirmada', booking_code: 'TH-2026-A1', total_nights: 4, total_price: '800.00', taxes: '152.00', final_price: '952.00', cancellable: false },
  { id: 'b2', resource_id: 'r2', start_time: '2026-08-10T14:00:00Z', end_time: '2026-08-15T12:00:00Z', room_type: 'Doble', num_guests: 3, price_per_night: '150.00', traveler_name: 'Ana', traveler_email: 'a@e.com', traveler_phone: '+57301', traveler_document: 'CC-456', status: 'pending', status_display: 'Pendiente de pago', booking_code: 'TH-2026-B2', cancellable: true },
  { id: 'b3', resource_id: 'r3', start_time: '2026-07-01T14:00:00Z', end_time: '2026-07-03T12:00:00Z', room_type: 'Individual', num_guests: 1, price_per_night: '100.00', traveler_name: 'Carlos', traveler_email: 'c@e.com', traveler_phone: '+57302', traveler_document: 'CC-789', status: 'cancelled', status_display: 'Cancelada', booking_code: 'TH-2026-C3', cancellable: false },
];

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: "booking-confirmed", component: DashboardComponent }]),
        { provide: AuthService, useValue: { logout: vi.fn(), userType: () => 'traveler' } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => { expect(component).toBeTruthy(); });

  it('should load bookings on init', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    expect(component.allReservas().length).toBe(3);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle error on load', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).error(new ProgressEvent('error'));
    expect(component.hasError()).toBe(true);
  });

  it('should filter by search query', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    component.searchQuery.set('TH-2026-A1');
    expect(component.filteredReservas().length).toBe(1);
  });

  it('should filter by booking code', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    component.searchQuery.set('TH-2026-B2');
    expect(component.filteredReservas()[0].booking_code).toBe('TH-2026-B2');
  });

  it('should filter by estado', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    component.estadoFilter.set('pending');
    expect(component.filteredReservas().length).toBe(1);
  });

  it('should paginate', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    expect(component.paginatedReservas().length).toBeLessThanOrEqual(20);
  });

  it('should clear filters', () => {
    component.searchQuery.set('test');
    component.estadoFilter.set('confirmed');
    component.clearFilters();
    expect(component.searchQuery()).toBe('');
    expect(component.estadoFilter()).toBe('');
  });

  it('should toggle detail view', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    component.viewDetail(mockBookings[0]);
    expect(component.selectedBooking()?.id).toBe('b1');
    component.viewDetail(mockBookings[0]);
    expect(component.selectedBooking()).toBeNull();
  });

  it('should open edit modal', () => {
    component.openEdit(mockBookings[0]);
    expect(component.showEditModal()).toBe(true);
    expect(component.editingBooking()?.id).toBe('b1');
  });

  it('should close edit modal', () => {
    component.openEdit(mockBookings[0]);
    component.closeEdit();
    expect(component.showEditModal()).toBe(false);
    expect(component.editingBooking()).toBeNull();
  });

  it('should save edit', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    component.openEdit(mockBookings[0]);
    component.editForm = { start_time: '2026-09-02', end_time: '2026-09-06', notes: 'Late' };
    component.saveEdit();
    httpMock.expectOne(r => r.method === 'PATCH').flush(mockBookings[0]);
    httpMock.expectOne(r => r.method === 'GET').flush(mockBookings);
    expect(component.showEditModal()).toBe(false);
  });

  it('should handle edit error', () => {
    component.openEdit(mockBookings[0]);
    component.saveEdit();
    httpMock.expectOne(r => r.method === 'PATCH').error(new ProgressEvent('error'));
    expect(component.toastType()).toBe('error');
  });

  it('should open cancel modal', () => {
    component.openCancel(mockBookings[1]);
    expect(component.showCancelModal()).toBe(true);
    expect(component.cancellingBooking()?.id).toBe('b2');
  });

  it('should close cancel modal', () => {
    component.openCancel(mockBookings[1]);
    component.closeCancel();
    expect(component.showCancelModal()).toBe(false);
  });

  it('should confirm cancel', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    component.openCancel(mockBookings[1]);
    component.cancelReason = 'Cambio de planes';
    component.confirmCancel();
    httpMock.expectOne(r => r.method === 'DELETE').flush(null);
    httpMock.expectOne(r => r.method === 'GET').flush([mockBookings[0], mockBookings[2]]);
    expect(component.showCancelModal()).toBe(false);
  });

  it('should return correct estadoClass', () => {
    expect(component.estadoClass('pending')).toBe('status-pending');
    expect(component.estadoClass('confirmed')).toBe('status-confirmed');
    expect(component.estadoClass('cancelled')).toBe('status-cancelled');
    expect(component.estadoClass('unknown')).toBe('');
  });

  it('should return correct estadoLabel', () => {
    expect(component.estadoLabel('pending')).toBe('Pendiente');
    expect(component.estadoLabel('confirmed')).toBe('Confirmada');
  });

  it('should format date', () => {
    expect(component.formatDate('2026-09-01T14:00:00Z')).toBeTruthy();
    expect(component.formatDate('')).toBe('');
  });

  it('should show pagination label', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    expect(component.paginationLabel()).toContain('1-3 de 3');
  });

  it('should render table', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('TH-2026-A1');
  });

  it('should render empty state', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
  });

  it('should render error state', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).error(new ProgressEvent('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.error-state')).toBeTruthy();
  });

  it('should show loading state', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.loading')).toBeTruthy();
  });
});

describe('DashboardComponent - Template', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: "booking-confirmed", component: DashboardComponent }]),
        { provide: AuthService, useValue: { logout: vi.fn(), userType: () => 'traveler' } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should render filters bar with bookings', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.filters-bar')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#search')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#estado')).toBeTruthy();
  });

  it('should render action buttons in table rows', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.btn-action').length).toBeGreaterThan(0);
  });

  it('should render cancel button only for cancellable bookings', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    const cancelBtns = fixture.nativeElement.querySelectorAll('.btn-cancel-action');
    expect(cancelBtns.length).toBe(1);
  });

  it('should show detail row when booking selected', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    component.viewDetail(mockBookings[0]);
    fixture.detectChanges();
    const detail = fixture.nativeElement.querySelector('.detail-row');
    expect(detail).toBeTruthy();
    expect(detail.textContent).toContain('TH-2026-A1');
    expect(detail.textContent).toContain('Juan');
  });

  it('should show edit modal when opened', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    component.openEdit(mockBookings[0]);
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.modal');
    expect(modal).toBeTruthy();
    expect(modal.textContent).toContain('Editar Reserva');
  });

  it('should show cancel modal when opened', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    component.openCancel(mockBookings[1]);
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.modal');
    expect(modal).toBeTruthy();
    expect(modal.textContent).toContain('Cancelar Reserva');
  });

  it('should show toast message', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    component.toastMessage.set('Test toast');
    component.toastType.set('success');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.toast')).toBeTruthy();
  });

  it('should show error toast', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    component.toastMessage.set('Error');
    component.toastType.set('error');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.toast-error')).toBeTruthy();
  });

  it('should render pagination', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.pagination')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.pagination-label')).toBeTruthy();
  });

  it('should render Nueva Reserva button', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nueva Reserva');
  });

  it('should render booking codes in table', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('TH-2026-A1');
    expect(fixture.nativeElement.textContent).toContain('TH-2026-B2');
  });

  it('should render status badges', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.status').length).toBe(3);
  });

  it('should handle cancel error', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    component.openCancel(mockBookings[1]);
    component.cancelReason = 'Motivo test';
    component.confirmCancel();
    httpMock.expectOne(r => r.method === 'DELETE').error(new ProgressEvent('error'));
    expect(component.toastType()).toBe('error');
  });

  it('should not cancel if no booking selected', () => {
    component.confirmCancel();
    expect(component.showCancelModal()).toBe(false);
  });

  it('should not save edit if no booking selected', () => {
    component.saveEdit();
    expect(component.showEditModal()).toBe(false);
  });

  it('should filter by fecha desde', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    component.fechaDesde.set('2026-08-01');
    expect(component.filteredReservas().length).toBeLessThan(3);
  });

  it('should filter by fecha hasta', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    component.fechaHasta.set('2026-08-01');
    expect(component.filteredReservas().length).toBeLessThan(3);
  });

  it('should show empty filtered state', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    component.searchQuery.set('zzzzzzzzz');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
  });

  it('should get pages', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    expect(component.getPages().length).toBeGreaterThan(0);
  });

  it('should close detail', () => {
    component.selectedBooking.set(mockBookings[0]);
    component.closeDetail();
    expect(component.selectedBooking()).toBeNull();
  });
});

describe('DashboardComponent - Payment & Cancel', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: "booking-confirmed", component: DashboardComponent }]),
        { provide: AuthService, useValue: { logout: vi.fn(), userType: () => 'traveler' } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should open payment modal', () => {
    component.openPayment(mockBookings[1]);
    expect(component.showPaymentModal()).toBe(true);
    expect(component.payingBooking()?.id).toBe('b2');
  });

  it('should close payment modal', () => {
    component.openPayment(mockBookings[1]);
    component.closePayment();
    expect(component.showPaymentModal()).toBe(false);
  });

  it('should detect Visa brand', () => {
    component.onCardNumberInput('4242424242424242');
    expect(component.cardBrand()).toBe('Visa');
  });

  it('should detect Mastercard brand', () => {
    component.onCardNumberInput('5555555555554444');
    expect(component.cardBrand()).toBe('Mastercard');
  });

  it('should detect Amex brand', () => {
    component.onCardNumberInput('378282246310005');
    expect(component.cardBrand()).toBe('Amex');
  });

  it('should format card number with spaces', () => {
    component.onCardNumberInput('4242424242424242');
    expect(component.paymentForm.cardNumber).toBe('4242 4242 4242 4242');
  });

  it('should format expiry with slash', () => {
    component.onExpiryInput('1228');
    expect(component.paymentForm.expiry).toBe('12/28');
  });

  it('should limit CVV to digits only', () => {
    component.onCvvInput('12a3');
    expect(component.paymentForm.cvv).toBe('123');
  });

  it('should fail validation with empty fields', () => {
    expect(component.validatePayment()).toBe(false);
    expect(Object.keys(component.cardErrors()).length).toBeGreaterThan(0);
  });

  it('should fail validation with invalid card number', () => {
    component.onCardNumberInput('1234567890123456');
    component.paymentForm.cardName = 'Test';
    component.onExpiryInput('1228');
    component.onCvvInput('123');
    expect(component.validatePayment()).toBe(false);
    expect(component.cardErrors()['cardNumber']).toBeTruthy();
  });

  it('should fail validation with expired card', () => {
    component.onCardNumberInput('4242424242424242');
    component.paymentForm.cardName = 'Test';
    component.onExpiryInput('0120');
    component.onCvvInput('123');
    expect(component.validatePayment()).toBe(false);
    expect(component.cardErrors()['expiry']).toContain('vencida');
  });

  it('should pass validation with valid data', () => {
    component.onCardNumberInput('4242424242424242');
    component.paymentForm.cardName = 'Test User';
    component.onExpiryInput('1228');
    component.onCvvInput('123');
    expect(component.validatePayment()).toBe(true);
  });

  it('should require 4 digit CVV for Amex', () => {
    component.onCardNumberInput('378282246310005');
    component.paymentForm.cardName = 'Test';
    component.onExpiryInput('1228');
    component.onCvvInput('123');
    expect(component.validatePayment()).toBe(false);
    expect(component.cardErrors()['cvv']).toContain('4');
  });

  it('should process payment successfully', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    component.openPayment(mockBookings[1]);
    component.onCardNumberInput('4242424242424242');
    component.paymentForm.cardName = 'Test';
    component.onExpiryInput('1228');
    component.onCvvInput('123');
    component.confirmPayment();
    httpMock.expectOne(r => r.method === 'PATCH').flush({ ...mockBookings[1], status: 'confirmed' });
    expect(component.showPaymentModal()).toBe(false);
  });

  it('should handle payment error with retry', () => {
    vi.useFakeTimers();
    component.openPayment(mockBookings[1]);
    component.onCardNumberInput('4242424242424242');
    component.paymentForm.cardName = 'Test';
    component.onExpiryInput('1228');
    component.onCvvInput('123');
    component.confirmPayment();
    // Fail 3 times
    httpMock.expectOne(r => r.method === 'PATCH').error(new ProgressEvent('error'));
    vi.advanceTimersByTime(1000);
    httpMock.expectOne(r => r.method === 'PATCH').error(new ProgressEvent('error'));
    vi.advanceTimersByTime(1000);
    httpMock.expectOne(r => r.method === 'PATCH').error(new ProgressEvent('error'));
    expect(component.isProcessingPayment()).toBe(false);
    expect(component.toastMessage()).toContain('varios intentos');
    vi.useRealTimers();
  });

  it('should not confirm payment without validation', () => {
    component.openPayment(mockBookings[1]);
    component.confirmPayment();
    expect(component.isProcessingPayment()).toBe(false);
  });

  it('should open cancel with empty reason', () => {
    component.openCancel(mockBookings[1]);
    expect(component.cancelReason).toBe('');
    expect(component.isCancelling()).toBe(false);
  });

  it('should not cancel without reason', () => {
    component.openCancel(mockBookings[1]);
    component.cancelReason = '';
    component.confirmCancel();
    expect(component.showCancelModal()).toBe(true);
  });

  it('should show refund in cancel toast', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    component.openCancel(mockBookings[0]);
    component.cancelReason = 'Cambio de planes';
    component.confirmCancel();
    httpMock.expectOne(r => r.method === 'DELETE').flush(null);
    httpMock.expectOne(r => r.method === 'GET').flush([]);
    expect(component.toastMessage()).toContain('952.00');
  });

  it('should render payment modal', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    component.openPayment(mockBookings[1]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.modal')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Pagar Reserva');
  });

  it('should render cancel modal with reason field', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    component.openCancel(mockBookings[1]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#cancel-reason')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Motivo de cancelación');
  });

  it('should render pay button only for pending', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.btn-pay-action').length).toBe(1);
  });

  it('should detect Discover brand', () => {
    component.onCardNumberInput('6011111111111117');
    expect(component.cardBrand()).toBe('Discover');
  });

  it('should detect Diners brand', () => {
    component.onCardNumberInput('30569309025904');
    expect(component.cardBrand()).toBe('Diners');
  });

  it('should return empty brand for unknown', () => {
    component.onCardNumberInput('9999');
    expect(component.cardBrand()).toBe('');
  });
});
