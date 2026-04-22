import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { HotelHomeComponent } from './hotel-home.component';
import { AuthService } from '../../services/auth.service';
import { Booking } from '../../services/bookings.service';

const mockBookings: Booking[] = [
  { id: 'b1', resource_id: 'r1', start_time: '2026-09-01T14:00:00Z', end_time: '2026-09-05T12:00:00Z', room_type: 'Suite', num_guests: 2, price_per_night: '200.00', traveler_name: 'María García', traveler_email: 'm@e.com', traveler_phone: '+57300', traveler_document: 'CC-123', status: 'pending', status_display: 'Pendiente', booking_code: 'TH-2026-A1', final_price: '952.00', cancellable: true },
  { id: 'b2', resource_id: 'r2', start_time: '2026-08-10T14:00:00Z', end_time: '2026-08-15T12:00:00Z', room_type: 'Doble', num_guests: 3, price_per_night: '150.00', traveler_name: 'Carlos Rodríguez', traveler_email: 'c@e.com', traveler_phone: '+57301', traveler_document: 'CC-456', status: 'confirmed', status_display: 'Confirmada', booking_code: 'TH-2026-B2', cancellable: false },
];

describe('HotelHomeComponent', () => {
  let component: HotelHomeComponent;
  let fixture: ComponentFixture<HotelHomeComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelHomeComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn(), userType: () => 'hotel', currentUser: () => ({ full_name: 'Hotel Test' }) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HotelHomeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
  });

  it('should create', () => { expect(component).toBeTruthy(); });

  it('should have hotel name', () => { expect(component.hotelName()).toBe('Hotel Test'); });

  it('should have menu items', () => {
    expect(component.menuItems.length).toBe(4);
    expect(component.menuItems.map(m => m.action)).toEqual(['detail', 'approve', 'reject', 'reports']);
  });

  it('should load reservas on init', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    expect(component.reservas().length).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle load error', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).error(new ProgressEvent('error'));
    expect(component.hasError()).toBe(true);
  });

  it('should count pending', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    expect(component.pendingCount()).toBe(1);
  });

  it('should count confirmed', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    expect(component.confirmedCount()).toBe(1);
  });

  it('should toggle detail', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    component.onMenuAction('detail', mockBookings[0]);
    expect(component.selectedReserva()?.id).toBe('b1');
    component.onMenuAction('detail', mockBookings[0]);
    expect(component.selectedReserva()).toBeNull();
  });

  it('should approve pending reserva', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    component.approveReserva(mockBookings[0]);
    httpMock.expectOne(r => r.method === 'PATCH').flush({ ...mockBookings[0], status: 'confirmed' });
    httpMock.expectOne(r => r.method === 'GET').flush(mockBookings);
    expect(component.toastMessage()).toContain('aprobada');
  });

  it('should not approve non-pending', () => {
    component.approveReserva(mockBookings[1]);
    expect(component.toastType()).toBe('error');
  });

  it('should open reject modal for pending', () => {
    component.openRejectModal(mockBookings[0]);
    expect(component.showRejectModal()).toBe(true);
  });

  it('should not open reject for non-pending', () => {
    component.openRejectModal(mockBookings[1]);
    expect(component.showRejectModal()).toBe(false);
  });

  it('should confirm reject with reason', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    component.openRejectModal(mockBookings[0]);
    component.rejectReason = 'No disponible';
    component.confirmReject();
    httpMock.expectOne(r => r.method === 'PATCH').flush({ ...mockBookings[0], status: 'cancelled' });
    httpMock.expectOne(r => r.method === 'GET').flush(mockBookings);
    expect(component.showRejectModal()).toBe(false);
  });

  it('should cancel reject', () => {
    component.openRejectModal(mockBookings[0]);
    component.cancelReject();
    expect(component.showRejectModal()).toBe(false);
    expect(component.rejectingReserva()).toBeNull();
  });

  it('should navigate to dashboard on reports', () => {
    component.onMenuAction('reports');
    expect(router.navigate).toHaveBeenCalledWith(['/hotel-dashboard']);
  });

  it('should format date', () => {
    expect(component.formatDate('2026-09-01T14:00:00Z')).toBeTruthy();
    expect(component.formatDate('')).toBe('');
  });

  it('should return estadoClass', () => {
    expect(component.estadoClass('pending')).toBe('status-pending');
    expect(component.estadoClass('confirmed')).toBe('status-confirmed');
    expect(component.estadoClass('unknown')).toBe('');
  });

  it('should render reserva cards', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.reserva-card').length).toBe(2);
  });

  it('should render navigation', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    const navLinks = fixture.nativeElement.querySelectorAll('nav a');
    expect(navLinks.length).toBe(3);
  });

  it('should render sidebar stats', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.sidebar-stats')).toBeTruthy();
  });

  it('should show empty state when no reservas', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
  });

  it('should show approve/reject only for pending', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings')).flush(mockBookings);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.btn-approve-sm').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('.btn-reject-sm').length).toBe(1);
  });
});
