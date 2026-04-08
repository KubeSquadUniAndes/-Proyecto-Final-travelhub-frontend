import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { AuthService } from './auth.service';

@Component({ template: '', standalone: true })
class DummyComponent {}

const testRoutes = [
  { path: 'login', component: DummyComponent },
  { path: 'home', component: DummyComponent },
];

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(testRoutes),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('se crea correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthenticated es false sin token', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('getToken retorna null sin token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('login guarda el token y actualiza isAuthenticated', () => {
    service.login({ email: 'test@test.com', password: '12345678' }).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/login'));
    req.flush({ access_token: 'fake-token', token_type: 'bearer' });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.getToken()).toBe('fake-token');
    expect(localStorage.getItem('access_token')).toBe('fake-token');
  });

  it('register llama al endpoint correcto', () => {
    const payload = {
      first_name: 'Juan', last_name: 'Pérez', email: 'juan@test.com',
      phone: '+57300', country: 'Colombia', city: 'Bogotá',
      birth_date: '1995-01-01', password: 'Pass1234!',
      user_type: 'traveler' as const, identification_type: 'CC',
      identification_number: '123456',
    };

    service.register(payload).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/register'));
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'created' });
  });

  it('logout limpia el localStorage y resetea signals', () => {
    localStorage.setItem('access_token', 'fake-token');

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.getToken()).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  afterEach(() => {
    httpMock.verify();
  });
});
