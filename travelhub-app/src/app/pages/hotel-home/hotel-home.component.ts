import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BookingsService, Booking } from '../../services/bookings.service';

@Component({
  selector: 'app-hotel-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotel-home.component.html',
  styleUrls: ['./hotel-home.component.css'],
})
export class HotelHomeComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private bookingsService = inject(BookingsService);

  readonly hotelName = computed(() => this.authService.currentUser()?.full_name ?? 'Mi Hotel');
  reservas = signal<Booking[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  hasReservas = computed(() => this.reservas().length > 0);
  selectedReserva = signal<Booking | null>(null);

  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  showRejectModal = signal(false);
  rejectingReserva = signal<Booking | null>(null);
  rejectReason = '';

  pendingCount = computed(() => this.reservas().filter(r => r.status === 'pending').length);
  confirmedCount = computed(() => this.reservas().filter(r => r.status === 'confirmed').length);
  rejectedCount = computed(() => this.reservas().filter(r => r.status === 'cancelled').length);

  menuItems = [
    { label: 'Ver detalle', icon: '📋', action: 'detail' },
    { label: 'Aprobar reserva', icon: '✅', action: 'approve' },
    { label: 'Rechazar reserva', icon: '❌', action: 'reject' },
    { label: 'Reportes / Dashboard', icon: '📊', action: 'reports' },
  ];

  ngOnInit() {
    this.loadReservas();
  }

  loadReservas() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.bookingsService.list().subscribe({
      next: (bookings) => { this.reservas.set(bookings); this.isLoading.set(false); },
      error: () => { this.hasError.set(true); this.isLoading.set(false); },
    });
  }

  onMenuAction(action: string, reserva?: Booking) {
    switch (action) {
      case 'detail':
        if (reserva) this.selectedReserva.set(this.selectedReserva()?.id === reserva.id ? null : reserva);
        break;
      case 'approve':
        if (reserva) this.approveReserva(reserva);
        break;
      case 'reject':
        if (reserva) this.openRejectModal(reserva);
        break;
      case 'reports':
        this.router.navigate(['/hotel-dashboard']);
        break;
    }
  }

  approveReserva(reserva: Booking) {
    if (reserva.status !== 'pending') {
      this.showToast('Solo se pueden aprobar reservas pendientes.', 'error');
      return;
    }
    this.bookingsService.approve(reserva.id).subscribe({
      next: () => { this.loadReservas(); this.showToast(`Reserva ${reserva.booking_code} aprobada. Cobro procesado.`, 'success'); },
      error: () => this.showToast('Error al aprobar la reserva.', 'error'),
    });
  }

  openRejectModal(reserva: Booking) {
    if (reserva.status !== 'pending') {
      this.showToast('Solo se pueden rechazar reservas pendientes.', 'error');
      return;
    }
    this.rejectingReserva.set(reserva);
    this.rejectReason = '';
    this.showRejectModal.set(true);
  }

  confirmReject() {
    const reserva = this.rejectingReserva();
    if (!reserva || !this.rejectReason.trim()) return;
    this.bookingsService.reject(reserva.id, this.rejectReason.trim()).subscribe({
      next: () => {
        this.showRejectModal.set(false);
        this.rejectingReserva.set(null);
        this.loadReservas();
        this.showToast(`Reserva ${reserva.booking_code} rechazada. Habitación liberada.`, 'success');
      },
      error: () => this.showToast('Error al rechazar la reserva.', 'error'),
    });
  }

  cancelReject() {
    this.showRejectModal.set(false);
    this.rejectingReserva.set(null);
    this.rejectReason = '';
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 4000);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  estadoClass(estado: string | undefined): string {
    const map: Record<string, string> = {
      pending: 'status-pending', confirmed: 'status-confirmed',
      completed: 'status-completed', cancelled: 'status-cancelled',
    };
    return map[estado ?? ''] ?? '';
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
