import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly usersUrl = `${environment.apiUrl}/users/api/v1/users`;
  private readonly authUrl = `${environment.apiUrl}/auth/api/v1/auth`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  // Signals de estado
  private _token = signal<string | null>(localStorage.getItem('access_token'));
  private _user = signal<LoginResponse['user'] | null>(
    JSON.parse(localStorage.getItem('user') ?? 'null')
  );

  readonly isAuthenticated = computed(() => !!this._token());
  readonly currentUser = computed(() => this._user());

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.usersUrl}/register`, data, {
      headers: this.headers,
    });
  }

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.authUrl}/login`, data, { headers: this.headers })
      .pipe(
        tap((res) => {
          localStorage.setItem('access_token', res.access_token);
          if (res.refresh_token) localStorage.setItem('refresh_token', res.refresh_token);
          if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
          this._token.set(res.access_token);
          this._user.set(res.user ?? null);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this._token.set(null);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }
}
