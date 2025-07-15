# 🛠️ PalTattoo - Guía de Desarrollo

## 📋 Índice

1. [Configuración Inicial](#configuración-inicial)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [API Documentation](#api-documentation)
4. [Base de Datos](#base-de-datos)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

## 🚀 Configuración Inicial

### Instalación Rápida

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/paltattoo.git
cd paltattoo

# Ejecutar script de instalación
./install.sh
```

### Instalación Manual

1. **Instalar dependencias del backend:**
   ```bash
   cd backend
   npm install
   ```

2. **Instalar dependencias del frontend:**
   ```bash
   cd frontend
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

4. **Configurar base de datos:**
   ```bash
   mysql -u root -p < database/setup.sql
   mysql -u root -p < database/seed_data.sql
   ```

### Ejecutar en Desarrollo

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

## 📁 Estructura del Proyecto

```
paltattoo/
├── backend/                    # API Node.js + Express
│   ├── config/                # Configuraciones (DB, JWT, Multer, etc.)
│   │   ├── database.js        # Configuración MySQL
│   │   ├── jwt.js             # Configuración JWT
│   │   ├── multer.js          # Configuración uploads
│   │   └── passport.js        # Configuración OAuth
│   ├── controllers/           # Lógica de negocio
│   │   ├── authController.js  # Autenticación
│   │   ├── proposalController.js
│   │   └── ...
│   ├── middleware/           # Middlewares
│   │   ├── auth.js           # Autenticación JWT
│   │   ├── validation.js     # Validación de datos
│   │   └── errorHandler.js   # Manejo de errores
│   ├── models/              # Modelos de datos
│   │   ├── User.js          # Modelo de usuarios
│   │   ├── TattooArtist.js  # Modelo de artistas
│   │   └── ...
│   ├── routes/              # Definición de rutas
│   │   ├── auth.js          # Rutas de autenticación
│   │   ├── artists.js       # Rutas de artistas
│   │   └── ...
│   ├── services/            # Servicios externos
│   │   ├── emailService.js  # Servicio de email
│   │   └── ...
│   ├── uploads/             # Archivos subidos
│   └── server.js            # Punto de entrada
├── frontend/                # Aplicación React
│   ├── public/              # Archivos estáticos
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   │   ├── common/      # Componentes reutilizables
│   │   │   ├── artist/      # Componentes específicos de artistas
│   │   │   └── ...
│   │   ├── contexts/        # Contextos de React
│   │   │   └── AuthContext.js
│   │   ├── pages/           # Páginas principales
│   │   │   ├── auth/        # Páginas de autenticación
│   │   │   ├── feed/        # Feed de ofertas
│   │   │   └── ...
│   │   ├── services/        # Servicios API
│   │   │   └── api.js       # Cliente API central
│   │   ├── utils/           # Utilidades
│   │   └── App.js           # Componente principal
├── database/                # Scripts de base de datos
│   ├── setup.sql            # Esquema de base de datos
│   ├── seed_data.sql        # Datos de ejemplo
│   └── export_current.sh    # Script de exportación
└── docs/                    # Documentación
```

## 🔌 API Documentation

### Endpoints Principales

#### Autenticación
```
POST   /api/auth/register     # Registro de usuario
POST   /api/auth/login        # Inicio de sesión
GET    /api/auth/profile      # Obtener perfil
PUT    /api/auth/profile      # Actualizar perfil
GET    /api/auth/google       # OAuth Google
GET    /api/auth/google/callback
```

#### Ofertas
```
GET    /api/offers            # Listar ofertas
POST   /api/offers            # Crear oferta
GET    /api/offers/:id        # Obtener oferta específica
PUT    /api/offers/:id        # Actualizar oferta
DELETE /api/offers/:id        # Eliminar oferta
POST   /api/offers/:id/references  # Subir referencias
```

#### Propuestas
```
GET    /api/proposals/artist  # Propuestas del artista
POST   /api/offers/:id/proposals  # Enviar propuesta
PUT    /api/proposals/:id     # Actualizar propuesta
PUT    /api/proposals/:id/status  # Cambiar estado
DELETE /api/proposals/:id     # Eliminar propuesta
```

#### Artistas
```
GET    /api/artists           # Listar artistas
GET    /api/artists/:id       # Obtener artista específico
PUT    /api/artists/profile   # Actualizar perfil de artista
POST   /api/artists/portfolio # Agregar al portfolio
```

#### Estadísticas
```
GET    /api/stats/general     # Estadísticas generales
GET    /api/stats/artist      # Estadísticas de artista
```

#### Suscripciones
```
GET    /api/subscriptions/plans        # Planes disponibles
GET    /api/subscriptions/my-subscription
POST   /api/subscriptions/subscribe
POST   /api/subscriptions/cancel
```

### Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Incluir el token en el header:

```javascript
Authorization: Bearer <token>
```

### Códigos de Estado

- `200` - Éxito
- `201` - Creado
- `400` - Error de validación
- `401` - No autenticado
- `403` - Sin permisos
- `404` - No encontrado
- `409` - Conflicto (ej. email duplicado)
- `500` - Error del servidor

## 🗄️ Base de Datos

### Esquema Principal

#### Usuarios y Perfiles
- `users` - Información básica de usuarios
- `user_profiles` - Información detallada de perfiles
- `clients` - Información específica de clientes
- `tattoo_artists` - Información específica de artistas

#### Catálogos
- `tattoo_styles` - Estilos de tatuaje
- `body_parts` - Partes del cuerpo
- `color_types` - Tipos de color
- `comunas` - Ubicaciones geográficas

#### Ofertas y Propuestas
- `tattoo_offers` - Solicitudes de tatuajes
- `offer_references` - Imágenes de referencia
- `proposals` - Propuestas de artistas

#### Portfolio y Media
- `portfolio_images` - Portfolio de artistas
- `artist_styles` - Relación artista-estilo

#### Sistema de Pagos
- `subscription_plans` - Planes de suscripción
- `subscriptions` - Suscripciones activas
- `payments` - Historial de pagos

### Comandos Útiles

```bash
# Exportar base de datos
./database/export_current.sh

# Resetear base de datos
mysql -u root -p -e "DROP DATABASE IF EXISTS paltattoo;"
mysql -u root -p < database/setup.sql
mysql -u root -p < database/seed_data.sql

# Backup de base de datos
mysqldump -u root -p paltattoo > backup_$(date +%Y%m%d).sql
```

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm test                    # Ejecutar todos los tests
npm run test:watch         # Ejecutar tests en modo watch
npm run test:coverage      # Generar reporte de cobertura
```

### Frontend Testing

```bash
cd frontend
npm test                   # Ejecutar tests de componentes
npm run test:e2e          # Tests end-to-end
npm run test:coverage     # Reporte de cobertura
```

### Tests Manuales

#### Cuentas de Prueba
```
Cliente:
Email: test@test.com
Password: password123

Artista:
Email: artist@test.com
Password: password123
```

#### Endpoints de Prueba
```bash
# Verificar API
curl http://localhost:5000/api/offers

# Verificar autenticación
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/stats/artist
```

## 🚀 Deployment

### Preparación para Producción

1. **Variables de Entorno de Producción:**
   ```bash
   # Backend
   NODE_ENV=production
   DB_HOST=tu-servidor-mysql
   JWT_SECRET=clave-muy-segura
   FRONTEND_URL=https://tu-dominio.com
   
   # Frontend
   REACT_APP_API_URL=https://api.tu-dominio.com/api
   ```

2. **Build del Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Configuración del Servidor:**
   - Nginx para servir archivos estáticos
   - PM2 para gestión de procesos Node.js
   - SSL/HTTPS con Let's Encrypt

### Configuración de Nginx

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    # Frontend
    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Uploads
    location /uploads {
        alias /path/to/backend/uploads;
    }
}
```

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'paltattoo-backend',
    script: 'server.js',
    cwd: './backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

## 🔧 Troubleshooting

### Problemas Comunes

#### Error de Conexión a Base de Datos
```bash
# Verificar conexión MySQL
mysql -u root -p -e "SELECT 1;"

# Verificar configuración en .env
cat backend/.env | grep DB_
```

#### Error de CORS
```javascript
// En backend/server.js, verificar configuración CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

#### Error de Autenticación JWT
```bash
# Verificar JWT_SECRET en .env
cat backend/.env | grep JWT_SECRET

# Verificar formato del token
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/auth/profile
```

#### Problemas con Uploads
```bash
# Verificar permisos de directorio
ls -la backend/uploads/

# Crear directorios si no existen
mkdir -p backend/uploads/{avatars,portfolio,references}
chmod 755 backend/uploads/
```

### Logs y Debugging

#### Backend Logs
```bash
# Ver logs en tiempo real
tail -f backend/logs/app.log

# Logs de PM2 en producción
pm2 logs paltattoo-backend
```

#### Frontend Debugging
```javascript
// Habilitar debugging en .env
REACT_APP_DEBUG_MODE=true

// En componentes
console.log('Debug info:', data);
```

### Comandos de Diagnóstico

```bash
# Verificar puertos en uso
netstat -tlnp | grep :5000
netstat -tlnp | grep :3000

# Verificar procesos Node.js
ps aux | grep node

# Verificar espacio en disco
df -h

# Verificar logs del sistema
tail -f /var/log/nginx/error.log
tail -f /var/log/mysql/error.log
```

## 📝 Contribución

### Workflow de Desarrollo

1. **Fork del repositorio**
2. **Crear rama para feature:**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
3. **Desarrollar y hacer commits:**
   ```bash
   git add .
   git commit -m "feat: agregar nueva funcionalidad"
   ```
4. **Push y crear Pull Request**

### Estándares de Código

- **ESLint** para JavaScript/React
- **Prettier** para formateo
- **Commits** siguiendo Conventional Commits
- **Testing** obligatorio para nuevas features

### Estructura de Commits

```
feat: nueva funcionalidad
fix: corrección de bug
docs: actualización de documentación
style: cambios de formato
refactor: refactoring de código
test: agregar o corregir tests
chore: tareas de mantenimiento
```

## 🎯 Roadmap de Desarrollo

### Próximas Versiones

#### v1.0.0 - MVP Completo
- [ ] Sistema completo de portfolio
- [ ] Integración de pagos funcional
- [ ] Sistema de reseñas
- [ ] Testing completo

#### v1.1.0 - Funcionalidades Avanzadas
- [ ] Chat en tiempo real
- [ ] Notificaciones push
- [ ] App móvil React Native
- [ ] Panel de admin avanzado

#### v2.0.0 - IA y AR
- [ ] IA para matching cliente-artista
- [ ] Realidad aumentada para preview
- [ ] Marketplace de diseños
- [ ] Múltiples idiomas

---

Para más información, consulta la [documentación principal](./README.md) o contacta al equipo de desarrollo.