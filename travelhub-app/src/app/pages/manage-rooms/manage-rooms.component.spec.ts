import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ManageRoomsComponent } from './manage-rooms.component';
import { AuthService } from '../../services/auth.service';
import { Room } from '../../services/rooms.service';

const mockRooms: Room[] = [
  { id: 'r1', hotel_id: 'h1', name: 'Habitación 101', room_type: 'individual', price: '150.00', capacity: 2, beds: '1 cama doble', size: 25, amenities: 'WiFi, AC' },
  { id: 'r2', hotel_id: 'h1', name: 'Suite 201', room_type: 'suite', price: '350.00', capacity: 4, beds: '1 king', size: 45, amenities: 'WiFi, AC, Minibar' },
];

describe('ManageRoomsComponent', () => {
  let component: ManageRoomsComponent;
  let fixture: ComponentFixture<ManageRoomsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRoomsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn(), userType: () => 'hotel', currentUser: () => ({ id: 'h1' }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageRoomsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load rooms on init', () => {
    component.ngOnInit();
    const req = httpMock.expectOne(r => r.url.includes('/rooms'));
    req.flush(mockRooms);
    expect(component.rooms().length).toBe(2);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle error on load', () => {
    component.ngOnInit();
    const req = httpMock.expectOne(r => r.url.includes('/rooms'));
    req.error(new ProgressEvent('error'));
    expect(component.hasError()).toBe(true);
    expect(component.isLoading()).toBe(false);
  });

  it('should open create form', () => {
    component.openCreateForm();
    expect(component.showForm()).toBe(true);
    expect(component.editingRoom()).toBeNull();
    expect(component.form.name).toBe('');
  });

  it('should open edit form with room data', () => {
    component.openEditForm(mockRooms[0]);
    expect(component.showForm()).toBe(true);
    expect(component.editingRoom()).toBe(mockRooms[0]);
    expect(component.form.name).toBe('Habitación 101');
    expect(component.form.price).toBe('150.00');
  });

  it('should close form', () => {
    component.openCreateForm();
    component.closeForm();
    expect(component.showForm()).toBe(false);
    expect(component.editingRoom()).toBeNull();
  });

  it('should open delete confirm', () => {
    component.confirmDelete(mockRooms[0]);
    expect(component.showDeleteConfirm()).toBe(true);
    expect(component.deletingRoom()?.id).toBe('r1');
  });

  it('should cancel delete', () => {
    component.confirmDelete(mockRooms[0]);
    component.cancelDelete();
    expect(component.showDeleteConfirm()).toBe(false);
    expect(component.deletingRoom()).toBeNull();
  });

  it('should create a room', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);

    component.openCreateForm();
    component.form = { name: 'Habitación 301', destination: '', room_type: 'doble', price: '200.00', capacity: 3, beds: '2 camas', size: 30, amenities: 'WiFi' };
    component.saveRoom();

    const createReq = httpMock.expectOne(r => r.method === 'POST');
    createReq.flush({ ...component.form, id: 'r3' });

    // After create: reload rooms + load images for new room
    httpMock.match(r => r.method === 'GET').forEach(r => r.flush([]));

    expect(component.showForm()).toBe(false);
  });

  it('should delete a room', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/rooms') && r.method === 'GET').flush(mockRooms);
    httpMock.match(r => r.url.includes('/images')).forEach(r => r.flush([]));

    component.confirmDelete(mockRooms[0]);
    component.deleteRoom();

    const deleteReq = httpMock.expectOne(r => r.method === 'DELETE');
    deleteReq.flush(null);

    const reloadReqs = httpMock.match(r => r.method === 'GET');
    reloadReqs.forEach(r => r.flush(r.request.url.includes('/images') ? [] : [mockRooms[1]]));

    expect(component.showDeleteConfirm()).toBe(false);
    expect(component.rooms().length).toBe(1);
  });

  it('should show toast on create success', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([]);

    component.openCreateForm();
    component.form = { name: 'Test', destination: '', room_type: 'individual', price: '100', capacity: 1, beds: '1', size: 15, amenities: '' };
    component.saveRoom();

    httpMock.expectOne(r => r.method === 'POST').flush({ ...component.form, id: 'new' });
    httpMock.match(r => r.method === 'GET').forEach(r => r.flush([]));

    expect(component.toastMessage()).toContain('creada');
    expect(component.toastType()).toBe('success');
  });

  it('should render empty state when no rooms', () => {
    fixture.detectChanges(); // triggers ngOnInit
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([]);
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.empty-state');
    expect(empty).toBeTruthy();
  });

  it('should render room cards', () => {
    fixture.detectChanges(); // triggers ngOnInit
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.room-card');
    expect(cards.length).toBe(2);
  });
});

