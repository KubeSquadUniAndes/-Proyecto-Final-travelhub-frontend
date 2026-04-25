import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { SearchComponent } from './search.component';
import { AuthService } from '../../services/auth.service';
import { Room } from '../../services/rooms.service';

const mockRooms = [
  { id: 'r1', hotel_id: 'h1', hotel_name: 'Hotel A', name: 'Suite 1', destination: 'Bogotá', room_type: 'suite', price: '300000', capacity: 2, beds: '1 king', size: 30, amenities: 'WiFi' },
  { id: 'r2', hotel_id: 'h2', hotel_name: 'Hotel B', name: 'Doble 1', destination: 'Medellín', room_type: 'doble', price: '150000', capacity: 4, beds: '2 camas', size: 25, amenities: 'AC' },
];

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn(), userType: () => 'traveler' } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => { expect(component).toBeTruthy(); });

  it('should load rooms on init', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);
    httpMock.match(r => r.url.includes('/images')).forEach(r => r.flush([]));
    expect(component.allRooms().length).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle load error', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/rooms')).error(new ProgressEvent('error'));
    expect(component.hasError()).toBe(true);
  });

  it('should filter by destination', () => {
    component.allRooms.set(mockRooms as Room[]);
    component.destino.set('Bogotá');
    expect(component.filteredRooms().length).toBe(1);
    expect(component.filteredRooms()[0].name).toBe('Suite 1');
  });

  it('should filter by capacity', () => {
    component.allRooms.set(mockRooms as Room[]);
    component.huespedes.set(3);
    expect(component.filteredRooms().length).toBe(1);
    expect(component.filteredRooms()[0].name).toBe('Doble 1');
  });

  it('should clear filters', () => {
    component.destino.set('test');
    component.huespedes.set(5);
    component.clearFilters();
    expect(component.destino()).toBe('');
    expect(component.huespedes()).toBe(1);
  });

  it('should return fallback image', () => {
    expect(component.getRoomImage('x')).toContain('unsplash');
  });

  it('should get room price', () => {
    expect(component.getRoomPrice(mockRooms[0] as Room)).toBe(300000);
  });

  it('should detect hasFilters', () => {
    expect(component.hasFilters()).toBe(false);
    component.destino.set('test');
    expect(component.hasFilters()).toBe(true);
  });

  it('should render filters sidebar', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.filters')).toBeTruthy();
  });

  it('should render room cards', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);
    httpMock.match(r => r.url.includes('/images')).forEach(r => r.flush([]));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.hotel-card').length).toBe(2);
  });

  it('should show empty state when no results', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
  });
});
