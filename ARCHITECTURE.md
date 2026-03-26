# TravelHub Frontend — Arquitectura y Estructura

## Tecnologías

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Angular | 21.2 | Framework frontend |
| TypeScript | 5.9 | Lenguaje |
| RxJS | 7.8 | Programación reactiva |
| Vitest | 4.0 | Testing |
| Prettier | 3.8 | Formateo de código |

## Design System

| Propiedad | Valor |
|-----------|-------|
| Fuente | Inter (400, 500, 600, 700) |
| Color primario | `#2563eb` (azul) |
| Color secundario | `#00a63e` (verde) |
| Color error | `#e7000b` (rojo) |
| Color warning | `#f0b100` (amarillo) |
| Texto principal | `#101828` |
| Texto secundario | `#6a7282` |
| Fondo principal | `#f9fafb` |
| Fondo cards | `#ffffff` |
| Bordes | `#e5e7eb` |

## Estructura del Proyecto

```
travelhub/
├── figma-data/                    # Datos extraídos de Figma (wireframes, estilos, imágenes)
│   ├── images/                    # Capturas de cada pantalla del wireframe
│   └── *.json                     # Estructuras y estilos exportados
│
├── travelhub-app/                 # Proyecto Angular
│   ├── public/                    # Assets estáticos
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/             # Componentes de página (feature modules)
│   │   │   │   ├── home/
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   ├── search/
│   │   │   │   ├── checkout/
│   │   │   │   ├── checkout-step2/
│   │   │   │   ├── booking-confirmed/
│   │   │   │   ├── print-booking/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── manage-rooms/
│   │   │   │   ├── booking-requests/
│   │   │   │   └── cancel-booking/
│   │   │   ├── app.config.ts      # Configuración de la app (providers)
│   │   │   ├── app.routes.ts      # Definición de rutas
│   │   │   ├── app.ts             # Componente raíz
│   │   │   └── app.html           # Template raíz (<router-outlet />)
│   │   ├── styles.css             # Estilos globales (Inter font, reset)
│   │   ├── main.ts                # Bootstrap de la app
│   │   └── index.html             # HTML principal
│   ├── angular.json               # Configuración Angular CLI
│   ├── tsconfig.json              # Configuración TypeScript
│   └── package.json               # Dependencias
│
├── *.js                           # Scripts de integración MCP/Figma
└── README.md
```

## Arquitectura

### Patrón

Standalone Components — cada página es un componente independiente con sus propios imports, sin NgModules.

### Flujo de navegación

```
/ (redirect) → /login
                  │
                  ├── /register
                  │
                  └── /home
                        │
                        ├── /search
                        │     │
                        │     └── /checkout
                        │           │
                        │           └── /checkout/step2
                        │                 │
                        │                 └── /booking-confirmed
                        │                       │
                        │                       ├── /print-booking
                        │                       └── /dashboard
                        │
                        ├── /dashboard
                        │
                        ├── /manage-rooms (admin)
                        │
                        ├── /booking-requests (admin)
                        │
                        └── /cancel-booking
```

### Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | redirect → `/login` | Entrada por defecto |
| `/login` | LoginComponent | Inicio de sesión |
| `/register` | RegisterComponent | Registro de usuario |
| `/home` | HomeComponent | Hero + buscador + features |
| `/search` | SearchComponent | Resultados con filtros |
| `/checkout` | CheckoutComponent | Datos personales (paso 1) |
| `/checkout/step2` | CheckoutStep2Component | Método de pago + resumen (paso 2) |
| `/booking-confirmed` | BookingConfirmedComponent | Confirmación de reserva |
| `/print-booking` | PrintBookingComponent | Vista de impresión |
| `/dashboard` | DashboardComponent | Panel de gestión con stats y tabla |
| `/manage-rooms` | ManageRoomsComponent | Galería multimedia de habitaciones |
| `/booking-requests` | BookingRequestsComponent | Solicitudes de reserva pendientes |
| `/cancel-booking` | CancelBookingComponent | Mis reservas con opción de cancelar |

## Páginas — Detalle

### Públicas (sin autenticación)

| Página | Funcionalidad |
|--------|--------------|
| **Login** | Formulario email/contraseña, recordarme, link a registro |
| **Register** | Formulario en pasos: datos personales, beneficios en sidebar |

### Usuario Viajero

| Página | Funcionalidad |
|--------|--------------|
| **Home** | Hero con buscador (destino, fechas, huéspedes), 3 feature cards |
| **Search** | Sidebar filtros (precio, estrellas, servicios), cards de hotel con rating |
| **Checkout** | Breadcrumb, formulario datos personales |
| **Checkout Step 2** | Formulario pago + sidebar resumen de reserva con totales |
| **Booking Confirmed** | Número de reserva, resumen, info huésped, detalles pago, info importante |
| **Print Booking** | Vista optimizada para impresión con `window.print()` |
| **Cancel Booking** | Listado de reservas con stats, acciones de cancelar/imprimir |

### Administración Hotel

| Página | Funcionalidad |
|--------|--------------|
| **Dashboard** | Stats (ingresos, reservas, usuarios, hoteles), gráfico tendencia, categorías, tráfico regional, tabla reservas con paginación |
| **Manage Rooms** | Galería multimedia, upload zone, stats de archivos |
| **Booking Requests** | Tabla de solicitudes pendientes con aprobar/rechazar, tiempo restante |

## Convenciones

- Cada componente tiene 3 archivos: `.ts`, `.html`, `.css`
- Componentes standalone (sin módulos)
- Estilos encapsulados por componente
- Navegación vía `Router.navigate()`
- Formularios con `FormsModule` + `ngModel`
- Responsive con media queries (`768px` mobile, `1024px` tablet)
- Colores y tipografía consistentes con el Design System de Figma

## Comandos

```bash
cd travelhub-app

npm start          # Servidor de desarrollo → http://localhost:4200
npm run build      # Build de producción
npm test           # Ejecutar tests
```

## Ramas

| Rama | Descripción |
|------|-------------|
| `main` | Esqueleto Angular limpio |
| `feature/all-pages` | Todas las 12 páginas implementadas |
| `feature/HU-welcome-screen` | HU: Pantalla de bienvenida |
| `feature/HU-hotel-dashboard` | HU: Dashboard de reservas hotel |
| `feature/HU-hotel-home` | HU: Home hotel con listado y menú |
