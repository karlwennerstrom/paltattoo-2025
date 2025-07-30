# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PalTattoo is a full-stack web platform connecting tattoo clients and artists in Chile. It's built with:
- **Backend**: Node.js/Express REST API with MySQL database
- **Frontend**: React 18 with Tailwind CSS (dark theme with neon accents)
- **Authentication**: JWT + Google OAuth 2.0
- **File Storage**: Local filesystem with Multer
- **Payment Integration**: MercadoPago (in development)

## Common Development Commands

### Backend (from `/backend` directory)
```bash
npm run dev     # Start development server with nodemon on port 5000
npm start       # Start production server
npm run seed    # Seed database with test data
```

### Frontend (from `/frontend` directory)
```bash
npm start       # Start React development server on port 3000
npm run build   # Build for production
npm test        # Run tests
```

### Database Operations
```bash
# Import database schema and seed data
mysql -u root -p < database/paltattoo_database.sql

# Reset database (custom commands referenced in README)
npm run db:reset
npm run db:seed
```

## Architecture Overview

### Backend Structure
- **Express Server**: Entry point at `backend/server.js` with CORS, session management, and static file serving
- **Route Organization**: Modular routes in `backend/routes/` (auth, artists, offers, proposals, payments, etc.)
- **Controllers**: Business logic in `backend/controllers/` handling request/response
- **Models**: Database models in `backend/models/` using mysql2 with promise-based queries
- **Middleware**: Auth middleware using JWT, error handling, and validation with express-validator
- **Services**: External integrations (email via Nodemailer, payments via MercadoPago)

### Frontend Structure
- **React Context**: Global auth state managed via `AuthContext` in `src/contexts/`
- **Component Organization**:
  - `components/admin/`: Admin dashboard components
  - `components/artist/`: Artist dashboard and profile components
  - `components/user/`: Client-specific components
  - `components/common/`: Reusable UI components (Modal, Button, etc.)
- **Page Components**: Route-level components in `src/pages/`
- **API Integration**: Centralized API service in `src/services/api.js` with axios interceptors
- **Styling**: Tailwind CSS with custom dark theme configuration

### Database Schema
Key tables include:
- `users`: Base user accounts with roles (client/artist/admin)
- `tattoo_artists`: Artist-specific data (studio, experience, specialties)
- `tattoo_offers`: Client tattoo requests
- `proposals`: Artist proposals for offers
- `subscriptions`: Artist subscription plans
- `appointments`: Scheduled tattoo sessions
- `portfolio_images`: Artist portfolio items

### Authentication Flow
1. JWT tokens stored in localStorage
2. Axios interceptor adds token to all API requests
3. Backend validates tokens via auth middleware
4. Google OAuth integration for social login
5. Role-based access control (client vs artist vs admin)

## Key Development Patterns

### API Response Format
```javascript
// Success response
{ success: true, data: {...} }

// Error response
{ success: false, message: "Error description" }
```

### File Upload Handling
- Images uploaded to `backend/uploads/` with subdirectories for different types
- Multer middleware configured for image validation
- Sharp library for image processing (thumbnails, optimization)

### State Management
- React Context for global auth state
- Local component state for UI interactions
- Toast notifications via react-hot-toast

### Environment Variables
Backend requires: `DB_*`, `JWT_SECRET`, `GOOGLE_CLIENT_*`, `EMAIL_*`, `MERCADOPAGO_*`
Frontend requires: `REACT_APP_API_URL`, `REACT_APP_GOOGLE_CLIENT_ID`

## Current Development Status

### Completed Features
- User authentication and profiles
- Tattoo offer creation and browsing
- Artist proposal system
- Basic admin dashboard
- Email notifications
- Subscription plans structure

### In Progress

- las imagenes del portafolio, se deben poder eliminar. con un lightbox que pregunte si estoy seguro
- cuando se envíe una propuesta, el sistema tiene que enviarle un correo al usuario que generó la oferta publica y al usuario que generó la propuesta
- si el cliente acepta la propuesta del artista, se le envía un correo al artista confirmando que se ha aceptado su propuesta. 
- La propuesta al ser aceptada, recien ahí se pueden ver los datos de contacto del cliente. 
- Si se edita el precio de la propuesta que ya hizo el artista, se le envía un correo al cliente informando que se ha modificado el precio de la propuesta. 
- Se debe mantener un historial de los precios de laas propuestas. el precio anterior y el precio nuevo.
- Se tiene que tachar el precio anterior y mostrar el nuevo precio en la propuesta.
- si el cliente rechaza la propuesta del artista, se le envía un correo al artista informando que su propuesta ha sido rechazada.
- si el artista rechaza la propuesta del cliente, se le envía un correo al cliente informando que su propuesta ha sido rechazada.
- Calendar/appointment system
- Real-time chat functionality

