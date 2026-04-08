import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cancel-booking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cancel-booking.component.html',
  styleUrls: ['./cancel-booking.component.css'],
})
export class CancelBookingComponent {
  private router = inject(Router);

  bookings = [
    {
      hotel: 'Hotel Paraíso del Caribe',
      location: 'Cartagena, Colombia',
      room: 'Suite Premium Ocean View',
      status: 'Confirmada',
      statusClass: 'confirmed',
      id: 'TH-847392',
      checkIn: '2026-03-25',
      checkOut: '2026-03-30',
      nights: 5,
      guests: 2,
      total: 2250,
      payment: 'Visa **** 4242',
      canCancel: true,
    },
    {
      hotel: 'Hotel Costa Azul',
      location: 'Santa Marta, Colombia',
      room: 'Habitación Deluxe Doble',
      status: 'Pendiente de pago',
      statusClass: 'pending',
      id: 'TH-847393',
      checkIn: '2026-04-10',
      checkOut: '2026-04-15',
      nights: 5,
      guests: 2,
      total: 1500,
      paid: 750,
      payment: 'MasterCard **** 5555',
      canCancel: true,
    },
    {
      hotel: 'Hotel Plaza Mayor',
      location: 'Bogotá, Colombia',
      room: 'Suite Junior',
      status: 'Completada',
      statusClass: 'completed',
      id: 'TH-847391',
      checkIn: '2026-02-15',
      checkOut: '2026-02-18',
      nights: 3,
      guests: 1,
      total: 900,
      payment: 'Visa **** 4242',
      canCancel: false,
    },
    {
      hotel: 'Hotel Boutique Centro',
      location: 'Medellín, Colombia',
      room: 'Habitación Estándar',
      status: 'Cancelada',
      statusClass: 'cancelled',
      id: 'TH-847390',
      checkIn: '2026-01-20',
      checkOut: '2026-01-23',
      nights: 3,
      guests: 1,
      total: 450,
      payment: 'Visa **** 4242',
      canCancel: false,
    },
  ];

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
