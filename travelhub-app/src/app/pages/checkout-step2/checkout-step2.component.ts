import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout-step2',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
