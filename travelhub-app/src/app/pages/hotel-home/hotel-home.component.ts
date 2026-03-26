import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface HotelReserva {
  id: string;
  huesped: string;
  checkIn: string;
  checkOut: string;
  estado: 'Pendiente' | 'Confirmada' | 'En curso' | 'Completada' | 'Cancelada';
  tipoHabitacion: string;
}

@Component({
  selector: 'app-hotel-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hotel-home.component.html',
  styleUrls: ['./hotel-home.component.css']
})
export class HotelHomeComponent implements OnInit {
  readonly hotelName = 'Grand Seaside Resort';
  reservas = signal<HotelReserva[]>([]);
  hasReservas = computed(() => this.reservas().length > 0);
  selectedReserva = signal<HotelReserva | null>(null);

  menuItems = [
    { label: 'Ver detalle', icon: '📋', action: 'detail' },
    { label: 'Aprobar reserva', icon: '✅', action: 'approve' },
    { label: 'Cancelar reserva', icon: '❌', action: 'cancel' },
    { label: 'Reportes / Dashboard', icon: '📊', action: 'reports' },
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Simula carga de reservas del hotel autenticado
    this.reservas.set([
      { id: 'BK-2401', huesped: 'María García', checkIn: '15 Mar 2026', checkOut: '18 Mar 2026', estado: 'Confirmada', tipoHabitacion: 'Suite Deluxe' },
      { id: 'BK-2402', huesped: 'Carlos Rodríguez', checkIn: '20 Mar 2026', checkOut: '25 Mar 2026', estado: 'Pendiente', tipoHabitacion: 'Habitación Doble' },
      { id: 'BK-2403', huesped: 'Ana Martínez', checkIn: '22 Mar 2026', checkOut: '24 Mar 2026', estado: 'En curso', tipoHabitacion: 'Suite Junior' },
      { id: 'BK-2404', huesped: 'Luis Pérez', checkIn: '10 Mar 2026', checkOut: '13 Mar 2026', estado: 'Completada', tipoHabitacion: 'Habitación Estándar' },
      { id: 'BK-2405', huesped: 'Sofia Torres', checkIn: '05 Mar 2026', checkOut: '08 Mar 2026', estado: 'Cancelada', tipoHabitacion: 'Suite Presidencial' },
    ]);
  }

  onMenuAction(action: string, reserva?: HotelReserva) {
    switch (action) {
      case 'detail':
        if (reserva) this.selectedReserva.set(this.selectedReserva() === reserva ? null : reserva);
        break;
      case 'approve':
        if (reserva && reserva.estado === 'Pendiente') reserva.estado = 'Confirmada';
        break;
      case 'cancel':
        if (reserva && !['Completada', 'Cancelada'].includes(reserva.estado)) reserva.estado = 'Cancelada';
        break;
      case 'reports':
        this.router.navigate(['/hotel-dashboard']);
        break;
    }
  }

  estadoClass(estado: string): string {
    const map: Record<string, string> = {
      'Pendiente': 'status-pending', 'Confirmada': 'status-confirmed', 'En curso': 'status-ongoing',
      'Completada': 'status-completed', 'Cancelada': 'status-cancelled'
    };
    return map[estado] ?? '';
  }

  navigate(path: string) { this.router.navigate([path]); }
}