### Known Issues
- Portfolio endpoints return empty arrays (implementation pending)
- Some subscription features incomplete
- Chat system not yet implemented

## Plan de Desarrollo: Experiencia Tipo Uber

### Objetivo Principal
Transformar la experiencia de publicar una solicitud de algo que parece estático y pasivo, a algo que se siente dinámico y activo, donde el cliente siente que el sistema está trabajando para él en tiempo real, similar a la experiencia de pedir un servicio en Uber.

### Componentes a Implementar

#### 1. Experiencia de Publicación Inmediata
Cuando el cliente publique una solicitud, debe sentirse como cuando pides un Uber. Al presionar 'Publicar', mostrar inmediatamente una animación o pantalla que indique que se está buscando tatuadores. No debe ser una simple confirmación, sino un proceso visual que dé la sensación de que algo está sucediendo en tiempo real.

#### 2. Página de Seguimiento en Vivo
Crear una vista donde el cliente pueda ver el 'progreso' de su solicitud. Similar a cuando esperas un Uber y ves el mapa. Debe mostrar cuántos tatuadores han visto la solicitud, si alguien está interesado, y las propuestas que van llegando. Todo debe actualizarse sin recargar la página.

#### 3. Sistema de Notificaciones Activas
Implementar notificaciones que hagan sentir al cliente que hay actividad. Por ejemplo: 'Un tatuador está revisando tu solicitud', '3 tatuadores han visto tu propuesta', 'Nueva propuesta recibida'. Estas deben aparecer de forma dinámica mientras el usuario está en la plataforma.

#### 4. Feed Dinámico para Tatuadores
Los tatuadores deben ver las nuevas solicitudes como un feed que se actualiza automáticamente, no como una lista estática. Deben poder indicar rápidamente si les interesa sin necesidad de escribir una propuesta completa inmediatamente.

#### 5. Estados Visuales del Proceso
La solicitud debe pasar por estados visuales claros que el cliente pueda ver: 'Publicando' → 'Buscando tatuadores' → 'Tatuadores revisando' → 'Recibiendo propuestas'. Cada estado debe tener su propia representación visual y animaciones.

#### 6. Sensación de Actividad Constante
Mostrar métricas que den la sensación de que hay movimiento: cantidad de tatuadores que vieron la solicitud, tiempo transcurrido, tatuadores en línea en el área. Aunque no sea 100% real-time, debe parecer que el sistema está activamente trabajando.

#### 7. Respuesta Inmediata a Acciones
Cada acción del usuario debe tener feedback inmediato. Si publican, ver la publicación procesándose. Si un tatuador muestra interés, el cliente lo ve al instante. No debe haber momentos donde el usuario se pregunte '¿funcionó?'

#### 8. Dashboard con Información en Vivo
El dashboard principal debe mostrar el estado actual de todas las solicitudes activas del cliente, con indicadores visuales de nueva actividad (puntos rojos, badges, etc). Debe sentirse vivo, no como una lista estática.

#### 9. Flujo de Interacción Rápida
Permitir que los tatuadores puedan expresar interés rápidamente (como un 'me interesa' o 'estoy revisando') antes de enviar una propuesta formal. Esto genera actividad inmediata que el cliente puede ver.

#### 10. Experiencia Mobile-First
Todo el flujo debe sentirse natural en móvil, con gestos, transiciones suaves y carga rápida. La experiencia debe ser tan fluida como usar la app de Uber en el teléfono.

#### 11. Progreso Visual del Proceso
Implementar indicadores visuales de progreso en cada etapa. Por ejemplo, una barra de progreso o círculos que se van completando conforme avanza el proceso de la solicitud.

#### 12. Comunicación Proactiva
El sistema debe comunicar proactivamente lo que está pasando. No esperar a que el usuario pregunte o recargue. Mensajes como 'Tu solicitud fue vista por 5 tatuadores en los últimos 10 minutos' generan confianza.

### Tecnologías Recomendadas para Implementación
- **WebSockets (Socket.io)**: Para actualizaciones en tiempo real
- **Server-Sent Events**: Como alternativa ligera para notificaciones unidireccionales
- **React Query o SWR**: Para polling optimizado y caché de datos
- **Framer Motion**: Para animaciones fluidas y transiciones
- **Push Notifications API**: Para notificaciones del navegador
- **Redis**: Para caché y pub/sub de eventos en tiempo real