import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  hotelId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.hotelId = this.route.snapshot.queryParamMap.get('hotelId');
  }

  goToStep2() {
    this.router.navigate(['/checkout/step2'], { queryParams: { hotelId: this.hotelId } });
  }

  goBack() {
    this.router.navigate(['/search']);
  }
}
