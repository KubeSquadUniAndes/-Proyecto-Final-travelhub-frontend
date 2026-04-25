import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Discount {
  id?: string;
  name: string;
  discount_type: 'porcentaje' | 'fijo';
  value: number;
  start_date: string;
  end_date: string;
  is_active?: boolean;
}

export interface Rate {
  id: string;
  hotel_id?: string;
  room_type: string;
  season: string;
  base_price: number;
  final_price?: number;
  has_discount?: boolean;
  discount_name?: string;
  active_discount?: Discount;
  created_at?: string;
  updated_at?: string;
}

export interface EffectivePrice {
  room_type: string;
  season: string | null;
  base_price: number;
  final_price: number;
  has_discount: boolean;
  discount_name: string | null;
}

@Injectable({ providedIn: 'root' })
export class RatesService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/hospedajes/api/v1/rates`;

  list(roomType?: string): Observable<Rate[]> {
    const url = roomType ? `${this.baseUrl}?room_type=${roomType}` : this.baseUrl;
    return this.http.get<Rate[]>(url);
  }

  create(rate: { room_type: string; season: string; base_price: number }): Observable<Rate> {
    return this.http.post<Rate>(this.baseUrl, rate);
  }

  update(id: string, data: Partial<Rate>): Observable<Rate> {
    return this.http.put<Rate>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getEffectivePrice(hotelId: string, roomType: string, season: string): Observable<EffectivePrice> {
    return this.http.get<EffectivePrice>(`${this.baseUrl}/effective-price?hotel_id=${hotelId}&room_type=${roomType}&season=${season}`);
  }

  addDiscount(rateId: string, discount: Omit<Discount, 'id' | 'is_active'>): Observable<Discount> {
    return this.http.post<Discount>(`${this.baseUrl}/${rateId}/discounts`, discount);
  }
}
