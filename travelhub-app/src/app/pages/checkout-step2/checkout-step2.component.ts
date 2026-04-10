import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-step2',
  standalone: true,
  templateUrl: './checkout-step2.component.html',
  styleUrls: ['./checkout-step2.component.css'],
})
export class CheckoutStep2Component {
  private router = inject(Router);

  confirmBooking() {
    this.router.navigate(['/booking-confirmed']);
  }

  goBack() {
    this.router.navigate(['/checkout']);
  }
}
