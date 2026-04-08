import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  private router = inject(Router);

  hotels = [
    { id: 1, name: 'Hotel Paradise', price: 150, rating: 4.5 },
    { id: 2, name: 'Beach Resort', price: 200, rating: 4.8 },
    { id: 3, name: 'City Center Hotel', price: 120, rating: 4.2 },
  ];

  goToCheckout(hotelId: number) {
    this.router.navigate(['/checkout'], { queryParams: { hotelId } });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
