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
- Portfolio management system
- Payment integration with MercadoPago
- Calendar/appointment system
- Real-time chat functionality

### Known Issues
- Portfolio endpoints return empty arrays (implementation pending)
- Some subscription features incomplete
- Chat system not yet implemented