describe('ManageRoomsComponent - Template', () => {
  let component: ManageRoomsComponent;
  let fixture: ComponentFixture<ManageRoomsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRoomsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn(), userType: () => 'hotel', currentUser: () => ({ id: 'h1' }) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ManageRoomsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should show loading state initially', () => {
    fixture.detectChanges();
    const loading = fixture.nativeElement.querySelector('.loading');
    expect(loading).toBeTruthy();
  });

  it('should show error state on load failure', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).error(new ProgressEvent('error'));
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('.error-state');
    expect(error).toBeTruthy();
  });

  it('should show header with navigation', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('nav')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Habitaciones');
  });

  it('should show room details in cards', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);
    fixture.detectChanges();
    const el = fixture.nativeElement;
    expect(el.textContent).toContain('Habitación 101');
    expect(el.textContent).toContain('150.00');
    expect(el.textContent).toContain('individual');
    expect(el.textContent).toContain('WiFi, AC');
  });

  it('should show edit, photos and delete buttons on each card', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);
    fixture.detectChanges();
    const editBtns = fixture.nativeElement.querySelectorAll('.btn-edit');
    const deleteBtns = fixture.nativeElement.querySelectorAll('.btn-delete');
    expect(editBtns.length).toBe(4);
    expect(deleteBtns.length).toBe(2);
  });

  it('should show create form modal when clicking new room', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([]);
    fixture.detectChanges();
    component.openCreateForm();
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.modal');
    expect(modal).toBeTruthy();
    expect(modal.textContent).toContain('Nueva');
  });

  it('should show edit form modal with room data', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);
    fixture.detectChanges();
    component.openEditForm(mockRooms[0]);
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.modal');
    expect(modal).toBeTruthy();
    expect(modal.textContent).toContain('Editar');
  });

  it('should show delete confirm modal', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);
    fixture.detectChanges();
    component.confirmDelete(mockRooms[0]);
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.modal');
    expect(modal).toBeTruthy();
    expect(modal.textContent).toContain('Eliminar');
    expect(modal.textContent).toContain('Habitación 101');
  });

  it('should show toast message', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);
    fixture.detectChanges();
    component.toastMessage.set('Test toast');
    component.toastType.set('success');
    fixture.detectChanges();
    const toast = fixture.nativeElement.querySelector('.toast');
    expect(toast).toBeTruthy();
    expect(toast.textContent).toContain('Test toast');
  });

  it('should show error toast with error class', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([]);
    fixture.detectChanges();
    component.toastMessage.set('Error msg');
    component.toastType.set('error');
    fixture.detectChanges();
    const toast = fixture.nativeElement.querySelector('.toast-error');
    expect(toast).toBeTruthy();
  });

  it('should show room status when available', () => {
    const roomWithStatus = { ...mockRooms[0], status: 'disponible' };
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([roomWithStatus]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('disponible');
  });

  it('should handle update error with toast', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);

    component.openEditForm(mockRooms[0]);
    component.saveRoom();

    httpMock.expectOne(r => r.method === 'PUT').error(new ProgressEvent('error'));

    expect(component.toastMessage()).toContain('Error');
    expect(component.toastType()).toBe('error');
  });

  it('should handle delete error with toast', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);

    component.confirmDelete(mockRooms[0]);
    component.deleteRoom();

    httpMock.expectOne(r => r.method === 'DELETE').error(new ProgressEvent('error'));

    expect(component.toastMessage()).toContain('Error');
    expect(component.toastType()).toBe('error');
  });

  it('should not delete if no room selected', () => {
    component.deleteRoom();
    expect(component.showDeleteConfirm()).toBe(false);
  });
});

