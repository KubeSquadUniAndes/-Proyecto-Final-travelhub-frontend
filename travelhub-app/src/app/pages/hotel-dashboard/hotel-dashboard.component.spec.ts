import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Params } from '@angular/router';
import { HotelDashboardComponent } from './hotel-dashboard.component';
import { AuthService } from '../../services/auth.service';
import { Booking } from '../../services/bookings.service';

const makeBooking = (overrides: Partial<Booking>): Booking => ({
  id: 'bx',
  resource_id: 'hotel-1',
  start_time: '2026-05-01T14:00:00',
  end_time: '2026-05-03T12:00:00',
  room_type: 'suite',
  num_guests: 2,
  price_per_night: 300000,
  traveler_name: 'Test User',
  traveler_email: 'test@test.com',
  traveler_phone: '3001234567',
  traveler_document: '12345678',
  status: 'pending',
  final_price: '600000',
  ...overrides,
});

const mockBookings: Booking[] = [
  makeBooking({ id: 'b1', booking_code: 'BK-001', traveler_name: 'Juan Pérez', traveler_email: 'juan@test.com', start_time: '2026-05-01T14:00:00', status: 'pending', final_price: '1000000' }),
  makeBooking({ id: 'b2', booking_code: 'BK-002', traveler_name: 'Ana López', traveler_email: 'ana@test.com', start_time: '2026-05-05T14:00:00', status: 'confirmed', final_price: '400000' }),
  makeBooking({ id: 'b3', booking_code: 'BK-003', traveler_name: 'Carlos Gómez', traveler_email: 'carlos@test.com', start_time: '2026-05-10T14:00:00', status: 'completed', final_price: '600000' }),
  makeBooking({ id: 'b4', booking_code: 'BK-004', traveler_name: 'María Torres', traveler_email: 'maria@test.com', start_time: '2026-05-15T14:00:00', status: 'cancelled', final_price: '0' }),
];

