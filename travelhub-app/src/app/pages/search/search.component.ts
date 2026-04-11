import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  readonly userType = this.authService.userType;

  searchQuery = '';

  hotels = [
    { id: 1, name: 'Hotel Paradise', price: 150, rating: 4.5 },
    { id: 2, name: 'Beach Resort', price: 200, rating: 4.8 },
    { id: 3, name: 'City Center Hotel', price: 120, rating: 4.2 },
  ];

  get filteredHotels() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.hotels;
    return this.hotels.filter(h => h.name.toLowerCase().includes(q));
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
