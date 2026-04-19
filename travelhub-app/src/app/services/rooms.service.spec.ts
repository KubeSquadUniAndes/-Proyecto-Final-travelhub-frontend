import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RoomsService, Room } from './rooms.service';

const mockRoom: Room = {
  id: 'room-1',
  name: 'Habitación 101',
  room_type: 'individual',
  price: '150.00',
  capacity: 2,
  beds: '1 cama doble',
  size: 25,
  amenities: 'WiFi, AC, TV',
};

describe('RoomsService', () => {
  let service: RoomsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoomsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RoomsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('list should GET rooms', () => {
    service.list().subscribe(rooms => {
      expect(rooms.length).toBe(1);
      expect(rooms[0].name).toBe('Habitación 101');
    });
    const req = httpMock.expectOne(r => r.url.includes('/rooms') && r.method === 'GET');
    req.flush([mockRoom]);
  });

  it('getById should GET a single room', () => {
    service.getById('room-1').subscribe(room => {
      expect(room.id).toBe('room-1');
    });
    const req = httpMock.expectOne(r => r.url.includes('/rooms/room-1'));
    expect(req.request.method).toBe('GET');
    req.flush(mockRoom);
  });

  it('create should POST a new room', () => {
    const payload = { name: 'Habitación 102', room_type: 'doble', price: '200.00', capacity: 3, beds: '2 camas', size: 30, amenities: 'WiFi' };
    service.create(payload).subscribe(room => {
      expect(room.name).toBe('Habitación 102');
    });
    const req = httpMock.expectOne(r => r.url.includes('/rooms') && r.method === 'POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ ...payload, id: 'room-2' });
  });

  it('update should PUT room data', () => {
    service.update('room-1', { price: '180.00' }).subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/rooms/room-1') && r.method === 'PUT');
    expect(req.request.body).toEqual({ price: '180.00' });
    req.flush({ ...mockRoom, price: '180.00' });
  });

  it('delete should DELETE a room', () => {
    service.delete('room-1').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/rooms/room-1') && r.method === 'DELETE');
    req.flush(null);
  });

  it('stats should GET room stats', () => {
    service.stats().subscribe(stats => {
      expect(stats.total).toBe(5);
    });
    const req = httpMock.expectOne(r => r.url.includes('/rooms/stats'));
    expect(req.request.method).toBe('GET');
    req.flush({ total: 5, available: 3, occupied: 2 });
  });
});
