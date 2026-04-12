# TravelHub Frontend

Aplicación web para la plataforma TravelHub, desarrollada en Angular 21. Permite a viajeros buscar y reservar hospedajes, y a hoteles gestionar sus reservas.

## Stack

- Angular 21 (standalone components, signals)
- TypeScript
- Vitest (pruebas unitarias)
- Terraform (infraestructura AWS)
- GitHub Actions (CI/CD)

## Arquitectura de despliegue

```
Usuario → CloudFront → S3 (frontend)
                    → ELB → EKS (microservicios)
```

- S3 almacena los archivos estáticos del build
- CloudFront sirve el frontend por HTTPS y actúa como proxy hacia el API
- Los paths `/login-handler/*` y `/users/*` se redirigen al backend

URL de producción: `https://d1iioxb0yhodky.cloudfront.net`

## Desarrollo local

### Requisitos

- Node.js 22+
- Angular CLI

### Instalación

```bash
cd travelhub-app
npm install
```

### Correr la app

```bash
ng serve
```

La app queda disponible en `http://localhost:4200`. El proxy redirige las peticiones al API automáticamente.

### Pruebas

```bash
ng test --watch=false --coverage
```

Cobertura mínima requerida: 70%

## Infraestructura

El Terraform crea los siguientes recursos en AWS:

| Recurso | Descripción |
|---------|-------------|
| `aws_s3_bucket` | Bucket privado donde se almacenan los archivos del build de Angular |
| `aws_s3_bucket_public_access_block` | Bloquea el acceso público directo al bucket |
| `aws_s3_bucket_versioning` | Habilita versionado de archivos en S3 |
| `aws_cloudfront_origin_access_control` | Permite que solo CloudFront lea el bucket S3 |
| `aws_s3_bucket_policy` | Política que restringe el acceso al bucket solo desde CloudFront |
| `aws_cloudfront_distribution` | CDN que sirve el frontend y hace de proxy al API |

La distribución de CloudFront tiene tres behaviors:
- `/login-handler/*` → reenvía al ELB del backend (microservicio de autenticación)
- `/users/*` → reenvía al ELB del backend (microservicio de usuarios)
- `/*` → sirve los archivos estáticos desde S3

El state de Terraform se almacena en S3 (`travelhub-frontend-prod/terraform/state.tfstate`) para que tanto el entorno local como el pipeline de CD compartan el mismo estado.

### Requisitos

- Terraform 1.3+
- AWS CLI configurado

### Crear infraestructura

```bash
cd infra
export AWS_PROFILE=''
terraform init
terraform apply
```

### Destruir infraestructura

```bash
terraform destroy
```

## CI/CD

### CI (ci.yml)

Corre en push a cualquier rama y en pull requests a `main` y `develop`:

1. Lint — ESLint
2. Unit Tests — Vitest con cobertura mínima del 70%
3. Build — Build de producción
4. Security Audit — npm audit

### CD (cd.yml)

Corre automáticamente cuando el CI pasa en `main`:

1. Terraform apply — actualiza la infraestructura
2. Build de producción
3. Deploy a S3
4. Invalidación de caché en CloudFront

### Secrets requeridos en GitHub

| Secret | Descripción |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | Access key de AWS |
| `AWS_SECRET_ACCESS_KEY` | Secret key de AWS |
| `CLOUDFRONT_DISTRIBUTION_ID` | ID de la distribución CloudFront |

## Variables de entorno

| Variable | Desarrollo | Producción |
|----------|-----------|------------|
| `apiUrl` | `''` (proxy local) | `''` (proxy CloudFront) |
| `apiHost` | `api.travelhub.com` | `api.travelhub.com` |

## Pruebas automatizadas E2E

Ubicadas en `cypress-e2e/` usando Cypress 13 con Page Object Model y Given/When/Then.

### Estructura

```
cypress-e2e/
├── cypress/
│   ├── e2e/
│   │   ├── login.cy.ts        ← 5 escenarios de inicio de sesión
│   │   ├── register.cy.ts     ← 7 escenarios de registro (viajero y hotel)
│   │   ├── home.cy.ts         ← 5 escenarios del home del viajero
│   │   ├── hotels.cy.ts       ← 8 escenarios del menú de hoteles y buscador
│   │   └── hotel-home.cy.ts   ← 13 escenarios del home y dashboard del hotel
│   ├── pages/                 ← Page Object Model
│   │   ├── LoginPage.ts
│   │   ├── RegisterPage.ts
│   │   ├── HomePage.ts
│   │   ├── HotelHomePage.ts
│   │   └── HotelDashboardPage.ts
│   └── fixtures/
│       └── users.json         ← Datos de prueba
```

### Correr las pruebas

```bash
cd cypress-e2e
npm install
npm run cy:run        # headless
npm run cy:open       # interfaz visual
```

### Cobertura

| Spec | Tests |
|------|-------|
| login.cy.ts | 5 |
| register.cy.ts | 7 |
| home.cy.ts | 5 |
| hotels.cy.ts | 8 |
| hotel-home.cy.ts | 13 |
| **Total** | **38** |

Las pruebas corren automáticamente en el CD después de cada deploy a producción.
