import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SearchComponent } from './pages/search/search.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { CheckoutStep2Component } from './pages/checkout-step2/checkout-step2.component';
import { BookingConfirmedComponent } from './pages/booking-confirmed/booking-confirmed.component';
import { PrintBookingComponent } from './pages/print-booking/print-booking.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'checkout/step2', component: CheckoutStep2Component },
  { path: 'booking-confirmed', component: BookingConfirmedComponent },
  { path: 'print-booking', component: PrintBookingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
