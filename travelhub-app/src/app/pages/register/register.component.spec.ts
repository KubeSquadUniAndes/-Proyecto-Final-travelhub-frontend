import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form with required fields', () => {
    expect(component.form.get('first_name')).toBeTruthy();
    expect(component.form.get('email')).toBeTruthy();
    expect(component.form.get('password')).toBeTruthy();
    expect(component.form.get('user_type')).toBeTruthy();
  });

  it('should be invalid when empty', () => {
    expect(component.form.valid).toBe(false);
  });

  it('should not be loading initially', () => {
    expect(component.isLoading()).toBe(false);
  });

  it('should render register form', () => {
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should not submit if form is invalid', () => {
    component.onSubmit();
    expect(component.isLoading()).toBe(false);
  });

  it('should navigate to login', () => {
    component.goToLogin();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should detect field errors', () => {
    component.form.get('email')?.markAsTouched();
    expect(component.hasError('email', 'required')).toBe(true);
  });

  it('should return field control', () => {
    expect(component.field('email')).toBeTruthy();
    expect(component.field('nonexistent')).toBeNull();
  });

  it('should submit valid form', () => {
    component.form.patchValue({
      first_name: 'Juan', last_name: 'Perez', email: 'j@test.com',
      phone: '+57300123', country: 'Colombia', city: 'Bogota',
      birth_date: '1995-01-01', identification_type: 'CC',
      identification_number: '123456', user_type: 'traveler',
      password: 'Pass1234!', confirmPassword: 'Pass1234!',
    });
    component.onSubmit();
    expect(component.isLoading()).toBe(true);
    httpMock.expectOne(r => r.url.includes('/register')).flush({ message: 'created' });
    expect(component.successMessage()).toBeTruthy();
  });

  it('should handle register error', () => {
    component.form.patchValue({
      first_name: 'Juan', last_name: 'Perez', email: 'j@test.com',
      phone: '+57300123', country: 'Colombia', city: 'Bogota',
      birth_date: '1995-01-01', identification_type: 'CC',
      identification_number: '123456', user_type: 'traveler',
      password: 'Pass1234!', confirmPassword: 'Pass1234!',
    });
    component.onSubmit();
    httpMock.expectOne(r => r.url.includes('/register')).error(new ProgressEvent('error'));
    expect(component.isLoading()).toBe(false);
    expect(component.errorMessage()).toBeTruthy();
  });

  it('should show error message when set', () => {
    component.errorMessage.set('Test error');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.alert-error')).toBeTruthy();
  });

  it('should show success message when set', () => {
    component.successMessage.set('Success');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.alert-success')).toBeTruthy();
  });

  it('should detect password mismatch', () => {
    component.form.patchValue({ password: 'Pass1234!', confirmPassword: 'Different!' });
    component.form.get('confirmPassword')?.markAsTouched();
    expect(component.form.hasError('passwordsMismatch')).toBe(true);
  });
});
