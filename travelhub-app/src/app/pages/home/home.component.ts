import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  readonly userType = this.authService.userType;

  hospedajes = signal<Room[]>([]);
  isLoading = signal(true);

  destino = '';
  checkIn = '';
  checkOut = '';
  huespedes = 1;

  ngOnInit() {
    this.roomsService.list().subscribe({
      next: (rooms) => { this.hospedajes.set(rooms); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); },
    });
  }

  getImage(index: number): string {
    return IMAGES[index % IMAGES.length];
  }

  search() {
    this.router.navigate(['/search'], {
      queryParams: { destino: this.destino, checkIn: this.checkIn, checkOut: this.checkOut, huespedes: this.huespedes },
    });
  }

  goToCheckout(room: Room) {
    this.router.navigate(['/checkout'], {
      queryParams: { roomId: room.id, hotelId: room.hotel_id, roomName: room.name, roomType: room.room_type, price: room.price, capacity: room.capacity },
    });
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
