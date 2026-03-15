import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-step2',
  standalone: true,
  templateUrl: './checkout-step2.component.html',
  styleUrls: ['./checkout-step2.component.css']
})
export class CheckoutStep2Component {
  constructor(private router: Router) {}

  confirmBooking() {
    this.router.navigate(['/booking-confirmed']);
  }

  goBack() {
    this.router.navigate(['/checkout']);
  }
}
