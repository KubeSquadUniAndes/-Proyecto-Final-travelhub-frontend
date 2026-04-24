import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RoomsService, Room } from '../../services/rooms.service';

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
      error: () => { this.hasError.set(true); this.isLoading.set(false); },
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
      queryParams: { roomId: room.id, hotelId: room.hotel_id, roomName: room.name, roomType: room.room_type, price: room.price, capacity: room.capacity },
    });
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
