import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RoomsService, Room } from '../../services/rooms.service';
import { ImagesService, RoomImage } from '../../services/images.service';
import { RatesService, Rate } from '../../services/rates.service';
import { forkJoin } from 'rxjs';

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

  activeTab = signal<'rooms' | 'gallery'>('rooms');
  rooms = signal<Room[]>([]);
  roomImagesMap = signal<Record<string, RoomImage[]>>({});
  isLoading = signal(true);
  hasError = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error'>('success');

  // Gallery
  galleryLoading = signal(false);
  galleryRoom = signal<string>('');
  uploadQueue = signal<{ file: File; status: 'pending' | 'uploading' | 'done' | 'error'; progress: number }[]>([]);
  isDragging = signal(false);
  readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB

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

  switchTab(tab: 'rooms' | 'gallery') {
    this.activeTab.set(tab);
    if (tab === 'gallery') this.loadGallery();
  }

  // Gallery methods
  loadGallery() {
    this.galleryLoading.set(true);
    const hotelRooms = this.rooms();
    if (!hotelRooms.length) {
      this.galleryLoading.set(false);
      return;
    }
    const requests = hotelRooms.map(r => this.imagesService.listByRoom(r.id));
    forkJoin(requests).subscribe({
      next: (results) => {
        const map: Record<string, RoomImage[]> = {};
        hotelRooms.forEach((room, i) => { map[room.id] = results[i]; });
        this.roomImagesMap.set(map);
        this.galleryLoading.set(false);
      },
      error: () => this.galleryLoading.set(false),
    });
  }

  getTotalImages(): number {
    return Object.values(this.roomImagesMap()).reduce((sum, imgs) => sum + imgs.length, 0);
  }

  getSelectedRoomName(): string {
    const room = this.rooms().find(r => r.id === this.galleryRoom());
    return room?.name || '';
  }

  getAllImages(): (RoomImage & { roomName: string })[] {
    const map = this.roomImagesMap();
    const rooms = this.rooms();
    const all: (RoomImage & { roomName: string })[] = [];
    for (const room of rooms) {
      const imgs = map[room.id] || [];
      imgs.forEach(img => all.push({ ...img, roomName: room.name }));
    }
    return all;
  }

  getFilteredImages(): (RoomImage & { roomName: string })[] {
    const selected = this.galleryRoom();
    if (!selected) return this.getAllImages();
    const map = this.roomImagesMap();
    const room = this.rooms().find(r => r.id === selected);
    return (map[selected] || []).map(img => ({ ...img, roomName: room?.name || '' }));
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
    const files = event.dataTransfer?.files;
    if (files) this.addFiles(Array.from(files));
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.addFiles(Array.from(input.files));
    input.value = '';
  }

  addFiles(files: File[]) {
    const valid = files.filter(f => {
      if (!this.ALLOWED_TYPES.includes(f.type)) {
        this.showToast(`"${f.name}" no es un formato válido (JPG, PNG, WebP).`, 'error');
        return false;
      }
      if (f.size > this.MAX_SIZE) {
        this.showToast(`"${f.name}" excede 5MB.`, 'error');
        return false;
      }
      return true;
    });
    const queue = valid.map(f => ({ file: f, status: 'pending' as const, progress: 0 }));
    this.uploadQueue.set([...this.uploadQueue(), ...queue]);
  }

  uploadAll() {
    const roomId = this.galleryRoom();
    if (!roomId) {
      this.showToast('Selecciona una habitación primero.', 'error');
      return;
    }
    const queue = this.uploadQueue();
    queue.forEach((item, index) => {
      if (item.status !== 'pending') return;
      const updated = [...this.uploadQueue()];
      updated[index] = { ...item, status: 'uploading', progress: 50 };
      this.uploadQueue.set(updated);

      this.imagesService.upload(roomId, item.file).subscribe({
        next: () => {
          const current = [...this.uploadQueue()];
          current[index] = { ...current[index], status: 'done', progress: 100 };
          this.uploadQueue.set(current);
          this.checkUploadComplete();
        },
        error: () => {
          const current = [...this.uploadQueue()];
          current[index] = { ...current[index], status: 'error', progress: 0 };
          this.uploadQueue.set(current);
          this.checkUploadComplete();
        },
      });
    });
  }

  private checkUploadComplete() {
    const queue = this.uploadQueue();
    const allDone = queue.every(i => i.status === 'done' || i.status === 'error');
    if (allDone) {
      const success = queue.filter(i => i.status === 'done').length;
      const errors = queue.filter(i => i.status === 'error').length;
      if (errors > 0) {
        this.showToast(`${success} subida(s), ${errors} error(es).`, 'error');
      } else {
        this.showToast(`${success} imagen(es) subida(s) exitosamente.`, 'success');
      }
      setTimeout(() => this.uploadQueue.set([]), 2000);
      this.loadGallery();
    }
  }

  removeFromQueue(index: number) {
    const queue = [...this.uploadQueue()];
    queue.splice(index, 1);
    this.uploadQueue.set(queue);
  }

  deleteGalleryImage(imageId: string) {
    this.imagesService.delete(imageId).subscribe({
      next: () => { this.loadGallery(); this.showToast('Imagen eliminada.', 'success'); },
      error: () => this.showToast('Error al eliminar imagen.', 'error'),
    });
  }

  private defaultCheckin(): string {
    return new Date().toISOString().split('T')[0];
  }

  private defaultCheckout(): string {
    const d = new Date();
    d.setMonth(d.getMonth() + 2);
    return d.toISOString().split('T')[0];
  }

  loadRooms() {
    this.isLoading.set(true);
    this.hasError.set(false);
    const hotelId = this.authService.currentUser()?.id ?? '';
    this.roomsService.search({ checkin: this.defaultCheckin(), checkout: this.defaultCheckout() }).subscribe({
      next: (allRooms) => {
        const rooms = hotelId ? allRooms.filter(r => r.hotel_id === hotelId) : allRooms;
        this.rooms.set(rooms);
        this.isLoading.set(false);
        rooms.forEach(room => {
          this.imagesService.listByRoom(room.id).subscribe({
            next: (imgs) => this.roomImagesMap.set({ ...this.roomImagesMap(), [room.id]: imgs }),
            error: () => { /* no-op */ },
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
            error: () => { /* no-op */ },
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
