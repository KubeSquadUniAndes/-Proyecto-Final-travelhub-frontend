import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

interface CheckInResult {
  id: string;
  booking_code: string;
  status: string;
  status_display: string;
  traveler_name: string;
  room_type: string;
  start_time: string;
  end_time: string;
  num_guests: number;
  special_requests: string | null;
  checked_in_at: string;
}

@Component({
  selector: 'app-checkin-scanner',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule],
  templateUrl: './checkin-scanner.component.html',
  styleUrls: ['./checkin-scanner.component.css'],
})
export class CheckinScannerComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  scanning = signal(true);
  loading = signal(false);
  result = signal<CheckInResult | null>(null);
  error = signal<string | null>(null);

  allowedFormats = [BarcodeFormat.QR_CODE];

  onQrScanned(qrContent: string): void {
    if (!this.scanning()) return;
    this.scanning.set(false);
    this.loading.set(true);
    this.error.set(null);

    let payload: { booking_code: string; booking_id: string };
    try {
      payload = JSON.parse(qrContent);
      if (!payload.booking_code || !payload.booking_id) throw new Error();
    } catch {
      this.error.set('El código QR no es válido o está dañado.');
      this.loading.set(false);
      this.scanning.set(true);
      return;
    }

    this.http.post<CheckInResult>(`${environment.apiUrl}/reservas/api/v1/bookings/checkin`, {
      booking_code: payload.booking_code,
      booking_id: payload.booking_id,
      device: navigator.userAgent,
    }, {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    }).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.detail ?? 'Error al procesar el check-in.');
        this.loading.set(false);
        this.scanning.set(true);
      },
    });
  }

  reset(): void {
    this.result.set(null);
    this.error.set(null);
    this.scanning.set(true);
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
