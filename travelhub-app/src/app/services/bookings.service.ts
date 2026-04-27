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
  hotel_id: string;
  room_id: string;
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
  notes?: string;
}

export interface PaymentConfirmation {
  payment_provider: string;
  transaction_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  card_last_four: string;
  paid_at: string;
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

  approve(id: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}/approve`, {});
  }

  confirmPayment(id: string, paymentData: PaymentConfirmation): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}/approve`, paymentData);
  }

  reject(id: string, reason: string): Observable<Booking> {
    return this.http.patch<Booking>(`${this.baseUrl}/${id}/reject`, { rejection_reason: reason });
  }

  listByHotel(hotelId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/hotel/${hotelId}`);
  }

  checkAvailability(roomId: string, startTime: string, endTime: string): Observable<unknown> {
    return this.http.get(`${this.baseUrl}/availability?room_id=${roomId}&start_time=${startTime}&end_time=${endTime}`);
  }
}
