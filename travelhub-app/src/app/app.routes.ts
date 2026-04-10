import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent), canActivate: [guestGuard] },
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent), canActivate: [authGuard] },
  { path: 'search', loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent), canActivate: [authGuard] },
  { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent), canActivate: [authGuard] },
  { path: 'checkout/step2', loadComponent: () => import('./pages/checkout-step2/checkout-step2.component').then(m => m.CheckoutStep2Component), canActivate: [authGuard] },
  { path: 'booking-confirmed', loadComponent: () => import('./pages/booking-confirmed/booking-confirmed.component').then(m => m.BookingConfirmedComponent), canActivate: [authGuard] },
  { path: 'print-booking', loadComponent: () => import('./pages/print-booking/print-booking.component').then(m => m.PrintBookingComponent), canActivate: [authGuard] },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'manage-rooms', loadComponent: () => import('./pages/manage-rooms/manage-rooms.component').then(m => m.ManageRoomsComponent), canActivate: [authGuard] },
  { path: 'booking-requests', loadComponent: () => import('./pages/booking-requests/booking-requests.component').then(m => m.BookingRequestsComponent), canActivate: [authGuard] },
  { path: 'cancel-booking', loadComponent: () => import('./pages/cancel-booking/cancel-booking.component').then(m => m.CancelBookingComponent), canActivate: [authGuard] },
  { path: 'hotel-home', loadComponent: () => import('./pages/hotel-home/hotel-home.component').then(m => m.HotelHomeComponent), canActivate: [authGuard] },
  { path: 'hotel-dashboard', loadComponent: () => import('./pages/hotel-dashboard/hotel-dashboard.component').then(m => m.HotelDashboardComponent), canActivate: [authGuard] },
];
