import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { CheckoutStep2Component } from './pages/checkout-step2/checkout-step2.component';
import { BookingConfirmedComponent } from './pages/booking-confirmed/booking-confirmed.component';
import { PrintBookingComponent } from './pages/print-booking/print-booking.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RegisterComponent } from './pages/register/register.component';
import { ManageRoomsComponent } from './pages/manage-rooms/manage-rooms.component';
import { BookingRequestsComponent } from './pages/booking-requests/booking-requests.component';
import { CancelBookingComponent } from './pages/cancel-booking/cancel-booking.component';
import { HotelDashboardComponent } from './pages/hotel-dashboard/hotel-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'checkout/step2', component: CheckoutStep2Component },
  { path: 'booking-confirmed', component: BookingConfirmedComponent },
  { path: 'print-booking', component: PrintBookingComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'manage-rooms', component: ManageRoomsComponent },
  { path: 'booking-requests', component: BookingRequestsComponent },
  { path: 'cancel-booking', component: CancelBookingComponent },
  { path: 'hotel-dashboard', component: HotelDashboardComponent }
];
