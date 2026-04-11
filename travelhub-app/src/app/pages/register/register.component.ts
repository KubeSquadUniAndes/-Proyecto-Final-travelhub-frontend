import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.models';
import { parseApiError } from '../../utils/error-messages';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordsMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  form = this.fb.group({
    first_name: ['', [Validators.required, Validators.minLength(1)]],
    last_name: ['', [Validators.required, Validators.minLength(1)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    country: ['', Validators.required],
    city: ['', Validators.required],
    birth_date: ['', Validators.required],
    identification_type: ['CC', Validators.required],
    identification_number: ['', Validators.required],
    user_type: ['traveler', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  field(name: string) {
    return this.form.get(name);
  }

  hasError(name: string, error: string) {
    const f = this.field(name);
    return f?.invalid && f?.touched && f?.hasError(error);
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.errorMessage.set('');
    this.isLoading.set(true);

    const v = this.form.value;
    const payload: RegisterRequest = {
      first_name: v.first_name!,
      last_name: v.last_name!,
      email: v.email!,
      phone: v.phone!,
      country: v.country!,
      city: v.city!,
      birth_date: v.birth_date!,
      password: v.password!,
      user_type: v.user_type as 'traveler' | 'hotel',
      identification_type: v.identification_type!,
      identification_number: v.identification_number!,
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.successMessage.set('Cuenta creada exitosamente. Redirigiendo...');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.errorMessage.set(parseApiError(err, 'Error al registrar. Intenta de nuevo.'));
        this.isLoading.set(false);
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