describe('HotelDashboardComponent', () => {
  let component: HotelDashboardComponent;
  let fixture: ComponentFixture<HotelDashboardComponent>;
  let httpMock: HttpTestingController;
  let queryParamsSubject: BehaviorSubject<Params>;

  beforeEach(async () => {
    queryParamsSubject = new BehaviorSubject<Params>({});

    await TestBed.configureTestingModule({
      imports: [HotelDashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn(), currentUser: () => ({ id: 'h1', full_name: 'Hotel Test' }) } },
        { provide: ActivatedRoute, useValue: { queryParams: queryParamsSubject } },
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
    expect(component.allReservas().length).toBe(4);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle load error', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings/hotel/')).error(new ProgressEvent('error'));
    expect(component.hasError()).toBe(true);
    expect(component.isLoading()).toBe(false);
  });

  it('should compute stats', () => {
    component.allReservas.set(mockBookings);
    expect(component.stats().total).toBe(4);
    expect(component.stats().pendientes).toBe(1);
    expect(component.stats().confirmadas).toBe(1);
    expect(component.stats().ingresos).toBe(1000000);
  });

  it('should filter by search query (traveler name)', () => {
    component.allReservas.set(mockBookings);
    component.searchQuery.set('Juan');
    expect(component.filteredReservas().length).toBe(1);
    expect(component.filteredReservas()[0].id).toBe('b1');
  });

  it('should filter by traveler email', () => {
    component.allReservas.set(mockBookings);
    component.searchQuery.set('ana@test.com');
    expect(component.filteredReservas().length).toBe(1);
    expect(component.filteredReservas()[0].id).toBe('b2');
  });

  it('should filter by booking code', () => {
    component.allReservas.set(mockBookings);
    component.searchQuery.set('BK-003');
    expect(component.filteredReservas().length).toBe(1);
    expect(component.filteredReservas()[0].id).toBe('b3');
  });

  it('should return all when no search', () => {
    component.allReservas.set(mockBookings);
    expect(component.filteredReservas().length).toBe(4);
  });

  it('should paginate', () => {
    component.allReservas.set(mockBookings);
    expect(component.paginatedReservas().length).toBe(4);
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
    component.allReservas.set(mockBookings);
    expect(component.getPages()).toEqual([1]);
  });

  it('should show pagination label', () => {
    component.allReservas.set(mockBookings);
    expect(component.paginationLabel()).toContain('1-4');
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

  // --- AC1: Date range filter ---
  describe('date range filter', () => {
    beforeEach(() => { component.allReservas.set(mockBookings); });

    it('should exclude records before dateFrom', () => {
      component.filterDateFrom.set('2026-05-05');
      const result = component.filteredReservas();
      expect(result.length).toBe(3);
      expect(result.find(r => r.id === 'b1')).toBeUndefined();
    });

    it('should exclude records after dateTo', () => {
      component.filterDateTo.set('2026-05-05');
      const result = component.filteredReservas();
      expect(result.length).toBe(2);
      expect(result.find(r => r.id === 'b3')).toBeUndefined();
      expect(result.find(r => r.id === 'b4')).toBeUndefined();
    });

    it('should include only records within date range', () => {
      component.filterDateFrom.set('2026-05-05');
      component.filterDateTo.set('2026-05-10');
      const result = component.filteredReservas();
      expect(result.length).toBe(2);
      expect(result.every(r => ['b2', 'b3'].includes(r.id))).toBe(true);
    });

    it('should return all records when date range is cleared', () => {
      component.filterDateFrom.set('2026-05-05');
      component.filterDateFrom.set('');
      expect(component.filteredReservas().length).toBe(4);
    });
  });

  // --- AC2: Multi-status filter ---
  describe('status filter', () => {
    beforeEach(() => { component.allReservas.set(mockBookings); });

    it('should filter by a single status', () => {
      component.filterStatuses.set(['pending']);
      expect(component.filteredReservas().length).toBe(1);
      expect(component.filteredReservas()[0].status).toBe('pending');
    });

    it('should filter by multiple statuses simultaneously', () => {
      component.filterStatuses.set(['pending', 'confirmed']);
      expect(component.filteredReservas().length).toBe(2);
    });

    it('should show all when no statuses selected', () => {
      component.filterStatuses.set([]);
      expect(component.filteredReservas().length).toBe(4);
    });

    it('should add a status via toggleStatus', () => {
      component.toggleStatus('confirmed');
      expect(component.filterStatuses()).toContain('confirmed');
    });

    it('should remove a status via toggleStatus when already selected', () => {
      component.filterStatuses.set(['confirmed', 'pending']);
      component.toggleStatus('confirmed');
      expect(component.filterStatuses()).not.toContain('confirmed');
      expect(component.filterStatuses()).toContain('pending');
    });

    it('should isStatusSelected return true for selected status', () => {
      component.filterStatuses.set(['confirmed']);
      expect(component.isStatusSelected('confirmed')).toBe(true);
    });

    it('should isStatusSelected return false for unselected status', () => {
      component.filterStatuses.set(['confirmed']);
      expect(component.isStatusSelected('pending')).toBe(false);
    });
  });

  // --- AC3: Dynamic stats and empty-state detection ---
  describe('dynamic stats and hasActiveFilters', () => {
    it('should hasActiveFilters be false when no filters are set', () => {
      expect(component.hasActiveFilters()).toBe(false);
    });

    it('should hasActiveFilters be true when dateFrom is set', () => {
      component.filterDateFrom.set('2026-05-01');
      expect(component.hasActiveFilters()).toBe(true);
    });

    it('should hasActiveFilters be true when dateTo is set', () => {
      component.filterDateTo.set('2026-05-10');
      expect(component.hasActiveFilters()).toBe(true);
    });

    it('should hasActiveFilters be true when a status is selected', () => {
      component.filterStatuses.set(['pending']);
      expect(component.hasActiveFilters()).toBe(true);
    });

    it('should stats.total reflect filtered results dynamically', () => {
      component.allReservas.set(mockBookings);
      component.filterStatuses.set(['confirmed']);
      expect(component.stats().total).toBe(1);
      expect(component.stats().confirmadas).toBe(1);
      expect(component.stats().pendientes).toBe(0);
    });

    it('should stats.ingresos exclude cancelled bookings', () => {
      component.allReservas.set(mockBookings);
      component.filterStatuses.set(['cancelled']);
      expect(component.stats().ingresos).toBe(0);
    });
  });

  // --- AC4: URL query params sync ---
  describe('URL query params', () => {
    it('should navigate with search param on onSearch', () => {
      const router = TestBed.inject(Router);
      const spy = vi.spyOn(router, 'navigate');
      component.onSearch('Juan');
      expect(spy).toHaveBeenCalledWith([], expect.objectContaining({
        queryParams: expect.objectContaining({ search: 'Juan' }),
      }));
    });

    it('should navigate with dateFrom param on onDateFromChange', () => {
      const router = TestBed.inject(Router);
      const spy = vi.spyOn(router, 'navigate');
      component.onDateFromChange('2026-05-01');
      expect(spy).toHaveBeenCalledWith([], expect.objectContaining({
        queryParams: expect.objectContaining({ dateFrom: '2026-05-01' }),
      }));
    });

    it('should navigate with dateTo param on onDateToChange', () => {
      const router = TestBed.inject(Router);
      const spy = vi.spyOn(router, 'navigate');
      component.onDateToChange('2026-05-10');
      expect(spy).toHaveBeenCalledWith([], expect.objectContaining({
        queryParams: expect.objectContaining({ dateTo: '2026-05-10' }),
      }));
    });

    it('should navigate with statuses param after toggleStatus', () => {
      const router = TestBed.inject(Router);
      const spy = vi.spyOn(router, 'navigate');
      component.toggleStatus('confirmed');
      expect(spy).toHaveBeenCalledWith([], expect.objectContaining({
        queryParams: expect.objectContaining({ statuses: 'confirmed' }),
      }));
    });

    it('should restore filter state from URL query params on ngOnInit', () => {
      queryParamsSubject.next({
        search: 'Ana',
        dateFrom: '2026-05-05',
        dateTo: '2026-05-10',
        statuses: 'confirmed,pending',
      });
      component.ngOnInit();
      httpMock.expectOne(r => r.url.includes('/bookings/hotel/')).flush([]);
      expect(component.searchQuery()).toBe('Ana');
      expect(component.filterDateFrom()).toBe('2026-05-05');
      expect(component.filterDateTo()).toBe('2026-05-10');
      expect(component.filterStatuses()).toEqual(['confirmed', 'pending']);
    });
  });

  // --- AC5: Clear filters ---
  describe('clear filters', () => {
    it('should reset all filter signals and restore full result list', () => {
      component.allReservas.set(mockBookings);
      component.searchQuery.set('Juan');
      component.filterDateFrom.set('2026-05-05');
      component.filterStatuses.set(['pending']);
      component.clearFilters();
      expect(component.searchQuery()).toBe('');
      expect(component.filterDateFrom()).toBe('');
      expect(component.filterDateTo()).toBe('');
      expect(component.filterStatuses()).toEqual([]);
      expect(component.filteredReservas().length).toBe(4);
    });

    it('should reset currentPage to 1 on clearFilters', () => {
      component.currentPage.set(3);
      component.clearFilters();
      expect(component.currentPage()).toBe(1);
    });

    it('should close status dropdown on clearFilters', () => {
      component.showStatusDropdown.set(true);
      component.clearFilters();
      expect(component.showStatusDropdown()).toBe(false);
    });

    it('should navigate with empty queryParams on clearFilters', () => {
      const router = TestBed.inject(Router);
      const spy = vi.spyOn(router, 'navigate');
      component.clearFilters();
      expect(spy).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: {} }));
    });
  });

  // --- Status dropdown helpers ---
  describe('status dropdown', () => {
    it('should statusDropdownLabel show "Todos los estados" when none selected', () => {
      expect(component.statusDropdownLabel()).toBe('Todos los estados');
    });

    it('should statusDropdownLabel show label of single selected status', () => {
      component.filterStatuses.set(['confirmed']);
      expect(component.statusDropdownLabel()).toBe('Confirmada');
    });

    it('should statusDropdownLabel show count when multiple statuses selected', () => {
      component.filterStatuses.set(['confirmed', 'pending']);
      expect(component.statusDropdownLabel()).toBe('2 estados');
    });

    it('should toggleStatusDropdown toggle dropdown visibility', () => {
      expect(component.showStatusDropdown()).toBe(false);
      component.toggleStatusDropdown();
      expect(component.showStatusDropdown()).toBe(true);
      component.toggleStatusDropdown();
      expect(component.showStatusDropdown()).toBe(false);
    });

    it('should closeStatusDropdown set dropdown to false', () => {
      component.showStatusDropdown.set(true);
      component.closeStatusDropdown();
      expect(component.showStatusDropdown()).toBe(false);
    });
  });
});
