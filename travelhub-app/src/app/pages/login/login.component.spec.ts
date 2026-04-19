import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty email and password', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('should not be loading initially', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('should have no error message initially', () => {
    expect(component.errorMessage()).toBe('');
  });

  it('should render login form', () => {
    const el = fixture.nativeElement;
    expect(el.querySelector('input[id="email"]')).toBeTruthy();
    expect(el.querySelector('input[id="password"]')).toBeTruthy();
    expect(el.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should set loading on login', () => {
    component.email = 'test@test.com';
    component.password = 'pass123';
    component.onLogin();
    expect(component.isLoading()).toBe(true);
  });

  it('should handle login error', () => {
    component.email = 'test@test.com';
    component.password = 'wrong';
    component.onLogin();
    httpMock.expectOne(r => r.url.includes('/login')).error(new ProgressEvent('error'));
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBeTruthy();
  });

  it('should navigate to register', () => {
    component.goToRegister();
    expect(router.navigate).toHaveBeenCalledWith(['/register']);
  });

  it('should render register link', () => {
    expect(fixture.nativeElement.querySelector('.link-btn')).toBeTruthy();
  });

  it('should show error message when set', () => {
    component.errorMessage.set('Test error');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.alert-error')).toBeTruthy();
  });
});
