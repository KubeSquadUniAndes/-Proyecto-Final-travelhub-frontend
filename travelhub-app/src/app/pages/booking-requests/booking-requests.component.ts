import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

export interface BookingRequest {
  id: string;
  guest: string;
  email: string;
  phone: string;
  room: string;
  type: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  total: number;
  requested: string;
  timeLeft: string;
  expired: boolean;
  status: 'Pendiente' | 'Confirmada' | 'Rechazada';
  rejectReason?: string;
}

@Component({
  selector: 'app-booking-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-requests.component.html',
  styleUrls: ['./booking-requests.component.css'],
})
export class BookingRequestsComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  requests = signal<BookingRequest[]>([
    { id: 'BK-2024-001', guest: 'María García López', email: 'maria.garcia@email.com', phone: '+57 300 123 4567', room: 'Suite Premium Ocean View', type: 'Suite', checkIn: '2026-03-20', checkOut: '2026-03-25', nights: 5, guests: 2, total: 2250, requested: '2026-03-15 10:30', timeLeft: '8h 36m', expired: false, status: 'Pendiente' },
    { id: 'BK-2024-002', guest: 'Carlos Rodríguez Pérez', email: 'carlos.rodriguez@email.com', phone: '+57 301 234 5678', room: 'Habitación Deluxe Doble', type: 'Deluxe', checkIn: '2026-03-18', checkOut: '2026-03-22', nights: 4, guests: 3, total: 1120, requested: '2026-03-15 11:45', timeLeft: '9h 51m', expired: false, status: 'Pendiente' },
    { id: 'BK-2024-003', guest: 'Ana Martínez Silva', email: 'ana.martinez@email.com', phone: '+57 302 345 6789', room: 'Suite Junior con Jacuzzi', type: 'Suite', checkIn: '2026-03-25', checkOut: '2026-03-28', nights: 3, guests: 2, total: 1140, requested: '2026-03-15 09:15', timeLeft: '7h 21m', expired: false, status: 'Pendiente' },
    { id: 'BK-2024-004', guest: 'Juan López Torres', email: 'juan.lopez@email.com', phone: '+57 303 456 7890', room: 'Suite Presidencial', type: 'Suite', checkIn: '2026-03-30', checkOut: '2026-04-05', nights: 6, guests: 4, total: 5100, requested: '2026-03-14 14:20', timeLeft: 'Expirada', expired: true, status: 'Pendiente' },
  ]);

  searchQuery = signal('');
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  showRejectModal = signal(false);
  rejectingRequest = signal<BookingRequest | null>(null);
  rejectReason = '';

  pendingRequests = computed(() => this.requests().filter(r => r.status === 'Pendiente'));
  confirmedToday = computed(() => this.requests().filter(r => r.status === 'Confirmada').length);
  rejectedToday = computed(() => this.requests().filter(r => r.status === 'Rechazada').length);
  confirmedRevenue = computed(() => this.requests().filter(r => r.status === 'Confirmada').reduce((sum, r) => sum + r.total, 0));

  filteredRequests = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const pending = this.pendingRequests();
    if (!q) return pending;
    return pending.filter(r => r.guest.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  });

  approve(req: BookingRequest) {
    if (req.expired) {
      this.showToast('Esta solicitud ha expirado y no puede ser aprobada.', 'error');
      return;
    }
    this.requests.update(list => list.map(r => r.id === req.id ? { ...r, status: 'Confirmada' as const } : r));
    this.showToast(`Reserva ${req.id} aprobada. Cobro procesado automáticamente.`, 'success');
  }

  openRejectModal(req: BookingRequest) {
    if (req.expired) {
      this.showToast('Esta solicitud ha expirado y no puede ser rechazada.', 'error');
      return;
    }
    this.rejectingRequest.set(req);
    this.rejectReason = '';
    this.showRejectModal.set(true);
  }

  confirmReject() {
    const req = this.rejectingRequest();
    if (!req || !this.rejectReason.trim()) return;
    this.requests.update(list => list.map(r => r.id === req.id ? { ...r, status: 'Rechazada' as const, rejectReason: this.rejectReason.trim() } : r));
    this.showRejectModal.set(false);
    this.rejectingRequest.set(null);
    this.showToast(`Reserva ${req.id} rechazada. Habitación liberada del inventario.`, 'success');
  }

  cancelReject() {
    this.showRejectModal.set(false);
    this.rejectingRequest.set(null);
    this.rejectReason = '';
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 4000);
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
