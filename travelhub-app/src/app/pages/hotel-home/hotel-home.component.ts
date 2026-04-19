import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

export interface HotelReserva {
  id: string;
  huesped: string;
  checkIn: string;
  checkOut: string;
  estado: 'Pendiente' | 'Confirmada' | 'En curso' | 'Completada' | 'Cancelada' | 'Rechazada';
  tipoHabitacion: string;
  rejectReason?: string;
}

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

  readonly hotelName = 'Grand Seaside Resort';
  reservas = signal<HotelReserva[]>([]);
  hasReservas = computed(() => this.reservas().length > 0);
  selectedReserva = signal<HotelReserva | null>(null);

  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');
  showRejectModal = signal(false);
  rejectingReserva = signal<HotelReserva | null>(null);
  rejectReason = '';

  pendingCount = computed(() => this.reservas().filter(r => r.estado === 'Pendiente').length);
  confirmedCount = computed(() => this.reservas().filter(r => r.estado === 'Confirmada').length);
  rejectedCount = computed(() => this.reservas().filter(r => r.estado === 'Rechazada').length);

  menuItems = [
    { label: 'Ver detalle', icon: '📋', action: 'detail' },
    { label: 'Aprobar reserva', icon: '✅', action: 'approve' },
    { label: 'Rechazar reserva', icon: '❌', action: 'reject' },
    { label: 'Reportes / Dashboard', icon: '📊', action: 'reports' },
  ];

  ngOnInit() {
    this.reservas.set([
      { id: 'BK-2401', huesped: 'María García', checkIn: '15 Mar 2026', checkOut: '18 Mar 2026', estado: 'Confirmada', tipoHabitacion: 'Suite Deluxe' },
      { id: 'BK-2402', huesped: 'Carlos Rodríguez', checkIn: '20 Mar 2026', checkOut: '25 Mar 2026', estado: 'Pendiente', tipoHabitacion: 'Habitación Doble' },
      { id: 'BK-2403', huesped: 'Ana Martínez', checkIn: '22 Mar 2026', checkOut: '24 Mar 2026', estado: 'Pendiente', tipoHabitacion: 'Suite Junior' },
      { id: 'BK-2404', huesped: 'Luis Pérez', checkIn: '10 Mar 2026', checkOut: '13 Mar 2026', estado: 'Completada', tipoHabitacion: 'Habitación Estándar' },
      { id: 'BK-2405', huesped: 'Sofia Torres', checkIn: '05 Mar 2026', checkOut: '08 Mar 2026', estado: 'Pendiente', tipoHabitacion: 'Suite Presidencial' },
    ]);
  }

  onMenuAction(action: string, reserva?: HotelReserva) {
    switch (action) {
      case 'detail':
        if (reserva) this.selectedReserva.set(this.selectedReserva() === reserva ? null : reserva);
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

  approveReserva(reserva: HotelReserva) {
    if (reserva.estado !== 'Pendiente') {
      this.showToast('Solo se pueden aprobar reservas en estado Pendiente.', 'error');
      return;
    }
    this.reservas.update(list => list.map(r => r.id === reserva.id ? { ...r, estado: 'Confirmada' as const } : r));
    this.showToast(`Reserva ${reserva.id} aprobada. Cobro procesado.`, 'success');
  }

  openRejectModal(reserva: HotelReserva) {
    if (reserva.estado !== 'Pendiente') {
      this.showToast('Solo se pueden rechazar reservas en estado Pendiente.', 'error');
      return;
    }
    this.rejectingReserva.set(reserva);
    this.rejectReason = '';
    this.showRejectModal.set(true);
  }

  confirmReject() {
    const reserva = this.rejectingReserva();
    if (!reserva || !this.rejectReason.trim()) return;
    this.reservas.update(list => list.map(r => r.id === reserva.id ? { ...r, estado: 'Rechazada' as const, rejectReason: this.rejectReason.trim() } : r));
    this.showRejectModal.set(false);
    this.rejectingReserva.set(null);
    this.showToast(`Reserva ${reserva.id} rechazada. Habitación liberada.`, 'success');
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

  estadoClass(estado: string): string {
    const map: Record<string, string> = {
      Pendiente: 'status-pending', Confirmada: 'status-confirmed', 'En curso': 'status-ongoing',
      Completada: 'status-completed', Cancelada: 'status-cancelled', Rechazada: 'status-rejected',
    };
    return map[estado] ?? '';
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
