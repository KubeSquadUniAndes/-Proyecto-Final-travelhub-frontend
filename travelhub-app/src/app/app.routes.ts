import { Routes } from '@angular/router';
import { guestGuard, travelerGuard, hotelAdminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Public
  { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent), canActivate: [guestGuard] },

  // Traveler
  { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent), canActivate: [travelerGuard] },
  { path: 'search', loadComponent: () => import('./pages/search/search.component').then(m => m.SearchComponent), canActivate: [travelerGuard] },
  { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent), canActivate: [travelerGuard] },
  { path: 'checkout/step2', loadComponent: () => import('./pages/checkout-step2/checkout-step2.component').then(m => m.CheckoutStep2Component), canActivate: [travelerGuard] },
  { path: 'booking-confirmed', loadComponent: () => import('./pages/booking-confirmed/booking-confirmed.component').then(m => m.BookingConfirmedComponent), canActivate: [travelerGuard] },
  { path: 'print-booking', loadComponent: () => import('./pages/print-booking/print-booking.component').then(m => m.PrintBookingComponent), canActivate: [travelerGuard] },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [travelerGuard] },

  // Hotel Admin
  { path: 'hotel-home', loadComponent: () => import('./pages/hotel-home/hotel-home.component').then(m => m.HotelHomeComponent), canActivate: [hotelAdminGuard] },
  { path: 'hotel-dashboard', loadComponent: () => import('./pages/hotel-dashboard/hotel-dashboard.component').then(m => m.HotelDashboardComponent), canActivate: [hotelAdminGuard] },
  { path: 'manage-rooms', loadComponent: () => import('./pages/manage-rooms/manage-rooms.component').then(m => m.ManageRoomsComponent), canActivate: [hotelAdminGuard] },
  { path: 'booking-requests', loadComponent: () => import('./pages/booking-requests/booking-requests.component').then(m => m.BookingRequestsComponent), canActivate: [hotelAdminGuard] },
  { path: 'cancel-booking', loadComponent: () => import('./pages/cancel-booking/cancel-booking.component').then(m => m.CancelBookingComponent), canActivate: [hotelAdminGuard] },
];
