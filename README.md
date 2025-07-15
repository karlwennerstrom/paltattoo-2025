# PalTattoo - Plataforma de Conexión entre Clientes y Tatuadores

[![Estado del Proyecto](https://img.shields.io/badge/Estado-En%20Desarrollo%20(75%25)-yellow)]()
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)]()
[![React](https://img.shields.io/badge/React-18.x-blue)]()
[![MySQL](https://img.shields.io/badge/MySQL-8.x-orange)]()

PalTattoo es una plataforma moderna que conecta clientes que buscan tatuajes con tatuadores profesionales en Chile. Permite a los clientes publicar solicitudes de tatuajes y a los artistas enviar propuestas, facilitando la comunicación y contratación de servicios de tatuaje.

## 🌟 Características Principales

### ✅ Funcionalidades Implementadas

- **Sistema de Autenticación Completo**
  - Registro e inicio de sesión local
  - Integración con Google OAuth 2.0
  - Roles diferenciados (Cliente/Artista)
  - Sistema de perfiles de usuario

- **Gestión de Ofertas de Tatuaje**
  - Clientes pueden crear solicitudes detalladas
  - Sistema de filtros avanzados
  - Carga de imágenes de referencia
  - Estados de oferta (activa, completada, cancelada)

- **Sistema de Propuestas**
  - Artistas pueden enviar propuestas a ofertas
  - Gestión de precios y tiempos estimados
  - Sistema de aceptación/rechazo
  - Notificaciones por email

- **Perfiles de Artistas**
  - Información del estudio y experiencia
  - Portfolio de trabajos realizados
  - Sistema de verificación
  - Gestión de estilos especializados

- **Panel de Administración para Artistas**
  - Dashboard con estadísticas
  - Gestión de propuestas
  - Calendario de citas
  - Configuración de disponibilidad

- **Sistema de Pagos y Suscripciones**
  - Planes de suscripción para artistas
  - Integración preparada para MercadoPago
  - Gestión de facturas e historial

- **Diseño Moderno y Responsivo**
  - Tema oscuro inspirado en Neon.com
  - Efectos de cristal y resplandor neón
  - Adaptable a dispositivos móviles
  - Interfaz intuitiva y moderna

### 📊 Estado del Proyecto (75% Completado)

#### ✅ Backend - Completado
- API RESTful con Node.js y Express
- Base de datos MySQL con esquema completo
- Autenticación JWT y Google OAuth
- Sistema de archivos con Multer
- Notificaciones por email con Nodemailer
- Validación de datos con express-validator
- Manejo de errores centralizado

#### ✅ Frontend - En su mayoría completado
- Aplicación React con diseño moderno
- Gestión de estado con Context API
- Rutas protegidas y navegación
- Formularios y validación
- Integración completa con backend API

#### 🔄 En Desarrollo
- Sistema de portfolio de artistas
- Integración completa de pagos
- Sistema de reseñas y calificaciones
- Chat en tiempo real
- Optimización de rendimiento

#### ⏳ Pendiente
- Testing automatizado
- Documentación de API
- Configuración de deployment
- Optimización SEO
- Análisis de datos

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** 18.x o superior
- **MySQL** 8.x o superior
- **npm** o **yarn**
- **Git**

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/paltattoo.git
cd paltattoo
```

### 2. Configurar Variables de Entorno

#### Backend
```bash
cd backend
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones locales (ver sección de Variables de Entorno).

#### Frontend
```bash
cd ../frontend
cp .env.example .env
```

### 3. Configurar Base de Datos

```bash
# Importar el esquema y datos de ejemplo
mysql -u root -p < database/paltattoo_database.sql
```

### 4. Instalar Dependencias

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### 5. Ejecutar en Desarrollo

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

La aplicación estará disponible en:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔧 Variables de Entorno

### Backend (.env)

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de Datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=paltattoo

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# MercadoPago (Opcional)
MERCADOPAGO_ACCESS_TOKEN=tu_mercadopago_token
MERCADOPAGO_PUBLIC_KEY=tu_mercadopago_public_key
```

### Frontend (.env)

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_IMAGES_BASE_URL=http://localhost:5000/uploads

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=tu_google_client_id

# Configuración de Funcionalidades
REACT_APP_ENABLE_GOOGLE_AUTH=true
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_CHAT=true
REACT_APP_ENABLE_SUBSCRIPTIONS=true
```

## 📁 Estructura del Proyecto

```
paltattoo/
├── backend/                    # API Node.js
│   ├── config/                # Configuraciones
│   ├── controllers/           # Controladores de rutas
│   ├── middleware/            # Middlewares
│   ├── models/               # Modelos de base de datos
│   ├── routes/               # Definición de rutas
│   ├── services/             # Servicios externos
│   ├── uploads/              # Archivos subidos
│   └── server.js             # Punto de entrada
├── frontend/                  # Aplicación React
│   ├── public/               # Archivos estáticos
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── contexts/         # Contextos de React
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # Servicios API
│   │   └── utils/           # Utilidades
├── database/                 # Scripts de base de datos
└── docs/                    # Documentación
```

## 🗄️ Esquema de Base de Datos

La base de datos incluye las siguientes tablas principales:

- **users** - Usuarios del sistema
- **clients** - Información específica de clientes
- **tattoo_artists** - Información específica de artistas
- **tattoo_offers** - Solicitudes de tatuajes
- **proposals** - Propuestas de artistas
- **portfolio_images** - Portfolio de artistas
- **subscriptions** - Suscripciones de artistas
- **appointments** - Citas programadas
- **comunas** - Ubicaciones geográficas
- **tattoo_styles** - Estilos de tatuaje
- **body_parts** - Partes del cuerpo

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil
- `GET /api/auth/google` - OAuth con Google

### Ofertas
- `GET /api/offers` - Listar ofertas
- `POST /api/offers` - Crear oferta
- `GET /api/offers/:id` - Obtener oferta específica
- `POST /api/offers/:id/proposals` - Enviar propuesta

### Artistas
- `GET /api/artists` - Listar artistas
- `GET /api/artists/:id` - Obtener artista específico
- `PUT /api/artists/profile` - Actualizar perfil de artista

### Estadísticas
- `GET /api/stats/general` - Estadísticas generales
- `GET /api/stats/artist` - Estadísticas de artista

### Suscripciones
- `GET /api/subscriptions/plans` - Planes disponibles
- `POST /api/subscriptions/subscribe` - Suscribirse a plan

## 🎨 Características de Diseño

- **Tema Oscuro Moderno**: Inspirado en Neon.com
- **Efectos Visuales**: Glassmorphism y efectos de resplandor neón
- **Paleta de Colores**: Negro, grises y verde neón (#00ff88)
- **Tipografía**: Fuentes modernas y legibles
- **Responsivo**: Adaptado para móvil, tablet y desktop

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Preparación para Producción

1. **Configurar variables de entorno de producción**
2. **Construir frontend**:
   ```bash
   cd frontend
   npm run build
   ```
3. **Configurar servidor web** (Nginx recomendado)
4. **Configurar base de datos de producción**
5. **Configurar SSL/HTTPS**

### Variables de Entorno de Producción

Asegúrate de actualizar:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD` para producción
- `JWT_SECRET` con un valor seguro
- `FRONTEND_URL` con tu dominio
- Configuraciones de email y OAuth

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Notas de Desarrollo

### Cuentas de Prueba

```
Cliente de prueba:
Email: test@test.com
Password: password123

Artista de prueba:
Email: artist@test.com
Password: password123
```

### Comandos Útiles

```bash
# Reiniciar base de datos
npm run db:reset

# Generar datos de prueba
npm run db:seed

# Verificar estado de API
curl http://localhost:5000/api/offers
```

## 🐛 Problemas Conocidos

1. **Portfolio de Artistas**: Actualmente retorna array vacío (en desarrollo)
2. **Integración de Pagos**: MercadoPago en configuración
3. **Chat en Tiempo Real**: Pendiente implementación con Socket.io
4. **Optimización de Imágenes**: Pendiente implementación de redimensionado

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa los [Issues existentes](https://github.com/tu-usuario/paltattoo/issues)
2. Crea un nuevo Issue con detalles del problema
3. Contacta al equipo de desarrollo

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🎯 Roadmap

### Versión 1.0 (Próximamente)
- [ ] Sistema completo de portfolio
- [ ] Integración de pagos funcional
- [ ] Sistema de reseñas
- [ ] Testing completo

### Versión 1.1
- [ ] Chat en tiempo real
- [ ] Notificaciones push
- [ ] App móvil
- [ ] Panel de admin avanzado

### Versión 2.0
- [ ] IA para matching cliente-artista
- [ ] Realidad aumentada para preview
- [ ] Marketplace de diseños
- [ ] Múltiples idiomas

---

⚡ **Desarrollado con ❤️ para la comunidad de tatuajes en Chile**