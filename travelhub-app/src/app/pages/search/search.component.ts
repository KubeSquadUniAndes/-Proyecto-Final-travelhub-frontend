import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  hotels = [
    { id: 1, name: 'Grand Seaside Resort', location: 'Cartagena, Colombia', price: 450000, rating: 4.8, reviews: 342, image: '' },
    { id: 2, name: 'Metropolitan Plaza Hotel', location: 'Bogotá, Colombia', price: 320000, rating: 4.6, reviews: 528, image: '' },
    { id: 3, name: 'Villa Boutique Colonial', location: 'Villa de Leyva, Colombia', price: 280000, rating: 4.9, reviews: 187, image: '' },
  ];

  filters = {
    wifi: false, piscina: false, spa: false, gimnasio: false, estacionamiento: false, restaurante: false
  };

  constructor(private router: Router) {}

  navigate(path: string) { this.router.navigate([path]); }

  goToCheckout(hotelId: number) {
    this.router.navigate(['/checkout'], { queryParams: { hotelId } });
  }
}
