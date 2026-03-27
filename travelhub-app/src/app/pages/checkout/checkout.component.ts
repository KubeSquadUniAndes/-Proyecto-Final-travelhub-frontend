import { Component, OnInit, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  hotelId: string | null = null;

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