describe('ManageRoomsComponent - Images & Rates', () => {
  let component: ManageRoomsComponent;
  let fixture: ComponentFixture<ManageRoomsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRoomsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn(), userType: () => 'hotel', currentUser: () => ({ id: 'h1' }) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ManageRoomsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should open images modal and load images', () => {
    component.openImages(mockRooms[0]);
    expect(component.showImageModal()).toBe(true);
    expect(component.imageRoom()?.id).toBe('r1');
    httpMock.expectOne(r => r.url.includes('/rooms/r1/images')).flush([{ id: 'i1', room_id: 'r1', url: 'http://img.jpg' }]);
    expect(component.roomImages().length).toBe(1);
  });

  it('should close images modal', () => {
    component.openImages(mockRooms[0]);
    httpMock.expectOne(r => r.url.includes('/images')).flush([]);
    component.closeImages();
    expect(component.showImageModal()).toBe(false);
    expect(component.imageRoom()).toBeNull();
  });

  it('should handle image load error', () => {
    component.openImages(mockRooms[0]);
    httpMock.expectOne(r => r.url.includes('/images')).error(new ProgressEvent('error'));
    expect(component.roomImages().length).toBe(0);
  });

  it('should delete image', () => {
    component.openImages(mockRooms[0]);
    httpMock.expectOne(r => r.url.includes('/rooms/r1/images')).flush([{ id: 'i1', room_id: 'r1', url: 'http://img.jpg' }]);
    component.deleteImage('i1');
    httpMock.expectOne(r => r.method === 'DELETE' && r.url.includes('/images/i1')).flush(null);
    httpMock.expectOne(r => r.url.includes('/rooms/r1/images')).flush([]);
    expect(component.roomImages().length).toBe(0);
  });

  it('should handle delete image error', () => {
    component.openImages(mockRooms[0]);
    httpMock.expectOne(r => r.url.includes('/images')).flush([{ id: 'i1', room_id: 'r1', url: 'http://img.jpg' }]);
    component.deleteImage('i1');
    httpMock.expectOne(r => r.method === 'DELETE').error(new ProgressEvent('error'));
    expect(component.toastMessage()).toContain('Error');
  });

  it('should not upload if no file', () => {
    const event = { target: { files: null } } as unknown as Event;
    component.uploadImage(event);
    httpMock.expectNone(r => r.method === 'POST');
  });

  it('should handle upload error', () => {
    component.openImages(mockRooms[0]);
    httpMock.expectOne(r => r.url.includes('/images')).flush([]);
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } } as unknown as Event;
    component.uploadImage(event);
    httpMock.expectOne(r => r.method === 'POST').error(new ProgressEvent('error'));
    expect(component.toastMessage()).toContain('Error');
  });

  it('should open rates modal', () => {
    component.openRates();
    expect(component.showRateModal()).toBe(true);
    httpMock.expectOne(r => r.url.includes('/rates')).flush([]);
  });

  it('should close rates modal', () => {
    component.openRates();
    httpMock.expectOne(r => r.url.includes('/rates')).flush([]);
    component.closeRates();
    expect(component.showRateModal()).toBe(false);
  });

  it('should handle rates load error', () => {
    component.openRates();
    httpMock.expectOne(r => r.url.includes('/rates')).error(new ProgressEvent('error'));
    expect(component.rates().length).toBe(0);
  });

  it('should create rate and update matching rooms', () => {
    component.rooms.set(mockRooms as any);
    component.rateForm = { room_type: 'suite', season: 'base', base_price: 1000000 };
    component.createRate();

    httpMock.expectOne(r => r.method === 'POST' && r.url.includes('/rates')).flush({ id: 'rate1' });
    httpMock.expectOne(r => r.url.includes('/rates') && r.method === 'GET').flush([]);

    // Should update Suite 201 (r2) which is room_type 'suite'
    const updateReq = httpMock.expectOne(r => r.method === 'PUT' && r.url.includes('/r2'));
    expect(updateReq.request.body.price).toBe('1000000');
    updateReq.flush({ ...mockRooms[1], price: '1000000' });

    // Reload rooms after update
    httpMock.match(r => r.method === 'GET').forEach(r => r.flush([]));

    expect(component.toastMessage()).toContain('suite');
    expect(component.toastMessage()).toContain('1000000');
  });

  it('should handle create rate error', () => {
    component.rateForm = { room_type: 'suite', season: 'base', base_price: 500 };
    component.createRate();
    httpMock.expectOne(r => r.method === 'POST').error(new ProgressEvent('error'));
    expect(component.toastMessage()).toContain('Error');
  });

  it('should delete rate', () => {
    component.openRates();
    httpMock.expectOne(r => r.url.includes('/rates') && r.method === 'GET').flush([{ id: 'rate1', room_type: 'suite', season: 'base', base_price: 500 }]);
    component.deleteRate('rate1');
    httpMock.expectOne(r => r.method === 'DELETE' && r.url.includes('/rate1')).flush(null);
    httpMock.expectOne(r => r.url.includes('/rates') && r.method === 'GET').flush([]);
    expect(component.toastMessage()).toContain('eliminada');
  });

  it('should handle delete rate error', () => {
    component.deleteRate('rate1');
    httpMock.expectOne(r => r.method === 'DELETE').error(new ProgressEvent('error'));
    expect(component.toastMessage()).toContain('Error');
  });

  it('should get room image from map', () => {
    component.roomImagesMap.set({ r1: [{ id: 'i1', room_id: 'r1', url: 'http://img.jpg' }] } as any);
    expect(component.getRoomImage('r1')).toBe('http://img.jpg');
  });

  it('should return empty string when no image', () => {
    expect(component.getRoomImage('unknown')).toBe('');
  });

  it('should filter rooms by hotel_id on load', () => {
    component.ngOnInit();
    const allRooms = [...mockRooms, { id: 'r3', hotel_id: 'other', name: 'Other', room_type: 'individual', price: '100', capacity: 1, beds: '1', size: 10, amenities: '' }];
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(allRooms);
    httpMock.match(r => r.url.includes('/images')).forEach(r => r.flush([]));
    expect(component.rooms().length).toBe(2);
  });
});

