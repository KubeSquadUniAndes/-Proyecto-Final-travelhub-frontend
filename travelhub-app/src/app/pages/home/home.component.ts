import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  private router = inject(Router);

  goToSearch() {
    this.router.navigate(['/search']);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
