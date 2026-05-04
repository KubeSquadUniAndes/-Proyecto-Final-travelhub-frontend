import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BookingsService, Booking } from '../../services/bookings.service';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
];

@Component({
  selector: 'app-hotel-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotel-dashboard.component.html',
  styleUrls: ['./hotel-dashboard.component.css']
})
export class HotelDashboardComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private bookingsService = inject(BookingsService);

  readonly PAGE_SIZE = 50;
  readonly hotelName = computed(() => this.authService.currentUser()?.full_name ?? 'Mi Hotel');
  readonly statusOptions = STATUS_OPTIONS;

  allReservas = signal<Booking[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  currentPage = signal(1);
  searchQuery = signal('');
  filterDateFrom = signal('');
  filterDateTo = signal('');
  filterStatuses = signal<string[]>([]);
  showStatusDropdown = signal(false);

  filteredReservas = computed(() => {
    const q = this.searchQuery().toLowerCase();
    const from = this.filterDateFrom();
    const to = this.filterDateTo();
    const statuses = this.filterStatuses();
    return this.allReservas()
      .filter(r => {
        if (q && !r.traveler_name.toLowerCase().includes(q) && !(r.booking_code ?? '').toLowerCase().includes(q) && !r.id.toLowerCase().includes(q) && !(r.traveler_email ?? '').toLowerCase().includes(q)) return false;
        if (statuses.length > 0 && !statuses.includes(r.status ?? '')) return false;
        const rDate = (r.start_time ?? '').substring(0, 10);
        if (from && rDate < from) return false;
        if (to && rDate > to) return false;
        return true;
      })
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  });

  hasActiveFilters = computed(() =>
    this.filterDateFrom() !== '' || this.filterDateTo() !== '' || this.filterStatuses().length > 0
  );

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
    const r = this.filteredReservas();
    return {
      total: r.length,
      confirmadas: r.filter(x => x.status === 'confirmed').length,
      pendientes: r.filter(x => x.status === 'pending').length,
      ingresos: r.filter(x => ['confirmed', 'completed'].includes(x.status ?? ''))
                  .reduce((acc, x) => acc + (parseFloat(x.final_price ?? '0') || Number(x.price_per_night) || 0), 0)
    };
  });

  statusDropdownLabel = computed(() => {
    const selected = this.filterStatuses();
    if (selected.length === 0) return 'Todos los estados';
    if (selected.length === 1) return STATUS_OPTIONS.find(s => s.value === selected[0])?.label ?? selected[0];
    return `${selected.length} estados`;
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery.set(params['search'] ?? '');
      this.filterDateFrom.set(params['dateFrom'] ?? '');
      this.filterDateTo.set(params['dateTo'] ?? '');
      const statusParam = params['statuses'];
      this.filterStatuses.set(statusParam ? statusParam.split(',').filter(Boolean) : []);
    });
    this.loadReservas();
  }

  loadReservas() {
    this.isLoading.set(true);
    this.hasError.set(false);
    const userId = this.authService.currentUser()?.id ?? '';
    this.bookingsService.listByHotel(userId).subscribe({
      next: (bookings) => { this.allReservas.set(bookings); this.isLoading.set(false); },
      error: () => { this.hasError.set(true); this.isLoading.set(false); },
    });
  }

  onSearch(q: string) {
    this.searchQuery.set(q);
    this.currentPage.set(1);
    this.syncQueryParams();
  }

  onDateFromChange(val: string) {
    this.filterDateFrom.set(val);
    this.currentPage.set(1);
    this.syncQueryParams();
  }

  onDateToChange(val: string) {
    this.filterDateTo.set(val);
    this.currentPage.set(1);
    this.syncQueryParams();
  }

  toggleStatus(status: string) {
    const current = this.filterStatuses();
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    this.filterStatuses.set(updated);
    this.currentPage.set(1);
    this.syncQueryParams();
  }

  isStatusSelected(status: string): boolean {
    return this.filterStatuses().includes(status);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.filterStatuses.set([]);
    this.showStatusDropdown.set(false);
    this.currentPage.set(1);
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }

  toggleStatusDropdown() {
    this.showStatusDropdown.update(v => !v);
  }

  closeStatusDropdown() {
    this.showStatusDropdown.set(false);
  }

  private syncQueryParams() {
    const params: Record<string, string> = {};
    if (this.searchQuery()) params['search'] = this.searchQuery();
    if (this.filterDateFrom()) params['dateFrom'] = this.filterDateFrom();
    if (this.filterDateTo()) params['dateTo'] = this.filterDateTo();
    if (this.filterStatuses().length > 0) params['statuses'] = this.filterStatuses().join(',');
    this.router.navigate([], { queryParams: params, replaceUrl: true });
  }

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
