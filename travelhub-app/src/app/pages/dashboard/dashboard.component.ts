import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

export interface Reserva {
  codigo: string;
  hotel: string;
  ciudad: string;
  checkIn: string;
  checkOut: string;
  huespedes: number;
  estado: 'Pendiente de pago' | 'Confirmada' | 'Cancelada' | 'Completada';
  monto: number;
}

function generateMockReservas(): Reserva[] {
  const hoteles = [
    { name: 'Grand Seaside Resort', ciudad: 'Cartagena' },
    { name: 'Metropolitan Plaza Hotel', ciudad: 'Bogotá' },
    { name: 'Villa Boutique Colonial', ciudad: 'Villa de Leyva' },
    { name: 'Eco Lodge Tayrona', ciudad: 'Santa Marta' },
    { name: 'Hotel Dann Carlton', ciudad: 'Medellín' },
    { name: 'Sofitel Legend Santa Clara', ciudad: 'Cartagena' },
    { name: 'Selina Medellín', ciudad: 'Medellín' },
    { name: 'Punta Faro Lodge', ciudad: 'San Andrés' },
  ];
  const estados: Reserva['estado'][] = ['Pendiente de pago', 'Confirmada', 'Cancelada', 'Completada'];
  const reservas: Reserva[] = [];

  for (let i = 0; i < 47; i++) {
    const h = hoteles[i % hoteles.length];
    const base = new Date(2026, 0, 1);
    base.setDate(base.getDate() + Math.floor(Math.random() * 180));
    const checkIn = base.toISOString().split('T')[0];
    const out = new Date(base);
    out.setDate(out.getDate() + Math.floor(Math.random() * 7) + 1);
    const checkOut = out.toISOString().split('T')[0];

    reservas.push({
      codigo: `TH-2026-${String(10001 + i).padStart(5, '0')}`,
      hotel: h.name,
      ciudad: h.ciudad,
      checkIn,
      checkOut,
      huespedes: Math.floor(Math.random() * 4) + 1,
      estado: estados[i % estados.length],
      monto: (Math.floor(Math.random() * 15) + 3) * 100000,
    });
  }

  return reservas.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime());
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  readonly PAGE_SIZE = 20;

  allReservas = signal<Reserva[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  currentPage = signal(1);

  searchQuery = signal('');
  estadoFilter = signal('');
  fechaDesde = signal('');
  fechaHasta = signal('');

  filteredReservas = computed(() => {
    let results = this.allReservas();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      results = results.filter(r => r.codigo.toLowerCase().includes(q) || r.hotel.toLowerCase().includes(q));
    }
    const estado = this.estadoFilter();
    if (estado) {
      results = results.filter(r => r.estado === estado);
    }
    const desde = this.fechaDesde();
    if (desde) {
      results = results.filter(r => r.checkIn >= desde);
    }
    const hasta = this.fechaHasta();
    if (hasta) {
      results = results.filter(r => r.checkIn <= hasta);
    }
    return results;
  });

  paginatedReservas = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredReservas().slice(start, start + this.PAGE_SIZE);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredReservas().length / this.PAGE_SIZE)));

  paginationLabel = computed(() => {
    const total = this.filteredReservas().length;
    if (total === 0) return 'Sin resultados';
    const start = (this.currentPage() - 1) * this.PAGE_SIZE + 1;
    const end = Math.min(this.currentPage() * this.PAGE_SIZE, total);
    return `${start}-${end} de ${total} reservas`;
  });

  hasFilters = computed(() => !!this.searchQuery().trim() || !!this.estadoFilter() || !!this.fechaDesde() || !!this.fechaHasta());

  ngOnInit() {
    this.loadReservas();
  }

  loadReservas() {
    this.isLoading.set(true);
    this.hasError.set(false);
    setTimeout(() => {
      try {
        this.allReservas.set(generateMockReservas());
        this.isLoading.set(false);
      } catch {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    }, 300);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.estadoFilter.set('');
    this.fechaDesde.set('');
    this.fechaHasta.set('');
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
      'Pendiente de pago': 'status-pending',
      'Confirmada': 'status-confirmed',
      'Cancelada': 'status-cancelled',
      'Completada': 'status-completed',
    };
    return map[estado] ?? '';
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.authService.logout();
  }
}
