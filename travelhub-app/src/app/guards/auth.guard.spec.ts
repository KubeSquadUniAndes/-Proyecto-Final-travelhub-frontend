import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { Component } from '@angular/core';

@Component({ template: '', standalone: true })
class DummyComponent {}

const testRoutes = [
  { path: 'login', component: DummyComponent },
  { path: 'home', component: DummyComponent },
];

describe('authGuard', () => {
  let router: Router;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(testRoutes),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
  });

  it('bloquea acceso si no está autenticado', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBe(false);
  });

  it('permite acceso si está autenticado', () => {
    localStorage.setItem('access_token', 'fake-token');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(testRoutes),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });
});

describe('guestGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(testRoutes),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });
  });

  it('permite acceso si NO está autenticado', () => {
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBe(true);
  });

  it('bloquea acceso si ya está autenticado', () => {
    localStorage.setItem('access_token', 'fake-token');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideRouter(testRoutes),
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot)
    );
    expect(result).toBe(false);
  });
});
