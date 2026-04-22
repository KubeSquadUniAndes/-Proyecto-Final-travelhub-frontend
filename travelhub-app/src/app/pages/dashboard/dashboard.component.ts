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

  // Payment modal
  showPaymentModal = signal(false);
  payingBooking = signal<Booking | null>(null);
  isProcessingPayment = signal(false);
  paymentForm = { cardNumber: '', cardName: '', expiry: '', cvv: '' };
  cardBrand = signal('');
  cardErrors = signal<Record<string, string>>({});
  showCancelModal = signal(false);
  cancellingBooking = signal<Booking | null>(null);
  cancelReason = '';
  isCancelling = signal(false);

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

  // Payment
  openPayment(booking: Booking) {
    this.payingBooking.set(booking);
    this.paymentForm = { cardNumber: '', cardName: '', expiry: '', cvv: '' };
    this.cardBrand.set('');
    this.cardErrors.set({});
    this.isProcessingPayment.set(false);
    this.showPaymentModal.set(true);
  }

  closePayment() { this.showPaymentModal.set(false); this.payingBooking.set(null); }

  onCardNumberInput(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    this.paymentForm.cardNumber = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.cardBrand.set(this.detectBrand(digits));
  }

  onExpiryInput(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    this.paymentForm.expiry = digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
  }

  onCvvInput(value: string) {
    this.paymentForm.cvv = value.replace(/\D/g, '').slice(0, 4);
  }

  private detectBrand(digits: string): string {
    if (/^4/.test(digits)) return 'Visa';
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'Mastercard';
    if (/^3[47]/.test(digits)) return 'Amex';
    if (/^6(?:011|5)/.test(digits)) return 'Discover';
    if (/^3(?:0[0-5]|[68])/.test(digits)) return 'Diners';
    return '';
  }

  private luhnCheck(num: string): boolean {
    const digits = num.replace(/\D/g, '');
    let sum = 0;
    let alternate = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let n = parseInt(digits[i], 10);
      if (alternate) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }

  validatePayment(): boolean {
    const errors: Record<string, string> = {};
    const digits = this.paymentForm.cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 16) errors['cardNumber'] = 'Número de tarjeta inválido';
    else if (!this.luhnCheck(digits)) errors['cardNumber'] = 'Número de tarjeta inválido';
    if (!this.paymentForm.cardName.trim()) errors['cardName'] = 'Nombre requerido';
    const expParts = this.paymentForm.expiry.split('/');
    if (expParts.length !== 2 || parseInt(expParts[0]) < 1 || parseInt(expParts[0]) > 12) errors['expiry'] = 'Fecha inválida (MM/AA)';
    else {
      const expMonth = parseInt(expParts[0]);
      const expYear = parseInt('20' + expParts[1]);
      const now = new Date();
      if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) errors['expiry'] = 'Tarjeta vencida';
    }
    const cvvLen = this.cardBrand() === 'Amex' ? 4 : 3;
    if (this.paymentForm.cvv.length !== cvvLen) errors['cvv'] = `CVV debe tener ${cvvLen} dígitos`;
    this.cardErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  confirmPayment() {
    const booking = this.payingBooking();
    if (!booking || !this.validatePayment()) return;
    this.isProcessingPayment.set(true);
    this.bookingsService.update(booking.id, { status: 'confirmed' } as Partial<Booking>).subscribe({
      next: () => { this.closePayment(); this.loadReservas(); this.showToast(`Pago procesado. Reserva ${booking.booking_code} confirmada.`, 'success'); },
      error: () => { this.isProcessingPayment.set(false); this.showToast('Error al procesar el pago. Intenta de nuevo.', 'error'); },
    });
  }

  // Cancel
  openCancel(booking: Booking) {
    this.cancellingBooking.set(booking);
    this.cancelReason = '';
    this.isCancelling.set(false);
    this.showCancelModal.set(true);
  }

  closeCancel() { this.showCancelModal.set(false); this.cancellingBooking.set(null); this.cancelReason = ''; }

  confirmCancel() {
    const booking = this.cancellingBooking();
    if (!booking || !this.cancelReason.trim()) return;
    this.isCancelling.set(true);
    this.bookingsService.delete(booking.id).subscribe({
      next: () => {
        this.closeCancel();
        this.loadReservas();
        const refund = booking.final_price ? `Devolución de $${booking.final_price} procesada.` : '';
        this.showToast(`Reserva ${booking.booking_code} cancelada. Habitación liberada. ${refund}`, 'success');
      },
      error: () => {
        this.isCancelling.set(false);
        this.showToast('Error al cancelar la reserva. La reserva mantiene su estado original. Intenta de nuevo.', 'error');
      },
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
