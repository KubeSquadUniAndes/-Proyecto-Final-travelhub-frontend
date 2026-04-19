import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BookingsService } from './bookings.service';

const mockBooking = {
  id: 'b1', user_id: 'u1', resource_id: 'r1', start_time: '2026-09-01T14:00:00Z', end_time: '2026-09-05T12:00:00Z',
  room_type: 'Suite', num_guests: 2, price_per_night: '200.00', traveler_name: 'Juan', traveler_email: 'j@e.com',
  traveler_phone: '+57300', traveler_document: 'CC-123', status: 'pending', status_display: 'Pendiente de pago',
  booking_code: 'TH-2026-ABC12', total_nights: 4, total_price: '800.00', taxes: '152.00', final_price: '952.00', cancellable: true,
};

describe('BookingsService', () => {
  let service: BookingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookingsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BookingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => { httpMock.verify(); });

  it('should be created', () => { expect(service).toBeTruthy(); });

  it('list should GET bookings', () => {
    service.list().subscribe(b => { expect(b.length).toBe(1); });
    const req = httpMock.expectOne(r => r.url.includes('/bookings/') && r.method === 'GET');
    req.flush([mockBooking]);
  });

  it('getById should GET a single booking', () => {
    service.getById('b1').subscribe(b => { expect(b.id).toBe('b1'); });
    const req = httpMock.expectOne(r => r.url.includes('/bookings/b1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockBooking);
  });

  it('create should POST a new booking', () => {
    const payload = { resource_id: 'r1', start_time: '2026-09-01T14:00:00', end_time: '2026-09-05T12:00:00', room_type: 'Suite', num_guests: 2, price_per_night: 200, traveler_name: 'Juan', traveler_email: 'j@e.com', traveler_phone: '+57300', traveler_document: 'CC-123' };
    service.create(payload).subscribe(b => { expect(b.booking_code).toBe('TH-2026-ABC12'); });
    const req = httpMock.expectOne(r => r.method === 'POST');
    req.flush(mockBooking);
  });

  it('update should PATCH booking', () => {
    service.update('b1', { start_time: '2026-09-02T14:00:00', notes: 'Late' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/bookings/b1') && r.method === 'PATCH');
    expect(req.request.body).toEqual({ start_time: '2026-09-02T14:00:00', notes: 'Late' });
    req.flush({ ...mockBooking, notes: 'Late' });
  });

  it('delete should DELETE a booking', () => {
    service.delete('b1').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/bookings/b1') && r.method === 'DELETE');
    req.flush(null);
  });
});
