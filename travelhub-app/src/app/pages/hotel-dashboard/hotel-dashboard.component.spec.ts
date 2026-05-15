import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HotelDashboardComponent } from './hotel-dashboard.component';
import { AuthService } from '../../services/auth.service';

const mockBookings = [
  { id: 'b1', booking_code: 'BK-001', resource_id: 'r1', traveler_name: 'Juan', start_time: '2026-05-01T14:00:00', end_time: '2026-05-03T12:00:00', created_at: '2026-05-01T10:00:00', room_type: 'suite', num_guests: 2, price_per_night: 500000, status: 'confirmed', final_price: '1000000', total_nights: 2, traveler_email: 'j@j.com', traveler_phone: '123', traveler_document: 'CC1' },
  { id: 'b2', booking_code: 'BK-002', resource_id: 'r2', traveler_name: 'Ana', start_time: '2026-05-05T14:00:00', end_time: '2026-05-07T12:00:00', created_at: '2026-05-05T10:00:00', room_type: 'doble', num_guests: 3, price_per_night: 200000, status: 'pending', final_price: '400000', total_nights: 2, traveler_email: 'a@a.com', traveler_phone: '456', traveler_document: 'CC2' },
  { id: 'b3', booking_code: 'BK-003', resource_id: 'r1', traveler_name: 'Luis', start_time: '2026-05-10T14:00:00', end_time: '2026-05-12T12:00:00', created_at: '2026-05-10T10:00:00', room_type: 'suite', num_guests: 1, price_per_night: 500000, status: 'completed', final_price: '1000000', total_nights: 2, traveler_email: 'l@l.com', traveler_phone: '789', traveler_document: 'CC3' },
];

const mockRooms = [
  { id: 'r1', hotel_id: 'h1', name: 'Suite 1', room_type: 'suite', price: '500000', capacity: 2, beds: '1 king', size: 30, amenities: 'WiFi' },
  { id: 'r2', hotel_id: 'h1', name: 'Doble 1', room_type: 'doble', price: '200000', capacity: 3, beds: '2 camas', size: 25, amenities: 'AC' },
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

  function flushData() {
    httpMock.expectOne(r => r.url.includes('/bookings/hotel/')).flush(mockBookings);
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);
  }

  it('should create', () => { expect(component).toBeTruthy(); });

  it('should load data on init', () => {
    component.ngOnInit();
    flushData();
    expect(component.allBookings().length).toBe(3);
    expect(component.totalRooms()).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle load error', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/bookings/hotel/')).error(new ProgressEvent('error'));
    expect(component.hasError()).toBe(true);
  });

  it('should compute KPIs with confirmed bookings', () => {
    component.allBookings.set(mockBookings as never[]);
    component.totalRooms.set(2);
    component.selectedPeriod.set('year');
    const kpis = component.kpis();
    expect(kpis.grossRevenue).toBe(2000000);
    expect(kpis.confirmed).toBe(2);
    expect(kpis.totalBookings).toBe(3);
  });

  it('should compute net revenue as 81% of gross', () => {
    component.allBookings.set(mockBookings as never[]);
    component.totalRooms.set(2);
    component.selectedPeriod.set('year');
    expect(component.kpis().netRevenue).toBe(Math.round(2000000 * 0.81));
  });

  it('should compute room type distribution', () => {
    component.allBookings.set(mockBookings as never[]);
    component.selectedPeriod.set('year');
    const dist = component.roomTypeDistribution();
    expect(dist.length).toBe(2);
    expect(dist[0].type).toBe('suite');
    expect(dist[0].count).toBe(2);
  });

  it('should compute popular rooms', () => {
    component.allBookings.set(mockBookings as never[]);
    component.selectedPeriod.set('year');
    const popular = component.popularRooms();
    expect(popular.length).toBeGreaterThan(0);
    expect(popular[0].count).toBe(2); // r1 has 2 confirmed bookings
  });

  it('should change period', () => {
    component.setPeriod('7days');
    expect(component.selectedPeriod()).toBe('7days');
  });

  it('should set custom period', () => {
    component.customFrom.set('2026-05-01');
    component.customTo.set('2026-05-15');
    component.onCustomDateChange();
    expect(component.selectedPeriod()).toBe('custom');
  });

  it('should format currency', () => {
    expect(component.formatCurrency(1500000)).toBe('$1.5M');
    expect(component.formatCurrency(500)).toContain('500');
  });

  it('should show hotel name', () => {
    expect(component.hotelName()).toBe('Hotel Test');
  });

  it('should compute comparison deltas', () => {
    component.allBookings.set(mockBookings as never[]);
    component.totalRooms.set(2);
    component.selectedPeriod.set('year');
    const comp = component.comparison();
    expect(comp.revenue.direction).toBeDefined();
    expect(comp.occupancy.direction).toBeDefined();
  });

  it('should render KPI cards', () => {
    fixture.detectChanges();
    flushData();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.kpi-card').length).toBe(4);
  });

  it('should render period buttons', () => {
    fixture.detectChanges();
    flushData();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.period-buttons button').length).toBe(5);
  });

  it('should render charts section', () => {
    fixture.detectChanges();
    flushData();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.charts-grid')).toBeTruthy();
  });

  it('should render popular rooms section', () => {
    fixture.detectChanges();
    flushData();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.popular-card')).toBeTruthy();
  });
});

