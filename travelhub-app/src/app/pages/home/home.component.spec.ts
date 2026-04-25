import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { HomeComponent } from './home.component';
import { AuthService } from '../../services/auth.service';

const mockRooms = [
  { id: 'r1', hotel_id: 'h1', hotel_name: 'Hotel A', name: 'Suite 1', destination: 'Bogotá', room_type: 'suite', price: '300000', capacity: 2, beds: '1 king', size: 30, amenities: 'WiFi' },
  { id: 'r2', hotel_id: 'h2', hotel_name: 'Hotel B', name: 'Doble 1', room_type: 'doble', price: '150000', capacity: 3, beds: '2 camas', size: 25, amenities: 'AC' },
];

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn(), userType: () => 'traveler', currentUser: () => ({ id: 'u1' }) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => { expect(component).toBeTruthy(); });

  it('should load rooms on init', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);
    httpMock.match(r => r.url.includes('/images')).forEach(r => r.flush([]));
    expect(component.hospedajes().length).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle load error', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/rooms')).error(new ProgressEvent('error'));
    expect(component.isLoading()).toBe(false);
  });

  it('should return fallback image when no image loaded', () => {
    expect(component.getRoomImage('unknown')).toContain('unsplash');
  });

  it('should return room image when loaded', () => {
    component.roomImagesMap.set({ r1: 'http://real.jpg' });
    expect(component.getRoomImage('r1')).toBe('http://real.jpg');
  });

  it('should get room price from room.price', () => {
    expect(component.getRoomPrice(mockRooms[0] as any)).toBe(300000);
  });

  it('should render hotel cards', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);
    httpMock.match(r => r.url.includes('/images')).forEach(r => r.flush([]));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.hotel-card').length).toBe(2);
  });

  it('should show loading state', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cargando');
  });

  it('should render hero and search form', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.hero')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.search-form')).toBeTruthy();
  });

  it('should render feature cards', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.feature-card').length).toBe(3);
  });
});
