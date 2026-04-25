import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { CheckoutComponent } from './checkout.component';
import { AuthService } from '../../services/auth.service';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn(), currentUser: () => ({ full_name: 'Test User', email: 'test@test.com' }) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: (k: string) => ({ roomId: 'r1', hotelId: 'h1', roomName: 'Suite', roomType: 'suite', price: '500000', capacity: '2' }[k] ?? null) } } } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => { expect(component).toBeTruthy(); });

  it('should init from query params', () => {
    component.ngOnInit();
    expect(component.roomId).toBe('r1');
    expect(component.hotelId).toBe('h1');
    expect(component.roomName).toBe('Suite');
    expect(component.roomType).toBe('suite');
    expect(component.roomPrice).toBe(500000);
  });

  it('should prefill user data', () => {
    component.ngOnInit();
    expect(component.form.traveler_name).toBe('Test User');
    expect(component.form.traveler_email).toBe('test@test.com');
  });

  it('should calculate total nights', () => {
    component.form.start_time = '2026-05-01';
    component.form.end_time = '2026-05-04';
    expect(component.totalNights()).toBe(3);
  });

  it('should return 0 nights when no dates', () => {
    expect(component.totalNights()).toBe(0);
  });

  it('should calculate subtotal', () => {
    component.form.start_time = '2026-05-01';
    component.form.end_time = '2026-05-03';
    component.form.price_per_night = 100000;
    expect(component.subtotal()).toBe(200000);
  });

  it('should calculate taxes at 19%', () => {
    component.form.start_time = '2026-05-01';
    component.form.end_time = '2026-05-02';
    component.form.price_per_night = 100000;
    expect(component.taxes()).toBe(19000);
  });

  it('should calculate total price', () => {
    component.form.start_time = '2026-05-01';
    component.form.end_time = '2026-05-02';
    component.form.price_per_night = 100000;
    expect(component.totalPrice()).toBe(119000);
  });

  it('should validate missing traveler data', () => {
    component.form.traveler_name = '';
    component.form.start_time = '2026-05-01';
    component.form.end_time = '2026-05-02';
    component.submitBooking();
    expect(component.errorMessage()).toContain('Completa');
  });

  it('should validate missing dates', () => {
    component.form.traveler_name = 'A';
    component.form.traveler_email = 'a@a.com';
    component.form.traveler_phone = '123';
    component.form.traveler_document = 'CC-1';
    component.submitBooking();
    expect(component.errorMessage()).toContain('fechas');
  });

  it('should validate checkout after checkin', () => {
    component.form.traveler_name = 'A';
    component.form.traveler_email = 'a@a.com';
    component.form.traveler_phone = '123';
    component.form.traveler_document = 'CC-1';
    component.form.start_time = '2026-05-05';
    component.form.end_time = '2026-05-01';
    component.submitBooking();
    expect(component.errorMessage()).toContain('posterior');
  });

  it('should submit booking successfully', () => {
    component.ngOnInit();
    component.form.traveler_phone = '123';
    component.form.traveler_document = 'CC-1';
    component.form.start_time = '2026-05-01';
    component.form.end_time = '2026-05-03';
    component.form.price_per_night = 100000;
    component.submitBooking();
    const req = httpMock.expectOne(r => r.method === 'POST');
    expect(req.request.body.hotel_id).toBe('h1');
    expect(req.request.body.room_id).toBe('r1');
    req.flush({ id: 'b1' });
  });

  it('should handle booking error', () => {
    component.ngOnInit();
    component.form.traveler_phone = '123';
    component.form.traveler_document = 'CC-1';
    component.form.start_time = '2026-05-01';
    component.form.end_time = '2026-05-03';
    component.form.price_per_night = 100000;
    component.submitBooking();
    httpMock.expectOne(r => r.method === 'POST').error(new ProgressEvent('error'));
    expect(component.errorMessage()).toBeTruthy();
    expect(component.isLoading()).toBe(false);
  });

  it('should translate schedule conflict error', () => {
    component.ngOnInit();
    component.form.traveler_phone = '123';
    component.form.traveler_document = 'CC-1';
    component.form.start_time = '2026-05-01';
    component.form.end_time = '2026-05-03';
    component.form.price_per_night = 100000;
    component.submitBooking();
    httpMock.expectOne(r => r.method === 'POST').flush({ detail: 'A schedule conflict exists for this resource' }, { status: 409, statusText: 'Conflict' });
    expect(component.errorMessage()).toContain('reservada');
  });

  it('should render form and summary', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.checkout-grid')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.summary-card')).toBeTruthy();
  });
});
