import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BookingsService, Booking } from '../../services/bookings.service';

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
  private bookingsService = inject(BookingsService);

  readonly PAGE_SIZE = 20;

  allReservas = signal<Booking[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  currentPage = signal(1);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  searchQuery = signal('');
  estadoFilter = signal('');
  fechaDesde = signal('');
  fechaHasta = signal('');

  // Detail modal
  selectedBooking = signal<Booking | null>(null);

  // Edit modal
  showEditModal = signal(false);
  editingBooking = signal<Booking | null>(null);
  editForm = { start_time: '', end_time: '', notes: '' };

  // Cancel modal
  showCancelModal = signal(false);
  cancellingBooking = signal<Booking | null>(null);

  filteredReservas = computed(() => {
    let results = this.allReservas();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      results = results.filter(r =>
        r.id.toLowerCase().includes(q) ||
        (r.booking_code ?? '').toLowerCase().includes(q) ||
        r.traveler_name.toLowerCase().includes(q) ||
        r.room_type.toLowerCase().includes(q)
      );
    }
    const estado = this.estadoFilter();
    if (estado) {
      results = results.filter(r => r.status === estado);
    }
    const desde = this.fechaDesde();
    if (desde) {
      results = results.filter(r => r.start_time >= desde);
    }
    const hasta = this.fechaHasta();
    if (hasta) {
      results = results.filter(r => r.start_time <= hasta);
    }
    return results.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
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

  ngOnInit() { this.loadReservas(); }

  loadReservas() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.bookingsService.list().subscribe({
      next: (bookings) => { this.allReservas.set(bookings); this.isLoading.set(false); },
      error: () => { this.hasError.set(true); this.isLoading.set(false); },
    });
  }

  // Detail
  viewDetail(booking: Booking) {
    this.selectedBooking.set(this.selectedBooking()?.id === booking.id ? null : booking);
  }

  closeDetail() { this.selectedBooking.set(null); }

  // Edit
  openEdit(booking: Booking) {
    this.editingBooking.set(booking);
    this.editForm = {
      start_time: booking.start_time.split('T')[0],
      end_time: booking.end_time.split('T')[0],
      notes: booking.notes ?? '',
    };
    this.showEditModal.set(true);
  }

  closeEdit() { this.showEditModal.set(false); this.editingBooking.set(null); }

  saveEdit() {
    const booking = this.editingBooking();
    if (!booking) return;
    this.bookingsService.update(booking.id, {
      start_time: new Date(this.editForm.start_time).toISOString(),
      end_time: new Date(this.editForm.end_time).toISOString(),
      notes: this.editForm.notes,
    }).subscribe({
      next: () => { this.closeEdit(); this.loadReservas(); this.showToast('Reserva actualizada.', 'success'); },
      error: () => this.showToast('Error al actualizar.', 'error'),
    });
  }

  // Cancel
  openCancel(booking: Booking) {
    this.cancellingBooking.set(booking);
    this.showCancelModal.set(true);
  }

  closeCancel() { this.showCancelModal.set(false); this.cancellingBooking.set(null); }

  confirmCancel() {
    const booking = this.cancellingBooking();
    if (!booking) return;
    this.bookingsService.delete(booking.id).subscribe({
      next: () => { this.closeCancel(); this.loadReservas(); this.showToast('Reserva cancelada.', 'success'); },
      error: () => this.showToast('Error al cancelar.', 'error'),
    });
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 4000);
  }

  clearFilters() {
    this.searchQuery.set(''); this.estadoFilter.set('');
    this.fechaDesde.set(''); this.fechaHasta.set('');
    this.currentPage.set(1);
  }

  goToPage(page: number) { if (page >= 1 && page <= this.totalPages()) this.currentPage.set(page); }

  getPages(): number[] {
    const total = this.totalPages(), current = this.currentPage(), pages: number[] = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) pages.push(i);
    return pages;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  estadoClass(estado: string | undefined): string {
    const map: Record<string, string> = { 'pending': 'status-pending', 'confirmed': 'status-confirmed', 'cancelled': 'status-cancelled', 'completed': 'status-completed' };
    return map[estado ?? ''] ?? '';
  }

  estadoLabel(estado: string | undefined): string {
    const map: Record<string, string> = { 'pending': 'Pendiente', 'confirmed': 'Confirmada', 'cancelled': 'Cancelada', 'completed': 'Completada' };
    return map[estado ?? ''] ?? estado ?? '';
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
