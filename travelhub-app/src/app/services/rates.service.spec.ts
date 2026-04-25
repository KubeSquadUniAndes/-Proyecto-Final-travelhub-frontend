import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RatesService } from './rates.service';

describe('RatesService', () => {
  let service: RatesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RatesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should list all rates', () => {
    service.list().subscribe(r => expect(r.length).toBe(1));
    httpMock.expectOne(r => r.url.includes('/rates') && !r.url.includes('room_type')).flush([{ id: '1', room_type: 'suite', season: 'base', base_price: 100 }]);
  });

  it('should list rates by room type', () => {
    service.list('suite').subscribe(r => expect(r.length).toBe(1));
    httpMock.expectOne(r => r.url.includes('room_type=suite')).flush([{ id: '1', room_type: 'suite', season: 'base', base_price: 100 }]);
  });

  it('should create rate', () => {
    service.create({ room_type: 'suite', season: 'base', base_price: 500 }).subscribe(r => expect(r.id).toBe('1'));
    httpMock.expectOne(r => r.method === 'POST').flush({ id: '1', room_type: 'suite', season: 'base', base_price: 500 });
  });

  it('should update rate', () => {
    service.update('1', { base_price: 600 }).subscribe(r => expect(r.base_price).toBe(600));
    httpMock.expectOne(r => r.method === 'PUT' && r.url.includes('/1')).flush({ id: '1', room_type: 'suite', season: 'base', base_price: 600 });
  });

  it('should delete rate', () => {
    service.delete('1').subscribe();
    httpMock.expectOne(r => r.method === 'DELETE' && r.url.includes('/1')).flush(null);
  });

  it('should get effective price', () => {
    service.getEffectivePrice('h1', 'suite', 'base').subscribe(ep => expect(ep.final_price).toBe(450));
    httpMock.expectOne(r => r.url.includes('effective-price')).flush({ room_type: 'suite', season: 'base', base_price: 500, final_price: 450, has_discount: true, discount_name: 'promo' });
  });

  it('should add discount', () => {
    const disc = { name: 'promo', discount_type: 'porcentaje' as const, value: 10, start_date: '2026-01-01', end_date: '2026-12-31' };
    service.addDiscount('1', disc).subscribe(d => expect(d.name).toBe('promo'));
    httpMock.expectOne(r => r.method === 'POST' && r.url.includes('/1/discounts')).flush({ ...disc, id: 'd1', is_active: true });
  });
});
