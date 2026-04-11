import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UserProfile } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly usersUrl = `${environment.apiUrl}/users/api/v1/users`;
  private readonly authUrl = `${environment.apiUrl}/login-handler/api/v1/auth`;
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private _token = signal<string | null>(localStorage.getItem('access_token'));
  private _profile = signal<UserProfile | null>(
    JSON.parse(localStorage.getItem('user_profile') ?? 'null')
  );

  readonly isAuthenticated = computed(() => !!this._token());
  readonly currentUser = computed(() => this._profile());
  readonly userType = computed(() => this._profile()?.role ?? null);

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.usersUrl}/register`, data, {
      headers: this.headers,
    });
  }

  login(data: LoginRequest): Observable<UserProfile> {
    return this.http
      .post<LoginResponse>(`${this.authUrl}/login`, data, { headers: this.headers })
      .pipe(
        tap((res) => {
          localStorage.setItem('access_token', res.access_token);
          if (res.refresh_token) localStorage.setItem('refresh_token', res.refresh_token);
          this._token.set(res.access_token);
        }),
        switchMap(() => this.fetchProfile())
      );
  }

  fetchProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.authUrl}/me`).pipe(
      tap((profile) => {
        localStorage.setItem('user_profile', JSON.stringify(profile));
        this._profile.set(profile);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
    this._token.set(null);
    this._profile.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }
}
