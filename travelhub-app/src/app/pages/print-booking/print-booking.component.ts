import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-print-booking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './print-booking.component.html',
  styleUrls: ['./print-booking.component.css']
})
export class PrintBookingComponent {
  constructor(private router: Router) {}
  navigate(path: string) { this.router.navigate([path]); }
  print() { window.print(); }
}
