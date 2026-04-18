import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { ManageRoomsComponent } from './manage-rooms.component';
import { AuthService } from '../../services/auth.service';
import { Room } from '../../services/rooms.service';

const mockRooms: Room[] = [
  { id: 'r1', name: 'Habitación 101', room_type: 'individual', price: '150.00', capacity: 2, beds: '1 cama doble', size: 25, amenities: 'WiFi, AC' },
  { id: 'r2', name: 'Suite 201', room_type: 'suite', price: '350.00', capacity: 4, beds: '1 king', size: 45, amenities: 'WiFi, AC, Minibar' },
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
        { provide: AuthService, useValue: { logout: vi.fn(), userType: () => 'hotel' } },
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
    component.form = { name: 'Habitación 301', room_type: 'doble', price: '200.00', capacity: 3, beds: '2 camas', size: 30, amenities: 'WiFi' };
    component.saveRoom();

    const createReq = httpMock.expectOne(r => r.method === 'POST');
    createReq.flush({ ...component.form, id: 'r3' });

    const reloadReq = httpMock.expectOne(r => r.method === 'GET');
    reloadReq.flush([...mockRooms, { ...component.form, id: 'r3' }]);

    expect(component.showForm()).toBe(false);
    expect(component.rooms().length).toBe(3);
  });

  it('should delete a room', () => {
    component.ngOnInit();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush(mockRooms);

    component.confirmDelete(mockRooms[0]);
    component.deleteRoom();

    const deleteReq = httpMock.expectOne(r => r.method === 'DELETE');
    deleteReq.flush(null);

    const reloadReq = httpMock.expectOne(r => r.method === 'GET');
    reloadReq.flush([mockRooms[1]]);

    expect(component.showDeleteConfirm()).toBe(false);
    expect(component.rooms().length).toBe(1);
  });

  it('should show toast on create success', () => {
    fixture.detectChanges();
    httpMock.expectOne(r => r.url.includes('/rooms')).flush([]);

    component.openCreateForm();
    component.form = { name: 'Test', room_type: 'individual', price: '100', capacity: 1, beds: '1', size: 15, amenities: '' };
    component.saveRoom();

    httpMock.expectOne(r => r.method === 'POST').flush({ ...component.form, id: 'new' });
    httpMock.expectOne(r => r.method === 'GET').flush([]);

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
