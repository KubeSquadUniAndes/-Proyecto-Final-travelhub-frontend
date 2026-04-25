import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RoomsService, Room } from '../../services/rooms.service';
import { ImagesService } from '../../services/images.service';

const FALLBACK = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';

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
  private imagesService = inject(ImagesService);

  allRooms = signal<Room[]>([]);
  roomImagesMap = signal<Record<string, string>>({});
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
      results = results.filter(r =>
        (r.destination ?? '').toLowerCase().includes(dest) ||
        (r.hotel_name ?? '').toLowerCase().includes(dest) ||
        r.name.toLowerCase().includes(dest) ||
        r.room_type.toLowerCase().includes(dest)
      );
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
      next: (rooms) => {
        this.allRooms.set(rooms);
        this.isLoading.set(false);
        rooms.forEach(room => {
          this.imagesService.listByRoom(room.id).subscribe({
            next: (imgs) => {
              if (imgs.length) this.roomImagesMap.set({ ...this.roomImagesMap(), [room.id]: imgs[0].url });
            },
            error: () => {},
          });
        });
      },
      error: () => { this.hasError.set(true); this.isLoading.set(false); },
    });
  }

  getRoomImage(roomId: string): string {
    return this.roomImagesMap()[roomId] || FALLBACK;
  }

  getRoomPrice(room: Room): number {
    return Number(room.price) || 0;
  }

  clearFilters() {
    this.destino.set('');
    this.checkIn.set('');
    this.checkOut.set('');
    this.huespedes.set(1);
  }

  goToCheckout(room: Room) {
    this.router.navigate(['/checkout'], {
      queryParams: { roomId: room.id, hotelId: room.hotel_id, roomName: room.name, roomType: room.room_type, price: this.getRoomPrice(room), capacity: room.capacity },
    });
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
