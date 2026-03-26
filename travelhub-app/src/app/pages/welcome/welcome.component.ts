import { Component, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  isMobile = signal(false);

  constructor(private router: Router) {}

  ngOnInit() {
    this.isMobile.set(window.innerWidth <= 768);
    window.addEventListener('resize', () => {
      this.isMobile.set(window.innerWidth <= 768);
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegisterHotel() {
    this.router.navigate(['/register'], { queryParams: { type: 'hotel' } });
  }

  goToRegisterTraveler() {
    this.router.navigate(['/register'], { queryParams: { type: 'traveler' } });
  }
}
