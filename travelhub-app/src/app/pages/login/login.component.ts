import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { parseApiError } from '../../utils/error-messages';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  email = '';
  password = '';

  isLoading = signal(false);
  errorMessage = signal('');

  onLogin() {
    this.errorMessage.set('');
    this.isLoading.set(true);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (profile) => {
        this.router.navigate([profile.role === 'hotel' ? '/hotel-home' : '/home']);
      },
      error: (err) => {
        this.errorMessage.set(parseApiError(err, 'Credenciales incorrectas. Intenta de nuevo.'));
        this.isLoading.set(false);
      },
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
