import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  readonly userType = this.authService.userType;

  destino = '';
  checkIn = '';
  checkOut = '';
  huespedes = 1;

  hospedajes = [
    { id: 1, name: 'Grand Seaside Resort', location: 'Cartagena, Colombia', price: 450000, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', rating: 4.8 },
    { id: 2, name: 'Metropolitan Plaza Hotel', location: 'Bogotá, Colombia', price: 320000, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', rating: 4.6 },
    { id: 3, name: 'Villa Boutique Colonial', location: 'Villa de Leyva, Colombia', price: 280000, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', rating: 4.9 },
    { id: 4, name: 'Eco Lodge Tayrona', location: 'Santa Marta, Colombia', price: 380000, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', rating: 4.7 },
    { id: 5, name: 'Hotel Dann Carlton', location: 'Medellín, Colombia', price: 290000, image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400', rating: 4.5 },
    { id: 6, name: 'Sofitel Legend Santa Clara', location: 'Cartagena, Colombia', price: 620000, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400', rating: 4.9 },
    { id: 7, name: 'Hotel Las Américas', location: 'Cartagena, Colombia', price: 410000, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', rating: 4.4 },
    { id: 8, name: 'Decameron Isla Palma', location: 'Isla Barú, Colombia', price: 350000, image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400', rating: 4.3 },
    { id: 9, name: 'Hotel Estelar Playa Manzanillo', location: 'Cartagena, Colombia', price: 480000, image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400', rating: 4.6 },
    { id: 10, name: 'Selina Medellín', location: 'Medellín, Colombia', price: 180000, image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400', rating: 4.2 },
    { id: 11, name: 'Hotel Boutique Casa del Arzobispado', location: 'Cartagena, Colombia', price: 520000, image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400', rating: 4.8 },
    { id: 12, name: 'Punta Faro Lodge', location: 'San Andrés, Colombia', price: 390000, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400', rating: 4.5 },
  ];

  search() {
    this.router.navigate(['/search'], {
      queryParams: { destino: this.destino, checkIn: this.checkIn, checkOut: this.checkOut, huespedes: this.huespedes },
    });
  }

  goToCheckout(hotelId: number) {
    this.router.navigate(['/checkout'], { queryParams: { hotelId } });
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.authService.logout();
  }
}
