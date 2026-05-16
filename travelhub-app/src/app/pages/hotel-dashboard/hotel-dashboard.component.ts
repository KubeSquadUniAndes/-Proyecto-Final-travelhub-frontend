import { Component, OnInit, computed, signal, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BookingsService, Booking } from '../../services/bookings.service';
import { RoomsService, Room } from '../../services/rooms.service';

type Period = 'today' | '7days' | 'month' | 'year' | 'custom';
type Grouping = 'daily' | 'weekly' | 'monthly';

@Component({
  selector: 'app-hotel-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotel-dashboard.component.html',
  styleUrls: ['./hotel-dashboard.component.css']
})
export class HotelDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pieChart') pieChartRef!: ElementRef<HTMLCanvasElement>;

  private router = inject(Router);
  private authService = inject(AuthService);
  private bookingsService = inject(BookingsService);
  private roomsService = inject(RoomsService);

  readonly hotelName = computed(() => this.authService.currentUser()?.full_name ?? 'Mi Hotel');

  allBookings = signal<Booking[]>([]);
  allRooms = signal<Room[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  selectedPeriod = signal<Period>('month');
  customFrom = signal('');
  customTo = signal('');
  totalRooms = signal(0);

  // Filtered bookings by period
  periodBookings = computed(() => {
    const bookings = this.allBookings();
    const { start, end } = this.getDateRange();
    return bookings.filter(b => {
      const d = b.created_at?.substring(0, 10) ?? b.start_time.substring(0, 10);
      return d >= start && d <= end;
    });
  });

  // Previous period bookings for comparison
  prevPeriodBookings = computed(() => {
    const bookings = this.allBookings();
    const { start, end } = this.getPrevDateRange();
    return bookings.filter(b => {
      const d = b.created_at?.substring(0, 10) ?? b.start_time.substring(0, 10);
      return d >= start && d <= end;
    });
  });

  // KPIs
  kpis = computed(() => {
    const current = this.periodBookings();
    const confirmed = current.filter(b => ['confirmed', 'completed'].includes(b.status ?? ''));
    const grossRevenue = confirmed.reduce((sum, b) => sum + (parseFloat(b.final_price ?? '0') || Number(b.price_per_night) || 0), 0);
    const netRevenue = Math.round(grossRevenue * 0.81); // After 19% tax
    const totalNights = confirmed.reduce((sum, b) => sum + (b.total_nights ?? 1), 0);
    const adr = confirmed.length > 0 ? grossRevenue / totalNights : 0;
    const rooms = this.totalRooms() || 1;
    const daysInPeriod = this.getDaysInPeriod();
    const occupancy = Math.min(100, (totalNights / (rooms * daysInPeriod)) * 100);
    const revpar = adr * (occupancy / 100);

    return { grossRevenue, netRevenue, occupancy, adr, revpar, totalBookings: current.length, confirmed: confirmed.length };
  });

  // Previous KPIs for comparison
  prevKpis = computed(() => {
    const prev = this.prevPeriodBookings();
    const confirmed = prev.filter(b => ['confirmed', 'completed'].includes(b.status ?? ''));
    const grossRevenue = confirmed.reduce((sum, b) => sum + (parseFloat(b.final_price ?? '0') || Number(b.price_per_night) || 0), 0);
    const totalNights = confirmed.reduce((sum, b) => sum + (b.total_nights ?? 1), 0);
    const adr = confirmed.length > 0 ? grossRevenue / totalNights : 0;
    const rooms = this.totalRooms() || 1;
    const daysInPeriod = this.getDaysInPeriod();
    const occupancy = Math.min(100, (totalNights / (rooms * daysInPeriod)) * 100);
    return { grossRevenue, occupancy, adr, totalBookings: prev.length };
  });

  // Comparison deltas
  comparison = computed(() => {
    const curr = this.kpis();
    const prev = this.prevKpis();
    return {
      revenue: this.calcDelta(curr.grossRevenue, prev.grossRevenue),
      occupancy: this.calcDelta(curr.occupancy, prev.occupancy),
      adr: this.calcDelta(curr.adr, prev.adr),
      bookings: this.calcDelta(curr.totalBookings, prev.totalBookings),
    };
  });

  // Room type distribution for pie chart
  roomTypeDistribution = computed(() => {
    const bookings = this.periodBookings().filter(b => ['confirmed', 'completed', 'pending'].includes(b.status ?? ''));
    const map: Record<string, number> = {};
    bookings.forEach(b => { map[b.room_type] = (map[b.room_type] || 0) + 1; });
    return Object.entries(map).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);
  });

  // Popular rooms
  popularRooms = computed(() => {
    const bookings = this.periodBookings().filter(b => ['confirmed', 'completed', 'pending'].includes(b.status ?? ''));
    const map: Record<string, { name: string; type: string; count: number; revenue: number }> = {};
    bookings.forEach(b => {
      const key = b.room_type;
      if (!map[key]) map[key] = { name: b.room_type, type: b.room_type, count: 0, revenue: 0 };
      map[key].count++;
      map[key].revenue += parseFloat(b.final_price ?? '0') || Number(b.price_per_night) || 0;
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 5);
  });

  // Trend data for line chart
  trendData = computed(() => {
    const bookings = this.periodBookings();
    const map: Record<string, number> = {};
    bookings.forEach(b => {
      const d = (b.created_at ?? b.start_time).substring(0, 10);
      map[d] = (map[d] || 0) + 1;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));
  });

  ngOnInit() { this.loadData(); }

  ngAfterViewInit() {
    // Charts drawn after data loads via setTimeout in loadData
    this.drawCharts();
  }

  loadData() {
    this.isLoading.set(true);
    this.hasError.set(false);
    const userId = this.authService.currentUser()?.id ?? '';

    this.bookingsService.listByHotel(userId).subscribe({
      next: (bookings) => {
        this.allBookings.set(bookings);
        this.roomsService.list().subscribe({
          next: (rooms: Room[]) => {
            const hotelRooms = rooms.filter((r: Room) => r.hotel_id === userId);
            this.allRooms.set(hotelRooms);
            this.totalRooms.set(hotelRooms.length || 1);
            this.isLoading.set(false);
            setTimeout(() => this.drawCharts(), 50);
          },
          error: () => { this.totalRooms.set(1); this.isLoading.set(false); setTimeout(() => this.drawCharts(), 50); },
        });
      },
      error: () => { this.hasError.set(true); this.isLoading.set(false); },
    });
  }

  setPeriod(period: Period) {
    this.selectedPeriod.set(period);
    setTimeout(() => this.drawCharts(), 50);
  }

  onCustomDateChange() {
    if (this.customFrom() && this.customTo()) {
      this.selectedPeriod.set('custom');
      setTimeout(() => this.drawCharts(), 50);
    }
  }

  private getDateRange(): { start: string; end: string } {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().substring(0, 10);
    switch (this.selectedPeriod()) {
      case 'today': return { start: fmt(today), end: fmt(today) };
      case '7days': { const s = new Date(today); s.setDate(s.getDate() - 7); return { start: fmt(s), end: fmt(today) }; }
      case 'month': { const s = new Date(today.getFullYear(), today.getMonth(), 1); return { start: fmt(s), end: fmt(today) }; }
      case 'year': { const s = new Date(today.getFullYear(), 0, 1); return { start: fmt(s), end: fmt(today) }; }
      case 'custom': return { start: this.customFrom() || fmt(today), end: this.customTo() || fmt(today) };
    }
  }

  private getPrevDateRange(): { start: string; end: string } {
    const { start, end } = this.getDateRange();
    const s = new Date(start), e = new Date(end);
    const diff = e.getTime() - s.getTime();
    const prevEnd = new Date(s.getTime() - 86400000);
    const prevStart = new Date(prevEnd.getTime() - diff);
    const fmt = (d: Date) => d.toISOString().substring(0, 10);
    return { start: fmt(prevStart), end: fmt(prevEnd) };
  }

  private getDaysInPeriod(): number {
    const { start, end } = this.getDateRange();
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(diff / 86400000) + 1);
  }

  private calcDelta(current: number, previous: number): { value: number; direction: 'up' | 'down' | 'neutral' } {
    if (previous === 0) return { value: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'neutral' };
    const pct = Math.round(((current - previous) / previous) * 100);
    return { value: Math.abs(pct), direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral' };
  }

  // Canvas Charts
  drawCharts() {
    this.drawLineChart();
    this.drawPieChart();
  }

  private drawLineChart() {
    const canvas = this.lineChartRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = this.trendData();
    const w = canvas.width = canvas.offsetWidth * 2;
    const h = canvas.height = 300;
    ctx.clearRect(0, 0, w, h);
    if (data.length < 2) { ctx.font = '14px Inter'; ctx.fillStyle = '#6a7282'; ctx.fillText('Sin datos suficientes para graficar', w / 4, h / 2); return; }

    const pad = { top: 20, right: 20, bottom: 40, left: 50 };
    const maxVal = Math.max(...data.map(d => d.count), 1);
    const xStep = (w - pad.left - pad.right) / (data.length - 1);

    // Grid
    ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + ((h - pad.top - pad.bottom) / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
    }

    // Line
    ctx.beginPath(); ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    data.forEach((d, i) => {
      const x = pad.left + i * xStep;
      const y = pad.top + (1 - d.count / maxVal) * (h - pad.top - pad.bottom);
      if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
    });
    ctx.stroke();

    // Fill
    ctx.lineTo(pad.left + (data.length - 1) * xStep, h - pad.bottom);
    ctx.lineTo(pad.left, h - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = 'rgba(37, 99, 235, 0.08)'; ctx.fill();

    // Dots + labels
    ctx.fillStyle = '#2563eb';
    data.forEach((d, i) => {
      const x = pad.left + i * xStep;
      const y = pad.top + (1 - d.count / maxVal) * (h - pad.top - pad.bottom);
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    });

    // X labels
    ctx.fillStyle = '#6a7282'; ctx.font = '11px Inter'; ctx.textAlign = 'center';
    const step = Math.max(1, Math.floor(data.length / 6));
    data.forEach((d, i) => {
      if (i % step === 0) {
        ctx.fillText(d.date.substring(5), pad.left + i * xStep, h - 10);
      }
    });
  }

  private drawPieChart() {
    const canvas = this.pieChartRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dist = this.roomTypeDistribution();
    const w = canvas.width = 300; const h = canvas.height = 300;
    ctx.clearRect(0, 0, w, h);
    if (dist.length === 0) { ctx.font = '14px Inter'; ctx.fillStyle = '#6a7282'; ctx.fillText('Sin datos', w / 3, h / 2); return; }

    const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const total = dist.reduce((s, d) => s + d.count, 0);
    const cx = w / 2, cy = h / 2, r = 110;
    let startAngle = -Math.PI / 2;

    dist.forEach((d, i) => {
      const slice = (d.count / total) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, startAngle, startAngle + slice); ctx.closePath();
      ctx.fillStyle = colors[i % colors.length]; ctx.fill();
      // Label
      const mid = startAngle + slice / 2;
      const lx = cx + Math.cos(mid) * (r * 0.65);
      const ly = cy + Math.sin(mid) * (r * 0.65);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px Inter'; ctx.textAlign = 'center';
      ctx.fillText(`${Math.round((d.count / total) * 100)}%`, lx, ly);
      startAngle += slice;
    });
  }

  formatCurrency(val: number): string {
    return val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${val.toLocaleString('es-CO')}`;
  }

  // ── Report Generation ──────────────────────────────────────────────────────
  showReportModal = signal(false);
  reportGrouping = signal<Grouping>('daily');
  reportRoomType = signal('all');
  reportFrom = signal('');
  reportTo = signal('');
  reportGenerated = signal(false);

  reportData = computed(() => {
    const from = this.reportFrom() || this.getDateRange().start;
    const to = this.reportTo() || this.getDateRange().end;
    const roomType = this.reportRoomType();
    let bookings = this.allBookings().filter(b => {
      const d = b.created_at?.substring(0, 10) ?? b.start_time.substring(0, 10);
      return d >= from && d <= to && ['confirmed', 'completed', 'pending'].includes(b.status ?? '');
    });
    if (roomType !== 'all') {
      bookings = bookings.filter(b => b.room_type === roomType);
    }
    const totalRevenue = bookings.reduce((s, b) => s + (parseFloat(b.final_price ?? '0') || Number(b.price_per_night) || 0), 0);
    const avgPerBooking = bookings.length > 0 ? totalRevenue / bookings.length : 0;

    // Group by period
    const grouped: Record<string, { label: string; revenue: number; count: number }> = {};
    bookings.forEach(b => {
      const d = b.created_at?.substring(0, 10) ?? b.start_time.substring(0, 10);
      const key = this.getGroupKey(d);
      if (!grouped[key]) grouped[key] = { label: key, revenue: 0, count: 0 };
      grouped[key].revenue += parseFloat(b.final_price ?? '0') || Number(b.price_per_night) || 0;
      grouped[key].count++;
    });
    const breakdown = Object.values(grouped).sort((a, b) => a.label.localeCompare(b.label));

    // Comparison with previous period
    const diff = new Date(to).getTime() - new Date(from).getTime();
    const prevTo = new Date(new Date(from).getTime() - 86400000);
    const prevFrom = new Date(prevTo.getTime() - diff);
    const fmt = (dt: Date) => dt.toISOString().substring(0, 10);
    let prevBookings = this.allBookings().filter(b => {
      const d2 = b.created_at?.substring(0, 10) ?? b.start_time.substring(0, 10);
      return d2 >= fmt(prevFrom) && d2 <= fmt(prevTo) && ['confirmed', 'completed', 'pending'].includes(b.status ?? '');
    });
    if (roomType !== 'all') prevBookings = prevBookings.filter(b => b.room_type === roomType);
    const prevRevenue = prevBookings.reduce((s, b) => s + (parseFloat(b.final_price ?? '0') || Number(b.price_per_night) || 0), 0);
    const compPct = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : (totalRevenue > 0 ? 100 : 0);

    return { totalRevenue, totalBookings: bookings.length, avgPerBooking, breakdown, compPct, from, to };
  });

  availableRoomTypes = computed(() => {
    const types = new Set(this.allBookings().map(b => b.room_type));
    return Array.from(types);
  });

  private getGroupKey(date: string): string {
    switch (this.reportGrouping()) {
      case 'daily': return date;
      case 'weekly': {
        const d = new Date(date);
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        return `Sem ${d.toISOString().substring(5, 10)}`;
      }
      case 'monthly': return date.substring(0, 7);
    }
  }

  openReportModal() {
    this.reportFrom.set(this.getDateRange().start);
    this.reportTo.set(this.getDateRange().end);
    this.reportGenerated.set(false);
    this.showReportModal.set(true);
  }

  closeReportModal() { this.showReportModal.set(false); }

  generateReport() { this.reportGenerated.set(true); }

  exportPDF() {
    const data = this.reportData();
    const hotel = this.hotelName();
    const user = this.authService.currentUser()?.email ?? '';
    const now = new Date().toLocaleString('es-CO');

    let rows = '';
    data.breakdown.forEach(row => {
      rows += `<tr><td>${row.label}</td><td>${row.count}</td><td>${this.formatCurrency(row.revenue)}</td></tr>`;
    });

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reporte de Ingresos</title>
    <style>body{font-family:Arial,sans-serif;padding:40px;color:#333}h1{font-size:22px;margin-bottom:4px}p.sub{color:#666;font-size:13px;margin-bottom:20px}.kpis{display:flex;gap:20px;margin-bottom:24px}.kpi{background:#f5f5f5;padding:14px 20px;border-radius:8px;flex:1;text-align:center}.kpi .label{font-size:11px;color:#666;display:block}.kpi .val{font-size:20px;font-weight:700}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{padding:8px 12px;border-bottom:1px solid #eee;text-align:left;font-size:13px}th{background:#f9f9f9;font-weight:600}.footer{margin-top:30px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:10px}</style></head><body>
    <h1>Reporte de Ingresos - ${hotel}</h1>
    <p class="sub">Periodo: ${data.from} a ${data.to} | Agrupacion: ${this.reportGrouping()} | Tipo: ${this.reportRoomType() === 'all' ? 'Todas' : this.reportRoomType()}</p>
    <div class="kpis">
      <div class="kpi"><span class="label">Total Ingresos</span><span class="val">${this.formatCurrency(data.totalRevenue)}</span></div>
      <div class="kpi"><span class="label">Reservas</span><span class="val">${data.totalBookings}</span></div>
      <div class="kpi"><span class="label">Promedio/Reserva</span><span class="val">${this.formatCurrency(data.avgPerBooking)}</span></div>
      <div class="kpi"><span class="label">vs Anterior</span><span class="val">${data.compPct >= 0 ? '+' : ''}${data.compPct}%</span></div>
    </div>
    <table><thead><tr><th>Periodo</th><th>Reservas</th><th>Ingresos</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="footer">Generado: ${now} | Usuario: ${user}</div>
    </body></html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => { win.print(); }, 300);
    }
  }

  exportExcel() {
    const data = this.reportData();
    const hotel = this.hotelName();
    const user = this.authService.currentUser()?.email ?? '';
    const now = new Date().toLocaleString('es-CO');

    let csv = `Reporte de Ingresos;${hotel}\n`;
    csv += `Generado;${now};Usuario;${user}\n`;
    csv += `Periodo;${data.from} a ${data.to}\n`;
    csv += `Agrupacion;${this.reportGrouping()};Tipo;${this.reportRoomType() === 'all' ? 'Todas' : this.reportRoomType()}\n\n`;
    csv += `Total Ingresos;${data.totalRevenue}\n`;
    csv += `Total Reservas;${data.totalBookings}\n`;
    csv += `Promedio por Reserva;${Math.round(data.avgPerBooking)}\n`;
    csv += `Comparacion periodo anterior;${data.compPct}%\n\n`;
    csv += `Periodo;Reservas;Ingresos\n`;
    data.breakdown.forEach(row => {
      csv += `${row.label};${row.count};${row.revenue}\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    this.downloadBlob(blob, `reporte-ingresos-${data.from}-${data.to}.csv`);
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
