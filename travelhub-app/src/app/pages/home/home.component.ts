import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  search() {
    this.router.navigate(['/search']);
  }

  logout() {
    this.authService.logout();
  }
}
