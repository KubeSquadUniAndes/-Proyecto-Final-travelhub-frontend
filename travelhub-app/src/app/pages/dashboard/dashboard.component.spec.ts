import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../services/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn(), userType: () => 'traveler' } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be loading initially', () => {
    expect(component.isLoading()).toBe(true);
  });

  it('should load reservas on init', () => {
    component.ngOnInit();
    vi.advanceTimersByTime(400);
    expect(component.isLoading()).toBe(false);
    expect(component.allReservas().length).toBe(47);
  });

  it('should have no error after load', () => {
    component.ngOnInit();
    vi.advanceTimersByTime(400);
    expect(component.hasError()).toBe(false);
  });

  it('should filter by search query', () => {
    component.ngOnInit();
    vi.advanceTimersByTime(400);
    component.searchQuery.set('TH-2026-10001');
    expect(component.filteredReservas().length).toBe(1);
  });

  it('should filter by estado', () => {
    component.ngOnInit();
    vi.advanceTimersByTime(400);
    component.estadoFilter.set('Confirmada');
    component.filteredReservas().forEach(r => expect(r.estado).toBe('Confirmada'));
  });

  it('should filter by fecha desde', () => {
    component.ngOnInit();
    vi.advanceTimersByTime(400);
    component.fechaDesde.set('2026-06-01');
    component.filteredReservas().forEach(r => expect(r.checkIn >= '2026-06-01').toBe(true));
  });

  it('should paginate with 20 per page', () => {
    component.ngOnInit();
    vi.advanceTimersByTime(400);
    expect(component.paginatedReservas().length).toBeLessThanOrEqual(20);
  });

  it('should calculate total pages', () => {
    component.ngOnInit();
    vi.advanceTimersByTime(400);
    expect(component.totalPages()).toBe(Math.ceil(47 / 20));
  });

  it('should navigate pages', () => {
    component.ngOnInit();
    vi.advanceTimersByTime(400);
    component.goToPage(2);
    expect(component.currentPage()).toBe(2);
  });

  it('should not go to invalid page', () => {
    component.ngOnInit();
    vi.advanceTimersByTime(400);
    component.goToPage(0);
    expect(component.currentPage()).toBe(1);
    component.goToPage(999);
    expect(component.currentPage()).toBe(1);
  });

  it('should clear filters', () => {
    component.ngOnInit();
    vi.advanceTimersByTime(400);
    component.searchQuery.set('test');
    component.estadoFilter.set('Confirmada');
    component.fechaDesde.set('2026-01-01');
    component.fechaHasta.set('2026-12-31');
    component.clearFilters();
    expect(component.searchQuery()).toBe('');
    expect(component.estadoFilter()).toBe('');
    expect(component.fechaDesde()).toBe('');
    expect(component.fechaHasta()).toBe('');
    expect(component.currentPage()).toBe(1);
  });

  it('should detect hasFilters', () => {
    expect(component.hasFilters()).toBe(false);
    component.searchQuery.set('test');
    expect(component.hasFilters()).toBe(true);
  });

  it('should return correct estadoClass', () => {
    expect(component.estadoClass('Pendiente de pago')).toBe('status-pending');
    expect(component.estadoClass('Confirmada')).toBe('status-confirmed');
    expect(component.estadoClass('Cancelada')).toBe('status-cancelled');
    expect(component.estadoClass('Completada')).toBe('status-completed');
    expect(component.estadoClass('unknown')).toBe('');
  });

  it('should show pagination label', () => {
    component.ngOnInit();
    vi.advanceTimersByTime(400);
    expect(component.paginationLabel()).toContain('1-20 de 47');
  });

  it('should show empty label when no results', () => {
    component.ngOnInit();
    vi.advanceTimersByTime(400);
    component.searchQuery.set('zzzzzzzzzzz');
    expect(component.paginationLabel()).toBe('Sin resultados');
  });

  it('should get page numbers', () => {
    component.ngOnInit();
    vi.advanceTimersByTime(400);
    const pages = component.getPages();
    expect(pages.length).toBeGreaterThan(0);
    expect(pages).toContain(1);
  });

  it('should render table after load', () => {
    component.ngOnInit();
    vi.advanceTimersByTime(400);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')).toBeTruthy();
  });

  it('should render filters bar', () => {
    component.ngOnInit();
    vi.advanceTimersByTime(400);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.filters-bar')).toBeTruthy();
  });

  it('should show loading state', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.loading')).toBeTruthy();
  });
});
