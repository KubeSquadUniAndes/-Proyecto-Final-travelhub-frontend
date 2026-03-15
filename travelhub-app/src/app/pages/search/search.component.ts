import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  hotels = [
    { id: 1, name: 'Hotel Paradise', price: 150, rating: 4.5 },
    { id: 2, name: 'Beach Resort', price: 200, rating: 4.8 },
    { id: 3, name: 'City Center Hotel', price: 120, rating: 4.2 }
  ];

  constructor(private router: Router) {}

  goToCheckout(hotelId: number) {
    this.router.navigate(['/checkout'], { queryParams: { hotelId } });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
