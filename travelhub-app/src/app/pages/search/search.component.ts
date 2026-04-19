import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

export interface Hospedaje {
  id: number;
  name: string;
  location: string;
  price: number;
  capacity: number;
  image: string;
  rating: number;
}

const HOSPEDAJES: Hospedaje[] = [
  { id: 1, name: 'Grand Seaside Resort', location: 'Cartagena', price: 450000, capacity: 4, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400', rating: 4.8 },
  { id: 2, name: 'Metropolitan Plaza Hotel', location: 'Bogotá', price: 320000, capacity: 2, image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400', rating: 4.6 },
  { id: 3, name: 'Villa Boutique Colonial', location: 'Villa de Leyva', price: 280000, capacity: 3, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400', rating: 4.9 },
  { id: 4, name: 'Eco Lodge Tayrona', location: 'Santa Marta', price: 380000, capacity: 2, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400', rating: 4.7 },
  { id: 5, name: 'Hotel Dann Carlton', location: 'Medellín', price: 290000, capacity: 3, image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400', rating: 4.5 },
  { id: 6, name: 'Sofitel Legend Santa Clara', location: 'Cartagena', price: 620000, capacity: 2, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400', rating: 4.9 },
  { id: 7, name: 'Hotel Las Américas', location: 'Cartagena', price: 410000, capacity: 5, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', rating: 4.4 },
  { id: 8, name: 'Decameron Isla Palma', location: 'Isla Barú', price: 350000, capacity: 4, image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400', rating: 4.3 },
  { id: 9, name: 'Hotel Estelar Playa Manzanillo', location: 'Cartagena', price: 480000, capacity: 3, image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400', rating: 4.6 },
  { id: 10, name: 'Selina Medellín', location: 'Medellín', price: 180000, capacity: 6, image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=400', rating: 4.2 },
  { id: 11, name: 'Hotel Boutique Casa del Arzobispado', location: 'Cartagena', price: 520000, capacity: 2, image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400', rating: 4.8 },
  { id: 12, name: 'Punta Faro Lodge', location: 'San Andrés', price: 390000, capacity: 4, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400', rating: 4.5 },
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

  destino = signal('');
  checkIn = signal('');
  checkOut = signal('');
  huespedes = signal(1);

  filteredHospedajes = computed(() => {
    let results = HOSPEDAJES;
    const dest = this.destino().toLowerCase().trim();
    if (dest) {
      results = results.filter(h => h.location.toLowerCase().includes(dest) || h.name.toLowerCase().includes(dest));
    }
    const cap = this.huespedes();
    if (cap > 1) {
      results = results.filter(h => h.capacity >= cap);
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
  }

  clearFilters() {
    this.destino.set('');
    this.checkIn.set('');
    this.checkOut.set('');
    this.huespedes.set(1);
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
