import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RoomsService, Room } from '../../services/rooms.service';
import { ImagesService } from '../../services/images.service';

const FALLBACK = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private roomsService = inject(RoomsService);
  private imagesService = inject(ImagesService);

  readonly userType = this.authService.userType;

  hospedajes = signal<Room[]>([]);
  roomImagesMap = signal<Record<string, string>>({});
  isLoading = signal(true);

  destino = '';
  checkIn = '';
  checkOut = '';
  huespedes = 1;

  ngOnInit() {
    this.roomsService.list().subscribe({
      next: (rooms) => {
        this.hospedajes.set(rooms);
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
      error: () => { this.isLoading.set(false); },
    });
  }

  getRoomImage(roomId: string): string {
    return this.roomImagesMap()[roomId] || FALLBACK;
  }

  getRoomPrice(room: Room): number {
    return Number(room.price) || 0;
  }

  search() {
    this.router.navigate(['/search'], {
      queryParams: { destino: this.destino, checkIn: this.checkIn, checkOut: this.checkOut, huespedes: this.huespedes },
    });
  }

  goToCheckout(room: Room) {
    this.router.navigate(['/checkout'], {
      queryParams: { roomId: room.id, hotelId: room.hotel_id, roomName: room.name, roomType: room.room_type, price: this.getRoomPrice(room), capacity: room.capacity },
    });
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
