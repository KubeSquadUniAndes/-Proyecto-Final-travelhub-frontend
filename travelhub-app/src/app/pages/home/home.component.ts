import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  destino = '';
  checkIn = '';
  checkOut = '';
  huespedes = 1;

  constructor(private router: Router) {}

  search() {
    this.router.navigate(['/search'], { queryParams: { destino: this.destino, checkIn: this.checkIn, checkOut: this.checkOut, huespedes: this.huespedes } });
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
