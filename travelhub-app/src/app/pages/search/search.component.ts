import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RoomsService, Room } from '../../services/rooms.service';

const FALLBACK_ROOMS: Room[] = [
  { id: crypto.randomUUID(), name: 'Suite Premium Ocean View', room_type: 'suite', price: '450.00', capacity: 4, beds: '1 king', size: 45, amenities: 'WiFi, AC, TV, Minibar, Vista al mar' },
  { id: crypto.randomUUID(), name: 'Habitación Deluxe Doble', room_type: 'doble', price: '280.00', capacity: 2, beds: '2 camas dobles', size: 35, amenities: 'WiFi, AC, TV' },
  { id: crypto.randomUUID(), name: 'Suite Junior con Jacuzzi', room_type: 'suite', price: '380.00', capacity: 3, beds: '1 king + sofá cama', size: 40, amenities: 'WiFi, AC, TV, Jacuzzi' },
  { id: crypto.randomUUID(), name: 'Habitación Estándar', room_type: 'individual', price: '150.00', capacity: 2, beds: '1 cama doble', size: 25, amenities: 'WiFi, AC' },
  { id: crypto.randomUUID(), name: 'Suite Presidencial', room_type: 'suite', price: '620.00', capacity: 6, beds: '1 king + 2 individuales', size: 65, amenities: 'WiFi, AC, TV, Minibar, Sala, Terraza' },
  { id: crypto.randomUUID(), name: 'Habitación Familiar', room_type: 'doble', price: '320.00', capacity: 5, beds: '2 dobles + 1 individual', size: 42, amenities: 'WiFi, AC, TV, Cocina' },
  { id: crypto.randomUUID(), name: 'Habitación Económica', room_type: 'individual', price: '100.00', capacity: 1, beds: '1 individual', size: 18, amenities: 'WiFi, AC' },
  { id: crypto.randomUUID(), name: 'Suite Luna de Miel', room_type: 'suite', price: '520.00', capacity: 2, beds: '1 king', size: 50, amenities: 'WiFi, AC, TV, Jacuzzi, Champagne' },
  { id: crypto.randomUUID(), name: 'Habitación Triple', room_type: 'doble', price: '250.00', capacity: 3, beds: '3 individuales', size: 30, amenities: 'WiFi, AC, TV' },
  { id: crypto.randomUUID(), name: 'Penthouse', room_type: 'suite', price: '900.00', capacity: 8, beds: '2 king + sofá cama', size: 90, amenities: 'WiFi, AC, TV, Minibar, Terraza, Cocina, Sala' },
];

const IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400',
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400',
  'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400',
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400',
  'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400',
];

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private roomsService = inject(RoomsService);

  allRooms = signal<Room[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  destino = signal('');
  checkIn = signal('');
  checkOut = signal('');
  huespedes = signal(1);

  filteredRooms = computed(() => {
    let results = this.allRooms();
    const dest = this.destino().toLowerCase().trim();
    if (dest) {
      results = results.filter(r => r.name.toLowerCase().includes(dest) || r.room_type.toLowerCase().includes(dest) || (r.amenities ?? '').toLowerCase().includes(dest));
    }
    const cap = this.huespedes();
    if (cap > 1) {
      results = results.filter(r => r.capacity >= cap);
    }
    return results;
  });

  hasFilters = computed(() => !!this.destino().trim() || this.huespedes() > 1 || !!this.checkIn() || !!this.checkOut());

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    if (params.get('destino')) this.destino.set(params.get('destino')!);
    if (params.get('checkIn')) this.checkIn.set(params.get('checkIn')!);
    if (params.get('checkOut')) this.checkOut.set(params.get('checkOut')!);
    if (params.get('huespedes')) this.huespedes.set(Number(params.get('huespedes')));
    this.loadRooms();
  }

  loadRooms() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.roomsService.list().subscribe({
      next: (rooms) => { this.allRooms.set(rooms); this.isLoading.set(false); },
      error: () => {
        // Fallback: si el API falla o no tiene permisos, mostrar habitaciones de ejemplo
        this.allRooms.set(FALLBACK_ROOMS);
        this.isLoading.set(false);
      },
    });
  }

  getImage(index: number): string {
    return IMAGES[index % IMAGES.length];
  }

  clearFilters() {
    this.destino.set('');
    this.checkIn.set('');
    this.checkOut.set('');
    this.huespedes.set(1);
  }

  goToCheckout(room: Room) {
    this.router.navigate(['/checkout'], {
      queryParams: { roomId: room.id, roomName: room.name, roomType: room.room_type, price: room.price, capacity: room.capacity },
    });
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
