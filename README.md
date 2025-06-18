# TOTS - Frontend

Aplicación web para gestión de reservas de espacios desarrollada con Angular 19 y Angular Material.

## Requisitos previos

- Node.js (v18.0.0 o superior)
- NPM (v9.0.0 o superior)
- Angular CLI (v19.2.11)

## Instalación

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd tots/front
```

2. Instala las dependencias:

```bash
npm install
```

3. Inicia el servidor de desarrollo:

```bash
ng serve
```

4. Abre tu navegador en `http://localhost:4200/`

## Estructura del proyecto

El proyecto sigue una arquitectura modular con los siguientes directorios principales:

- **app/core**: Servicios, modelos e interceptores globales
- **app/features**: Módulos funcionales divididos por características (spaces, reservations, admin, auth)
- **app/shared**: Componentes, directivas y pipes compartidos

## Rutas principales

- `/`: Home - Página principal
- `/spaces`: Lista de espacios disponibles
- `/spaces/view/:id`: Detalle de un espacio específico
- `/reservations/new/:spaceId`: Formulario para crear una nueva reserva
- `/login`: Página de inicio de sesión
- `/register`: Página de registro

### Rutas del panel de administración

- `/admin`: Panel de administración (requiere autenticación como admin)
- `/admin/spaces`: Gestión de espacios
- `/admin/spaces/new`: Crear un nuevo espacio
- `/admin/spaces/edit/:id`: Editar un espacio existente
- `/admin/reservations`: Gestión de reservas

## Librerías principales

- **@angular/core**: Framework Angular (v19.2.0)
- **@angular/material**: Componentes de UI (v19.2.18)
- **@angular/forms**: Manejo de formularios reactivos
- **@angular/router**: Enrutamiento
- **@angular/cdk**: Kit de desarrollo de componentes
- **@auth0/angular-jwt**: Manejo de tokens JWT
- **rxjs**: Programación reactiva

## Características principales

1. **Sistema de autenticación**
   - Registro de usuarios
   - Inicio de sesión con JWT
   - Roles (usuario/administrador)

2. **Gestión de espacios**
   - Listado con filtros
   - Visualización detallada
   - CRUD completo para administradores

3. **Sistema de reservas**
   - Formulario con validación de disponibilidad
   - Selección de fecha/hora
   - Confirmación y pago (simulado)

4. **Panel de administración**
   - Gestión de espacios
   - Gestión de reservas
   - Estadísticas (pendiente de implementación)

## Comunicación con el backend

La aplicación se comunica con una API RESTful en Symfony a través de servicios HTTP. Las principales características son:

- Interceptores para manejar tokens JWT
- Servicios específicos por entidad (SpaceService, ReservationService, etc.)
- Manejo de respuestas paginadas y formato Hydra

## Compilación para producción

```bash
ng build --configuration production
```

Los archivos de la build estarán disponibles en el directorio `dist/`
