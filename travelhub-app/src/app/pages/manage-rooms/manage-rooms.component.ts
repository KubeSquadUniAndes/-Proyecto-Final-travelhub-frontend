import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RoomsService, Room } from '../../services/rooms.service';

@Component({
  selector: 'app-manage-rooms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-rooms.component.html',
  styleUrls: ['./manage-rooms.component.css'],
})
export class ManageRoomsComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private roomsService = inject(RoomsService);

  rooms = signal<Room[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  showForm = signal(false);
  editingRoom = signal<Room | null>(null);
  showDeleteConfirm = signal(false);
  deletingRoom = signal<Room | null>(null);

  form = { name: '', room_type: 'individual', price: '', capacity: 2, beds: '', size: 0, amenities: '' };

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.roomsService.list().subscribe({
      next: (rooms) => { this.rooms.set(rooms); this.isLoading.set(false); },
      error: () => { this.hasError.set(true); this.isLoading.set(false); },
    });
  }

  openCreateForm() {
    this.form = { name: '', room_type: 'individual', price: '', capacity: 2, beds: '', size: 0, amenities: '' };
    this.editingRoom.set(null);
    this.showForm.set(true);
  }

  openEditForm(room: Room) {
    this.form = { name: room.name, room_type: room.room_type, price: room.price, capacity: room.capacity, beds: room.beds, size: room.size, amenities: room.amenities };
    this.editingRoom.set(room);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingRoom.set(null);
  }

  saveRoom() {
    const editing = this.editingRoom();
    if (editing) {
      this.roomsService.update(editing.id, this.form).subscribe({
        next: () => { this.closeForm(); this.loadRooms(); this.showToast('Habitación actualizada.', 'success'); },
        error: () => this.showToast('Error al actualizar.', 'error'),
      });
    } else {
      this.roomsService.create(this.form).subscribe({
        next: () => { this.closeForm(); this.loadRooms(); this.showToast('Habitación creada.', 'success'); },
        error: () => this.showToast('Error al crear.', 'error'),
      });
    }
  }

  confirmDelete(room: Room) {
    this.deletingRoom.set(room);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete() {
    this.showDeleteConfirm.set(false);
    this.deletingRoom.set(null);
  }

  deleteRoom() {
    const room = this.deletingRoom();
    if (!room) return;
    this.roomsService.delete(room.id).subscribe({
      next: () => { this.cancelDelete(); this.loadRooms(); this.showToast('Habitación eliminada.', 'success'); },
      error: () => this.showToast('Error al eliminar.', 'error'),
    });
  }

  private showToast(message: string, type: 'success' | 'error') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    setTimeout(() => this.toastMessage.set(''), 4000);
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
