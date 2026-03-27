import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { faker } from '@faker-js/faker';
import { HotelHomeComponent, HotelReserva } from './hotel-home.component';

function buildFakeReserva(overrides: Partial<HotelReserva> = {}): HotelReserva {
  const estados: HotelReserva['estado'][] = ['Pendiente', 'Confirmada', 'En curso', 'Completada', 'Cancelada'];
  return {
    id: `BK-${faker.number.int({ min: 1000, max: 9999 })}`,
    huesped: faker.person.fullName(),
    checkIn: faker.date.future().toLocaleDateString(),
    checkOut: faker.date.future().toLocaleDateString(),
    estado: faker.helpers.arrayElement(estados),
    tipoHabitacion: faker.helpers.arrayElement(['Suite Deluxe', 'Habitación Doble', 'Suite Junior', 'Habitación Estándar', 'Suite Presidencial']),
    ...overrides,
  };
}

describe('HotelHomeComponent', () => {
  let component: HotelHomeComponent;
  let fixture: ComponentFixture<HotelHomeComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelHomeComponent],
      providers: [{ provide: Router, useValue: { navigate: vi.fn() } }],
    }).compileComponents();

    fixture = TestBed.createComponent(HotelHomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have hotel name set', () => {
    expect(component.hotelName).toBe('Grand Seaside Resort');
  });

  it('should have menu items defined', () => {
    expect(component.menuItems.length).toBe(4);
    expect(component.menuItems.map(m => m.action)).toEqual(['detail', 'approve', 'cancel', 'reports']);
  });

  describe('ngOnInit', () => {
    it('should load reservas on init', () => {
      component.ngOnInit();
      expect(component.reservas().length).toBe(5);
    });

    it('should have hasReservas as true after init', () => {
      component.ngOnInit();
      expect(component.hasReservas()).toBe(true);
    });

    it('should have hasReservas as false before init', () => {
      expect(component.hasReservas()).toBe(false);
    });

    it('should load reservas with valid estados', () => {
      component.ngOnInit();
      const validEstados = ['Pendiente', 'Confirmada', 'En curso', 'Completada', 'Cancelada'];
      component.reservas().forEach(r => {
        expect(validEstados).toContain(r.estado);
      });
    });
  });

  describe('onMenuAction', () => {
    it('should toggle selectedReserva on detail action', () => {
      const reserva = buildFakeReserva();
      component.onMenuAction('detail', reserva);
      expect(component.selectedReserva()).toBe(reserva);

      component.onMenuAction('detail', reserva);
      expect(component.selectedReserva()).toBeNull();
    });

    it('should select a different reserva on detail', () => {
      const r1 = buildFakeReserva();
      const r2 = buildFakeReserva();
      component.onMenuAction('detail', r1);
      expect(component.selectedReserva()).toBe(r1);

      component.onMenuAction('detail', r2);
      expect(component.selectedReserva()).toBe(r2);
    });

    it('should not change selectedReserva if no reserva provided for detail', () => {
      component.onMenuAction('detail');
      expect(component.selectedReserva()).toBeNull();
    });

    it('should approve a Pendiente reserva', () => {
      const reserva = buildFakeReserva({ estado: 'Pendiente' });
      component.onMenuAction('approve', reserva);
      expect(reserva.estado).toBe('Confirmada');
    });

    it('should not approve a non-Pendiente reserva', () => {
      const reserva = buildFakeReserva({ estado: 'Confirmada' });
      component.onMenuAction('approve', reserva);
      expect(reserva.estado).toBe('Confirmada');
    });

    it('should not approve without reserva', () => {
      expect(() => component.onMenuAction('approve')).not.toThrow();
    });

    it('should cancel an active reserva', () => {
      const reserva = buildFakeReserva({ estado: 'Pendiente' });
      component.onMenuAction('cancel', reserva);
      expect(reserva.estado).toBe('Cancelada');
    });

    it('should cancel a Confirmada reserva', () => {
      const reserva = buildFakeReserva({ estado: 'Confirmada' });
      component.onMenuAction('cancel', reserva);
      expect(reserva.estado).toBe('Cancelada');
    });

    it('should cancel an En curso reserva', () => {
      const reserva = buildFakeReserva({ estado: 'En curso' });
      component.onMenuAction('cancel', reserva);
      expect(reserva.estado).toBe('Cancelada');
    });

    it('should not cancel a Completada reserva', () => {
      const reserva = buildFakeReserva({ estado: 'Completada' });
      component.onMenuAction('cancel', reserva);
      expect(reserva.estado).toBe('Completada');
    });

    it('should not cancel an already Cancelada reserva', () => {
      const reserva = buildFakeReserva({ estado: 'Cancelada' });
      component.onMenuAction('cancel', reserva);
      expect(reserva.estado).toBe('Cancelada');
    });

    it('should not cancel without reserva', () => {
      expect(() => component.onMenuAction('cancel')).not.toThrow();
    });

    it('should navigate to hotel-dashboard on reports action', () => {
      component.onMenuAction('reports');
      expect(router.navigate).toHaveBeenCalledWith(['/hotel-dashboard']);
    });

    it('should do nothing for unknown action', () => {
      const reserva = buildFakeReserva();
      const estadoOriginal = reserva.estado;
      component.onMenuAction(faker.string.alpha(8), reserva);
      expect(reserva.estado).toBe(estadoOriginal);
    });
  });

  describe('estadoClass', () => {
    it('should return status-pending for Pendiente', () => {
      expect(component.estadoClass('Pendiente')).toBe('status-pending');
    });

    it('should return status-confirmed for Confirmada', () => {
      expect(component.estadoClass('Confirmada')).toBe('status-confirmed');
    });

    it('should return status-ongoing for En curso', () => {
      expect(component.estadoClass('En curso')).toBe('status-ongoing');
    });

    it('should return status-completed for Completada', () => {
      expect(component.estadoClass('Completada')).toBe('status-completed');
    });

    it('should return status-cancelled for Cancelada', () => {
      expect(component.estadoClass('Cancelada')).toBe('status-cancelled');
    });

    it('should return empty string for unknown estado', () => {
      expect(component.estadoClass(faker.string.alpha(10))).toBe('');
    });
  });

  describe('navigate', () => {
    it('should call router.navigate with given path', () => {
      const path = `/${faker.string.alpha(6)}`;
      component.navigate(path);
      expect(router.navigate).toHaveBeenCalledWith([path]);
    });
  });

  describe('template rendering', () => {
    beforeEach(() => {
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should render hotel name in header badge', () => {
      const badge = fixture.nativeElement.querySelector('.hotel-badge');
      expect(badge.textContent).toContain('Grand Seaside Resort');
    });

    it('should render hotel name in page header', () => {
      const h1 = fixture.nativeElement.querySelector('.page-header h1');
      expect(h1.textContent).toContain('Grand Seaside Resort');
    });

    it('should render navigation links', () => {
      const navLinks = fixture.nativeElement.querySelectorAll('nav a, nav button');
      expect(navLinks.length).toBe(4);
    });

    it('should render sidebar menu items', () => {
      const menuItems = fixture.nativeElement.querySelectorAll('.menu-item');
      expect(menuItems.length).toBe(4);
    });

    it('should render reserva cards', () => {
      const cards = fixture.nativeElement.querySelectorAll('.reserva-card');
      expect(cards.length).toBe(5);
    });

    it('should render huesped names in cards', () => {
      const names = fixture.nativeElement.querySelectorAll('.reserva-info h3');
      expect(names.length).toBe(5);
      names.forEach((el: HTMLElement) => {
        expect(el.textContent?.trim().length).toBeGreaterThan(0);
      });
    });

    it('should render status badges with correct classes', () => {
      const statuses = fixture.nativeElement.querySelectorAll('.status');
      statuses.forEach((el: HTMLElement) => {
        const hasStatusClass = el.classList.contains('status-pending')
          || el.classList.contains('status-confirmed')
          || el.classList.contains('status-ongoing')
          || el.classList.contains('status-completed')
          || el.classList.contains('status-cancelled');
        expect(hasStatusClass).toBe(true);
      });
    });

    it('should show empty state when no reservas', () => {
      component.reservas.set([]);
      fixture.detectChanges();
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
    });

    it('should not show empty state when reservas exist', () => {
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState).toBeNull();
    });

    it('should show detail panel when reserva is selected', () => {
      component.ngOnInit();
      const reserva = component.reservas()[0];
      component.selectedReserva.set(reserva);
      fixture.detectChanges();
      const detail = fixture.nativeElement.querySelector('.reserva-detail');
      expect(detail).toBeTruthy();
    });

    it('should show approve button only for Pendiente reservas', () => {
      component.reservas.set([
        buildFakeReserva({ estado: 'Pendiente' }),
        buildFakeReserva({ estado: 'Confirmada' }),
      ]);
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('.reserva-card');
      const firstCardButtons = cards[0].querySelectorAll('.btn-icon');
      const secondCardButtons = cards[1].querySelectorAll('.btn-icon');
      // Pendiente: detail + approve + cancel = 3
      expect(firstCardButtons.length).toBe(3);
      // Confirmada: detail + cancel = 2
      expect(secondCardButtons.length).toBe(2);
    });

    it('should not show cancel button for Completada/Cancelada', () => {
      component.reservas.set([
        buildFakeReserva({ estado: 'Completada' }),
        buildFakeReserva({ estado: 'Cancelada' }),
      ]);
      fixture.detectChanges();
      const cards = fixture.nativeElement.querySelectorAll('.reserva-card');
      // Only detail button
      expect(cards[0].querySelectorAll('.btn-icon').length).toBe(1);
      expect(cards[1].querySelectorAll('.btn-icon').length).toBe(1);
    });
  });
});
