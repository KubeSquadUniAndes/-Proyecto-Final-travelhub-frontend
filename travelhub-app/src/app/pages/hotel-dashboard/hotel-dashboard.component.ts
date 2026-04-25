import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BookingsService, Booking } from '../../services/bookings.service';

@Component({
  selector: 'app-hotel-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotel-dashboard.component.html',
  styleUrls: ['./hotel-dashboard.component.css']
})
export class HotelDashboardComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private bookingsService = inject(BookingsService);

  readonly PAGE_SIZE = 50;
  readonly hotelName = computed(() => this.authService.currentUser()?.full_name ?? 'Mi Hotel');

  allReservas = signal<Booking[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  currentPage = signal(1);
  searchQuery = signal('');

  filteredReservas = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.allReservas()
      .filter(r => !q || r.traveler_name.toLowerCase().includes(q) || (r.booking_code ?? '').toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  });

  paginatedReservas = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredReservas().slice(start, start + this.PAGE_SIZE);
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredReservas().length / this.PAGE_SIZE)));

  paginationLabel = computed(() => {
    const total = this.filteredReservas().length;
    if (total === 0) return 'Sin reservas';
    const start = (this.currentPage() - 1) * this.PAGE_SIZE + 1;
    const end = Math.min(this.currentPage() * this.PAGE_SIZE, total);
    return `Mostrando ${start}-${end} de ${total} reservas`;
  });

  stats = computed(() => {
    const r = this.allReservas();
    return {
      total: r.length,
      confirmadas: r.filter(x => x.status === 'confirmed').length,
      pendientes: r.filter(x => x.status === 'pending').length,
      ingresos: r.filter(x => ['confirmed', 'completed'].includes(x.status ?? ''))
                  .reduce((acc, x) => acc + (parseFloat(x.final_price ?? '0') || Number(x.price_per_night) || 0), 0)
    };
  });

  ngOnInit() { this.loadReservas(); }

  loadReservas() {
    this.isLoading.set(true);
    this.hasError.set(false);
    const userId = this.authService.currentUser()?.id ?? '';
    this.bookingsService.listByHotel(userId).subscribe({
      next: (bookings) => { this.allReservas.set(bookings); this.isLoading.set(false); },
      error: () => { this.hasError.set(true); this.isLoading.set(false); },
    });
  }

  onSearch(q: string) { this.searchQuery.set(q); this.currentPage.set(1); }
  goToPage(page: number) { if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page); }

  getPages(): number[] {
    const total = this.totalPages(), current = this.currentPage(), pages: number[] = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) pages.push(i);
    return pages;
  }

  estadoClass(estado: string | undefined): string {
    const map: Record<string, string> = { pending: 'status-pending', confirmed: 'status-confirmed', completed: 'status-completed', cancelled: 'status-cancelled' };
    return map[estado ?? ''] ?? '';
  }

  estadoLabel(estado: string | undefined): string {
    const map: Record<string, string> = { pending: 'Pendiente', confirmed: 'Confirmada', completed: 'Completada', cancelled: 'Cancelada' };
    return map[estado ?? ''] ?? estado ?? '';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
