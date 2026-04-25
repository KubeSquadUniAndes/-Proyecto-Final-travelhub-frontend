import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ImagesService } from './images.service';

describe('ImagesService', () => {
  let service: ImagesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ImagesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should list images by room', () => {
    service.listByRoom('r1').subscribe(imgs => {
      expect(imgs.length).toBe(1);
      expect(imgs[0].url).toBe('http://img.jpg');
    });
    httpMock.expectOne(r => r.url.includes('/rooms/r1/images')).flush([{ id: 'i1', room_id: 'r1', url: 'http://img.jpg' }]);
  });

  it('should upload image', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    service.upload('r1', file).subscribe(img => expect(img.id).toBe('i1'));
    const req = httpMock.expectOne(r => r.url.includes('/rooms/r1/images') && r.method === 'POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush({ id: 'i1', room_id: 'r1', url: 'http://img.jpg' });
  });

  it('should delete image', () => {
    service.delete('i1').subscribe();
    httpMock.expectOne(r => r.url.includes('/images/i1') && r.method === 'DELETE').flush(null);
  });
});