describe('HotelDashboardComponent - Reports', () => {
  let component: HotelDashboardComponent;
  let fixture: ComponentFixture<HotelDashboardComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelDashboardComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn(), currentUser: () => ({ id: 'h1', full_name: 'Hotel Test', email: 'hotel@test.com' }) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HotelDashboardComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should open report modal', () => {
    component.openReportModal();
    expect(component.showReportModal()).toBe(true);
    expect(component.reportGenerated()).toBe(false);
  });

  it('should close report modal', () => {
    component.openReportModal();
    component.closeReportModal();
    expect(component.showReportModal()).toBe(false);
  });

  it('should generate report', () => {
    component.generateReport();
    expect(component.reportGenerated()).toBe(true);
  });

  it('should compute report data', () => {
    component.allBookings.set(mockBookings as never[]);
    component.selectedPeriod.set('year');
    component.reportFrom.set('2026-01-01');
    component.reportTo.set('2026-12-31');
    component.generateReport();
    const data = component.reportData();
    expect(data.totalBookings).toBe(3);
    expect(data.totalRevenue).toBeGreaterThan(0);
    expect(data.breakdown.length).toBeGreaterThan(0);
  });

  it('should filter report by room type', () => {
    component.allBookings.set(mockBookings as never[]);
    component.selectedPeriod.set('year');
    component.reportFrom.set('2026-01-01');
    component.reportTo.set('2026-12-31');
    component.reportRoomType.set('suite');
    const data = component.reportData();
    expect(data.totalBookings).toBe(2);
  });

  it('should compute comparison percentage', () => {
    component.allBookings.set(mockBookings as never[]);
    component.selectedPeriod.set('year');
    component.reportFrom.set('2026-01-01');
    component.reportTo.set('2026-12-31');
    const data = component.reportData();
    expect(data.compPct).toBeDefined();
  });

  it('should group by daily', () => {
    component.allBookings.set(mockBookings as never[]);
    component.reportGrouping.set('daily');
    component.reportFrom.set('2026-01-01');
    component.reportTo.set('2026-12-31');
    const data = component.reportData();
    expect(data.breakdown.length).toBeGreaterThan(0);
  });

  it('should group by weekly', () => {
    component.allBookings.set(mockBookings as never[]);
    component.reportGrouping.set('weekly');
    component.reportFrom.set('2026-01-01');
    component.reportTo.set('2026-12-31');
    const data = component.reportData();
    expect(data.breakdown.length).toBeGreaterThan(0);
  });

  it('should group by monthly', () => {
    component.allBookings.set(mockBookings as never[]);
    component.reportGrouping.set('monthly');
    component.reportFrom.set('2026-01-01');
    component.reportTo.set('2026-12-31');
    const data = component.reportData();
    expect(data.breakdown[0].label).toContain('2026');
  });

  it('should get available room types', () => {
    component.allBookings.set(mockBookings as never[]);
    const types = component.availableRoomTypes();
    expect(types).toContain('suite');
    expect(types).toContain('doble');
  });

  it('should export CSV', () => {
    component.allBookings.set(mockBookings as never[]);
    component.reportFrom.set('2026-01-01');
    component.reportTo.set('2026-12-31');
    const spy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL');
    component.exportExcel();
    expect(spy).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalled();
    spy.mockRestore();
    revokeSpy.mockRestore();
  });

  it('should export PDF via window.open', () => {
    component.allBookings.set(mockBookings as never[]);
    component.reportFrom.set('2026-01-01');
    component.reportTo.set('2026-12-31');
    const mockWin = { document: { write: vi.fn(), close: vi.fn() }, print: vi.fn() };
    vi.spyOn(window, 'open').mockReturnValue(mockWin as unknown as Window);
    component.exportPDF();
    expect(mockWin.document.write).toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it('should render report modal when open', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings/hotel/')).flush(mockBookings);
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([]);
    fixture.detectChanges();
    component.openReportModal();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.report-modal')).toBeTruthy();
  });

  it('should render report results after generate', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/bookings/hotel/')).flush(mockBookings);
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([]);
    fixture.detectChanges();
    component.openReportModal();
    component.reportFrom.set('2026-01-01');
    component.reportTo.set('2026-12-31');
    component.generateReport();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.report-results')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.report-export')).toBeTruthy();
  });
});
