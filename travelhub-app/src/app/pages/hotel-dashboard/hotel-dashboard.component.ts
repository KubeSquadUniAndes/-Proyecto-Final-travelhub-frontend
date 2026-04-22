import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

export interface Reserva {
  id: string;
  huesped: string;
  checkIn: Date;
  checkOut: Date;
  estado: 'Pendiente' | 'Confirmada' | 'En curso' | 'Completada' | 'Cancelada' | 'Rechazada';
  monto: number;
  huespedes: number;
}

@Component({
  selector: 'app-hotel-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotel-dashboard.component.html',
  styleUrls: ['./hotel-dashboard.component.css']
})
export class HotelDashboardComponent implements OnInit {
  private authService = inject(AuthService);

  readonly PAGE_SIZE = 50;
  readonly hotelName = computed(() => this.authService.currentUser()?.full_name ?? 'Mi Hotel');

  allReservas = signal<Reserva[]>([]);
  currentPage = signal(1);
  searchQuery = signal('');

  filteredReservas = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.allReservas()
      .filter(r => !q || r.huesped.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
      .sort((a, b) => b.checkIn.getTime() - a.checkIn.getTime());
  });

  paginatedReservas = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredReservas().slice(start, start + this.PAGE_SIZE);
  });

  totalPages = computed(() => Math.ceil(this.filteredReservas().length / this.PAGE_SIZE));

  paginationLabel = computed(() => {
    const total = this.filteredReservas().length;
    const start = (this.currentPage() - 1) * this.PAGE_SIZE + 1;
    const end = Math.min(this.currentPage() * this.PAGE_SIZE, total);
    return `Mostrando ${start}-${end} de ${total} reservas`;
  });

  stats = computed(() => {
    const r = this.allReservas();
    return {
      total: r.length,
      confirmadas: r.filter(x => x.estado === 'Confirmada').length,
      pendientes: r.filter(x => x.estado === 'Pendiente').length,
      ingresos: r.filter(x => ['Confirmada', 'Completada', 'En curso'].includes(x.estado))
                  .reduce((acc, x) => acc + x.monto, 0)
    };
  });

  constructor(private router: Router) {}

  ngOnInit() {
    const now = new Date();
    const mock: Reserva[] = Array.from({ length: 120 }, (_, i) => {
      const checkIn = new Date(now);
      checkIn.setDate(now.getDate() - Math.floor(Math.random() * 30));
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkIn.getDate() + Math.floor(Math.random() * 7) + 1);
      const estados: Reserva['estado'][] = ['Pendiente', 'Confirmada', 'En curso', 'Completada', 'Cancelada', 'Rechazada'];
      return {
        id: `BK-${2400 + i}`,
        huesped: ['María García', 'Carlos Rodríguez', 'Ana Martínez', 'Luis Pérez', 'Sofia Torres'][i % 5],
        checkIn,
        checkOut,
        estado: estados[i % estados.length],
        monto: (Math.floor(Math.random() * 20) + 5) * 100,
        huespedes: Math.floor(Math.random() * 4) + 1
      };
    });
    this.allReservas.set(mock);
  }

  onSearch(q: string) {
    this.searchQuery.set(q);
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page);
  }

  getPages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) pages.push(i);
    return pages;
  }

  estadoClass(estado: string): string {
    const map: Record<string, string> = {
      'Pendiente': 'status-pending',
      'Confirmada': 'status-confirmed',
      'En curso': 'status-ongoing',
      'Completada': 'status-completed',
      'Cancelada': 'status-cancelled',
      'Rechazada': 'status-rejected'
    };
    return map[estado] ?? '';
  }

  navigate(path: string) { this.router.navigate([path]); }
}
