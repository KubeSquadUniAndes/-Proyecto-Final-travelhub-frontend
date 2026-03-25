import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  stats = [
    { label: 'Ingresos Totales', value: '$482,560', change: '+12.5%', positive: true, sub: 'vs. mes anterior' },
    { label: 'Reservas', value: '1,234', change: '+8.2%', positive: true, sub: 'total del mes' },
    { label: 'Usuarios Activos', value: '8,453', change: '+15.3%', positive: true, sub: 'últimos 30 días' },
    { label: 'Hoteles Activos', value: '342', change: '-2.4%', positive: false, sub: 'en plataforma' },
  ];

  reservas = [
    { id: 'BK-2401', hotel: 'Grand Luxury Hotel', usuario: 'María García', fecha: '8 Mar 2026', checkIn: '15 Mar 2026', noches: 3, monto: '$1,200', estado: 'Confirmada' },
    { id: 'BK-2402', hotel: 'Seaside Resort & Spa', usuario: 'Carlos Rodríguez', fecha: '8 Mar 2026', checkIn: '20 Mar 2026', noches: 5, monto: '$2,500', estado: 'Confirmada' },
    { id: 'BK-2403', hotel: 'Mountain View Lodge', usuario: 'Ana Martínez', fecha: '7 Mar 2026', checkIn: '12 Mar 2026', noches: 2, monto: '$800', estado: 'Pendiente' },
  ];

  trafico = [
    { region: 'América', conversion: '1.97%', visitas: '45.2k', reservas: '892' },
    { region: 'América', conversion: '2.98%', visitas: '38.8k', reservas: '1156' },
    { region: 'Europa', conversion: '2.5%', visitas: '29.3k', reservas: '734' },
    { region: 'Asia', conversion: '2.39%', visitas: '18.9k', reservas: '453' },
  ];

  searchQuery = '';

  constructor(private router: Router) {}
  navigate(path: string) { this.router.navigate([path]); }
}
