import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RoomsService, Room } from '../../services/rooms.service';
import { ImagesService, RoomImage } from '../../services/images.service';
import { RatesService, Rate } from '../../services/rates.service';

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
  private imagesService = inject(ImagesService);
  private ratesService = inject(RatesService);

  rooms = signal<Room[]>([]);
  roomImagesMap = signal<Record<string, RoomImage[]>>({});
  isLoading = signal(true);
  hasError = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  showForm = signal(false);
  editingRoom = signal<Room | null>(null);
  showDeleteConfirm = signal(false);
  deletingRoom = signal<Room | null>(null);

  // Images helper
  getRoomImage(roomId: string): string {
    const imgs = this.roomImagesMap()[roomId];
    return imgs?.length ? imgs[0].url : "";
  }

  showImageModal = signal(false);
  imageRoom = signal<Room | null>(null);
  roomImages = signal<RoomImage[]>([]);

  // Rates
  showRateModal = signal(false);
  rates = signal<Rate[]>([]);
  rateForm = { room_type: 'individual', season: 'base', base_price: 0 };

  form = { name: '', destination: '', room_type: 'individual', price: '', capacity: 2, beds: '', size: 0, amenities: '' };

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.isLoading.set(true);
    this.hasError.set(false);
    const hotelId = this.authService.currentUser()?.id ?? '';
    this.roomsService.list().subscribe({
      next: (allRooms) => {
        const rooms = hotelId ? allRooms.filter(r => r.hotel_id === hotelId) : allRooms;
        this.rooms.set(rooms);
        this.isLoading.set(false);
        rooms.forEach(room => {
          this.imagesService.listByRoom(room.id).subscribe({
            next: (imgs) => this.roomImagesMap.set({ ...this.roomImagesMap(), [room.id]: imgs }),
            error: () => {},
          });
        });
      },
      error: () => { this.hasError.set(true); this.isLoading.set(false); },
    });
  }

  openCreateForm() {
    this.form = { name: '', destination: '', room_type: 'individual', price: '', capacity: 2, beds: '', size: 0, amenities: '' };
    this.editingRoom.set(null);
    this.showForm.set(true);
  }

  openEditForm(room: Room) {
    this.form = { name: room.name, destination: room.destination ?? '', room_type: room.room_type, price: room.price, capacity: room.capacity, beds: room.beds, size: room.size, amenities: room.amenities };
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
        next: (newRoom) => { this.closeForm(); this.loadRooms(); this.showToast('Habitación creada. Ahora sube las fotos.', 'success'); this.openImages(newRoom); },
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

  // Images
  openImages(room: Room) {
    this.imageRoom.set(room);
    this.showImageModal.set(true);
    this.imagesService.listByRoom(room.id).subscribe({
      next: (imgs) => this.roomImages.set(imgs),
      error: () => this.roomImages.set([]),
    });
  }

  closeImages() { this.showImageModal.set(false); this.imageRoom.set(null); this.roomImages.set([]); }

  uploadImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    const room = this.imageRoom();
    if (!file || !room) return;
    this.imagesService.upload(room.id, file).subscribe({
      next: () => { this.imagesService.listByRoom(room.id).subscribe(imgs => this.roomImages.set(imgs)); this.showToast('Imagen subida.', 'success'); },
      error: () => this.showToast('Error al subir imagen.', 'error'),
    });
  }

  deleteImage(imageId: string) {
    const room = this.imageRoom();
    if (!room) return;
    this.imagesService.delete(imageId).subscribe({
      next: () => { this.imagesService.listByRoom(room.id).subscribe(imgs => this.roomImages.set(imgs)); this.showToast('Imagen eliminada.', 'success'); },
      error: () => this.showToast('Error al eliminar imagen.', 'error'),
    });
  }

  // Rates
  openRates() {
    this.showRateModal.set(true);
    this.ratesService.list().subscribe({
      next: (r) => this.rates.set(r),
      error: () => this.rates.set([]),
    });
  }

  closeRates() { this.showRateModal.set(false); }

  createRate() {
    const { room_type, base_price } = this.rateForm;
    this.ratesService.create(this.rateForm).subscribe({
      next: () => {
        this.ratesService.list().subscribe(r => this.rates.set(r));
        const matching = this.rooms().filter(r => r.room_type === room_type);
        let updated = 0;
        matching.forEach(room => {
          this.roomsService.update(room.id, { price: String(base_price) }).subscribe({
            next: () => { updated++; if (updated === matching.length) this.loadRooms(); },
            error: () => {},
          });
        });
        const count = matching.length;
        this.showToast(`Tarifa creada. ${count} habitación(es) ${room_type} actualizada(s) a $${base_price}.`, 'success');
        this.rateForm = { room_type: 'individual', season: 'base', base_price: 0 };
        if (count === 0) this.loadRooms();
      },
      error: () => this.showToast('Error al crear tarifa.', 'error'),
    });
  }

  deleteRate(id: string) {
    this.ratesService.delete(id).subscribe({
      next: () => { this.ratesService.list().subscribe(r => this.rates.set(r)); this.showToast('Tarifa eliminada.', 'success'); },
      error: () => this.showToast('Error al eliminar tarifa.', 'error'),
    });
  }

  navigate(path: string) { this.router.navigate([path]); }
  logout() { this.authService.logout(); }
}
