import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent {
  nombre = ''; apellido = ''; email = ''; telefono = ''; direccion = '';

  constructor(private router: Router) {}
  navigate(path: string) { this.router.navigate([path]); }
  goToStep2() { this.router.navigate(['/checkout/step2']); }
}