describe('ManageRoomsComponent - Modal Templates', () => {
  let component: ManageRoomsComponent;
  let fixture: ComponentFixture<ManageRoomsComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRoomsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: { logout: vi.fn(), userType: () => 'hotel', currentUser: () => ({ id: 'h1' }) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ManageRoomsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should render images modal with images', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);
    httpMock.match(r => r.url.includes('/images')).forEach(r => r.flush([]));
    fixture.detectChanges();

    component.openImages(mockRooms[0]);
    httpMock.expectOne(r => r.url.includes('/rooms/r1/images')).flush([{ id: 'i1', room_id: 'r1', url: 'http://img.jpg' }]);
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.modal');
    expect(modal).toBeTruthy();
    expect(modal.textContent).toContain('Fotos');
    expect(fixture.nativeElement.querySelector('.image-item')).toBeTruthy();
  });

  it('should render images modal with no images message', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);
    httpMock.match(r => r.url.includes('/images')).forEach(r => r.flush([]));
    fixture.detectChanges();

    component.openImages(mockRooms[0]);
    httpMock.expectOne(r => r.url.includes('/rooms/r1/images')).flush([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.no-images')).toBeTruthy();
  });

  it('should render rates modal', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([]);
    fixture.detectChanges();

    component.openRates();
    httpMock.expectOne(r => r.url.includes('/rates')).flush([{ id: 'rate1', room_type: 'suite', season: 'base', base_price: 500 }]);
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.modal');
    expect(modal).toBeTruthy();
    expect(modal.textContent).toContain('Tarifas');
    expect(fixture.nativeElement.querySelector('.rate-item')).toBeTruthy();
  });

  it('should render rates modal with no rates message', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([]);
    fixture.detectChanges();

    component.openRates();
    httpMock.expectOne(r => r.url.includes('/rates')).flush([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.no-rates')).toBeTruthy();
  });

  it('should render rate with discount info', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([]);
    fixture.detectChanges();

    component.openRates();
    httpMock.expectOne(r => r.url.includes('/rates')).flush([{ id: 'rate1', room_type: 'suite', season: 'base', base_price: 500, has_discount: true, final_price: 400, discount_name: 'Promo' }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.rate-discount')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Promo');
  });

  it('should render room image in card when available', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);
    // Flush image requests - first room has image
    const imgReqs = httpMock.match(r => r.url.includes('/images'));
    imgReqs.forEach((r, i) => r.flush(i === 0 ? [{ id: 'i1', room_id: 'r1', url: 'http://img.jpg' }] : []));
    fixture.detectChanges();

    const roomImg = fixture.nativeElement.querySelector('.room-image img');
    expect(roomImg).toBeTruthy();
  });

  it('should upload image successfully', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);
    httpMock.match(r => r.url.includes('/images')).forEach(r => r.flush([]));
    fixture.detectChanges();

    component.openImages(mockRooms[0]);
    httpMock.expectOne(r => r.url.includes('/rooms/r1/images') && r.method === 'GET').flush([]);
    fixture.detectChanges();

    const file = new File(['data'], 'photo.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } } as unknown as Event;
    component.uploadImage(event);

    httpMock.expectOne(r => r.method === 'POST' && r.url.includes('/rooms/r1/images')).flush({ id: 'i2', room_id: 'r1', url: 'http://new.jpg' });
    httpMock.expectOne(r => r.url.includes('/rooms/r1/images') && r.method === 'GET').flush([{ id: 'i2', room_id: 'r1', url: 'http://new.jpg' }]);

    expect(component.toastMessage()).toContain('subida');
  });
});
