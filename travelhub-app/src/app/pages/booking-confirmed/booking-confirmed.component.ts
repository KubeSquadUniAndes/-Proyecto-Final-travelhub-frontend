import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking-confirmed',
  standalone: true,
  templateUrl: './booking-confirmed.component.html',
  styleUrls: ['./booking-confirmed.component.css']
})
export class BookingConfirmedComponent {
  constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/home']);
  }

  printBooking() {
    this.router.navigate(['/print-booking']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
