import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-rooms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manage-rooms.component.html',
  styleUrls: ['./manage-rooms.component.css'],
})
export class ManageRoomsComponent {
  private router = inject(Router);

  galleryItems = [
    {
      name: 'suite-ocean-view-1.jpg',
      size: '2.40 MB',
      format: 'jpg',
      cdn: '145ms',
      type: 'image',
      principal: true,
    },
    {
      name: 'suite-ocean-view-2.jpg',
      size: '3.10 MB',
      format: 'jpg',
      cdn: '178ms',
      type: 'image',
      principal: false,
    },
    {
      name: 'suite-bathroom.jpg',
      size: '1.80 MB',
      format: 'jpg',
      cdn: '162ms',
      type: 'image',
      principal: false,
    },
    {
      name: 'suite-tour-video.mp4',
      size: '5.60 MB',
      format: 'mp4',
      cdn: '234ms',
      type: 'video',
      principal: false,
    },
  ];

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
