import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BookingsService } from '../../services/bookings.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private bookingsService = inject(BookingsService);

  roomId = '';
  hotelId = '';
  roomName = '';
  roomType = 'Suite';
  roomPrice = 200;
  today = new Date().toISOString().split('T')[0];
  isLoading = signal(false);
  errorMessage = signal('');

  form = {
    traveler_name: '',
    traveler_email: '',
    traveler_phone: '',
    traveler_document: '',
    room_type: 'Suite',
    num_guests: 1,
    start_time: '',
    end_time: '',
    price_per_night: 200,
    special_requests: '',
  };

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    this.roomId = params.get('roomId') ?? '';
    this.hotelId = params.get('hotelId') ?? '';
    this.roomName = params.get('roomName') ?? '';
    this.roomType = params.get('roomType') ?? 'Suite';
    this.roomPrice = Number(params.get('price')) || 200;
    this.form.room_type = this.roomType;
    this.form.price_per_night = this.roomPrice;
    const user = this.authService.currentUser();
    if (user) {
      this.form.traveler_name = user.full_name ?? '';
      this.form.traveler_email = user.email ?? '';
    }
  }

  submitBooking() {
    this.errorMessage.set('');

    if (!this.form.traveler_name || !this.form.traveler_email || !this.form.traveler_phone || !this.form.traveler_document) {
      this.errorMessage.set('Completa todos los datos del viajero.');
      return;
    }
    if (!this.form.start_time || !this.form.end_time) {
      this.errorMessage.set('Selecciona las fechas de check-in y check-out.');
      return;
    }
    if (this.form.end_time <= this.form.start_time) {
      this.errorMessage.set('La fecha de check-out debe ser posterior al check-in.');
      return;
    }
    if (this.form.num_guests < 1) {
      this.errorMessage.set('Debe haber al menos 1 huésped.');
      return;
    }
    if (this.form.price_per_night <= 0) {
      this.errorMessage.set('El precio por noche debe ser mayor a 0.');
      return;
    }

    this.isLoading.set(true);

    this.bookingsService.create({
      hotel_id: this.hotelId,
      room_id: this.roomId,
      start_time: this.form.start_time + 'T14:00:00',
      end_time: this.form.end_time + 'T12:00:00',
      room_type: this.form.room_type,
      num_guests: this.form.num_guests,
      price_per_night: this.form.price_per_night,
      traveler_name: this.form.traveler_name,
      traveler_email: this.form.traveler_email,
      traveler_phone: this.form.traveler_phone,
      traveler_document: this.form.traveler_document,
      special_requests: this.form.special_requests,
    }).subscribe({
      next: () => {
        this.router.navigate(['/booking-confirmed']);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.detail ?? 'Error al crear la reserva. Intenta de nuevo.');
        this.isLoading.set(false);
      },
    });
  }

  goBack() {
    this.router.navigate(['/search']);
  }

  totalNights(): number {
    if (!this.form.start_time || !this.form.end_time) return 0;
    const diff = new Date(this.form.end_time).getTime() - new Date(this.form.start_time).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  subtotal(): number {
    return this.totalNights() * this.form.price_per_night;
  }

  taxes(): number {
    return Math.round(this.subtotal() * 0.19);
  }

  totalPrice(): number {
    return this.subtotal() + this.taxes();
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.authService.logout();
  }
}
