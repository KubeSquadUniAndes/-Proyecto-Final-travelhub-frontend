import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HotelDashboardComponent } from './hotel-dashboard.component';
import { AuthService } from '../../services/auth.service';

const mockBookings = [
  { id: 'b1', booking_code: 'BK-001', traveler_name: 'Juan', start_time: '2026-05-01T14:00:00', end_time: '2026-05-03T12:00:00', room_type: 'suite', num_guests: 2, price_per_night: 500000, status: 'pending', final_price: '1000000' },
  { id: 'b2', booking_code: 'BK-002', traveler_name: 'Ana', start_time: '2026-05-05T14:00:00', end_time: '2026-05-07T12:00:00', room_type: 'doble', num_guests: 3, price_per_night: 200000, status: 'confirmed', final_price: '400000' },
];

describe('HotelDashboardComponent', () => {
  let component: HotelDashboardComponent;
  let fixture: ComponentFixture<HotelDashboardComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelDashboardComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn(), currentUser: () => ({ id: 'h1', full_name: 'Hotel Test' }) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HotelDashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => { expect(component).toBeTruthy(); });

  it('should load reservas on init', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings/hotel/h1')).flush(mockBookings);
    expect(component.allReservas().length).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle load error', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings/hotel/')).error(new ProgressEvent('error'));
    expect(component.hasError()).toBe(true);
    expect(component.isLoading()).toBe(false);
  });

  it('should compute stats', () => {
    component.allReservas.set(mockBookings as any);
    expect(component.stats().total).toBe(2);
    expect(component.stats().pendientes).toBe(1);
    expect(component.stats().confirmadas).toBe(1);
    expect(component.stats().ingresos).toBe(400000);
  });

  it('should filter by search query', () => {
    component.allReservas.set(mockBookings as any);
    component.searchQuery.set('Juan');
    expect(component.filteredReservas().length).toBe(1);
  });

  it('should return all when no search', () => {
    component.allReservas.set(mockBookings as any);
    expect(component.filteredReservas().length).toBe(2);
  });

  it('should paginate', () => {
    component.allReservas.set(mockBookings as any);
    expect(component.paginatedReservas().length).toBe(2);
    expect(component.totalPages()).toBe(1);
  });

  it('should format date', () => {
    const d = component.formatDate('2026-05-01T14:00:00');
    expect(d).toBeTruthy();
  });

  it('should return empty for invalid date', () => {
    expect(component.formatDate('')).toBe('');
  });

  it('should return estado class', () => {
    expect(component.estadoClass('pending')).toBe('status-pending');
    expect(component.estadoClass('confirmed')).toBe('status-confirmed');
    expect(component.estadoClass('unknown')).toBe('');
  });

  it('should return estado label', () => {
    expect(component.estadoLabel('pending')).toBe('Pendiente');
    expect(component.estadoLabel('confirmed')).toBe('Confirmada');
  });

  it('should show hotel name', () => {
    expect(component.hotelName()).toBe('Hotel Test');
  });

  it('should handle pagination navigation', () => {
    component.goToPage(1);
    expect(component.currentPage()).toBe(1);
  });

  it('should get pages array', () => {
    component.allReservas.set(mockBookings as any);
    expect(component.getPages()).toEqual([1]);
  });

  it('should show pagination label', () => {
    component.allReservas.set(mockBookings as any);
    expect(component.paginationLabel()).toContain('1-2');
  });

  it('should show empty label when no reservas', () => {
    expect(component.paginationLabel()).toBe('Sin reservas');
  });

  it('should render stats cards', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings/hotel/')).flush(mockBookings);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.stat-card').length).toBe(4);
  });

  it('should render table with bookings', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings/hotel/')).flush(mockBookings);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Juan');
  });
});
