import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

export type PaymentProvider = 'mock' | 'stripe' | 'paypal' | 'mercadopago';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'processing' | 'confirmed' | 'failed' | 'refunded';

export interface CreatePaymentRequest {
  booking_id: string;
  amount: number;
  currency: string;
  payment_provider: PaymentProvider;
  payment_method: PaymentMethod;
  card_last_four?: string;
  cardholder_name?: string;
  cardholder_email?: string;
}

export interface ConfirmPaymentRequest {
  provider_transaction_id: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  payment_provider: PaymentProvider;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  provider_transaction_id?: string;
  card_last_four?: string;
  retry_count: number;
  payment_timestamp?: string;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/pagos/api/v1/payments`;

  create(request: CreatePaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(this.baseUrl, request);
  }

  confirm(bookingId: string, providerTransactionId: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.baseUrl}/${bookingId}/confirm`, {
      provider_transaction_id: providerTransactionId,
    });
  }

  getByBooking(bookingId: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/${bookingId}`);
  }

  /**
   * Full payment flow: create payment then immediately confirm it.
   * Uses 'mock' provider for card payments processed client-side.
   */
  processCardPayment(
    bookingId: string,
    amount: number,
    cardLastFour: string,
    cardholderName: string,
    cardholderEmail: string,
  ): Observable<Payment> {
    const transactionId = `TH-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    return this.create({
      booking_id: bookingId,
      amount,
      currency: 'COP',
      payment_provider: 'mock',
      payment_method: 'credit_card',
      card_last_four: cardLastFour,
      cardholder_name: cardholderName,
      cardholder_email: cardholderEmail,
    }).pipe(switchMap(() => this.confirm(bookingId, transactionId)));
  }
}
