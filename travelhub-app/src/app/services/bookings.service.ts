import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Booking {
  id: string;
  user_id?: string;
  resource_id: string;
  start_time: string;
  end_time: string;
  room_type: string;
  num_guests: number;
  price_per_night: number | string;
  traveler_name: string;
  traveler_email: string;
  traveler_phone: string;
  traveler_document: string;
  special_requests?: string;
  additional_guests?: string[];
  status?: string;
  status_display?: string;
  booking_code?: string;
  total_nights?: number;
  total_price?: string;
  taxes?: string;
  final_price?: string;
  cancellable?: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBookingRequest {
  resource_id: string;
  start_time: string;
  end_time: string;
  room_type: string;
  num_guests: number;
  price_per_night: number;
  traveler_name: string;
  traveler_email: string;
  traveler_phone: string;
  traveler_document: string;
  special_requests?: string;
  additional_guests?: string[];
}

@Injectable({ providedIn: 'root' })
export class BookingsService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reservas/api/v1/bookings`;

  list(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/`);
  }

  getById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/${id}`);
  }

  create(booking: CreateBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/`, booking);
  }

  update(id: string, data: Partial<Booking>): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
