import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-booking-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-requests.component.html',
  styleUrls: ['./booking-requests.component.css']
})
export class BookingRequestsComponent {
  requests = [
    { id: 'BK-2024-001', guest: 'María García López', email: 'maria.garcia@email.com', phone: '+57 300 123 4567', room: 'Suite Premium Ocean View', type: 'Suite', checkIn: '2026-03-20', checkOut: '2026-03-25', nights: 5, guests: 2, total: 2250, requested: '2026-03-15 10:30', timeLeft: '8h 36m restantes', expired: false },
    { id: 'BK-2024-002', guest: 'Carlos Rodríguez Pérez', email: 'carlos.rodriguez@email.com', phone: '+57 301 234 5678', room: 'Habitación Deluxe Doble', type: 'Deluxe', checkIn: '2026-03-18', checkOut: '2026-03-22', nights: 4, guests: 3, total: 1120, requested: '2026-03-15 11:45', timeLeft: '9h 51m restantes', expired: false },
    { id: 'BK-2024-003', guest: 'Ana Martínez Silva', email: 'ana.martinez@email.com', phone: '+57 302 345 6789', room: 'Suite Junior con Jacuzzi', type: 'Suite', checkIn: '2026-03-25', checkOut: '2026-03-28', nights: 3, guests: 2, total: 1140, requested: '2026-03-15 09:15', timeLeft: '7h 21m restantes', expired: false },
    { id: 'BK-2024-004', guest: 'Juan López Torres', email: 'juan.lopez@email.com', phone: '+57 303 456 7890', room: 'Suite Presidencial', type: 'Suite', checkIn: '2026-03-30', checkOut: '2026-04-05', nights: 6, guests: 4, total: 5100, requested: '2026-03-14 14:20', timeLeft: 'Expirada', expired: true }
  ];

  constructor(private router: Router) {}

  navigate(path: string) { this.router.navigate([path]); }
}
