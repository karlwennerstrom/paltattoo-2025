# Guía de Despliegue en Railway

## Pasos para Desplegar PalTattoo en Railway

### 1. Crear cuenta en Railway
- Ve a [railway.app](https://railway.app)
- Registrate con GitHub

### 2. Configurar Base de Datos MySQL
1. En Railway Dashboard, click "New Project"
2. Selecciona "Add MySQL" 
3. Anota las credenciales que aparecen en Variables

### 3. Importar Base de Datos
1. Ve a la consola MySQL en Railway
2. Copia y pega el contenido de `database/railway_setup.sql`
3. Si tienes datos existentes, importa también `database/tattoo_connect_export.sql`

### 4. Desplegar Backend
1. En Railway, click "New Service" → "GitHub Repo"
2. Selecciona tu repositorio
3. Configura estas variables de entorno:

**Variables de Entorno - Backend:**
```
NODE_ENV=production
DB_HOST=[MySQL_HOST_from_Railway]
DB_USER=[MySQL_USER_from_Railway] 
DB_PASSWORD=[MySQL_PASSWORD_from_Railway]
DB_NAME=[MySQL_DATABASE_from_Railway]
JWT_SECRET=[genera_una_clave_secreta]
SESSION_SECRET=[genera_otra_clave_secreta]
FRONTEND_URL=[URL_del_frontend_en_Railway]
RAILWAY_VOLUME_MOUNT_PATH=/data
GOOGLE_CLIENT_ID=[tu_google_client_id]
GOOGLE_CLIENT_SECRET=[tu_google_client_secret]
EMAIL_USER=[tu_email_smtp]
EMAIL_PASSWORD=[tu_password_smtp]
```

4. En Settings → Volume:
   - Crear volumen con mount path: `/data`
   - Size: 1GB (ajustable según necesidad)

### 5. Desplegar Frontend
1. Crear nuevo servicio desde el mismo repositorio
2. Configurar variables de entorno:

**Variables de Entorno - Frontend:**
```
REACT_APP_API_URL=[URL_del_backend]/api
REACT_APP_GOOGLE_CLIENT_ID=[tu_google_client_id]
```

3. En Settings → Root Directory: 
   - Cambiar a `frontend`

### 6. Configurar Dominio
- Railway te dará URLs automáticas tipo:
  - Backend: `https://backend-production-xxx.up.railway.app`
  - Frontend: `https://frontend-production-xxx.up.railway.app`

### 7. Actualizar CORS y URLs
- Una vez desplegado, actualiza `FRONTEND_URL` en backend
- Verifica que `REACT_APP_API_URL` apunte al backend correcto

### 8. Verificar Funcionamiento
1. Ve al frontend URL
2. Registra una cuenta
3. Prueba subir imágenes (se guardarán en Railway Volume)
4. Verifica conexión con base de datos

## Comandos Útiles

### Para desarrollo local con variables de Railway:
```bash
# Backend
cd backend
railway run npm run dev

# Frontend  
cd frontend
railway run npm start
```

### Para ver logs:
```bash
railway logs
```

## Monitoreo
- Railway Dashboard muestra uso de CPU, memoria, storage
- Puedes configurar alerts para limits

## Costos Estimados
- Starter Plan: $5/mes por servicio
- MySQL: Incluido en Starter
- Volume: $0.25/GB/mes

## Troubleshooting

### Si las imágenes no se muestran:
- Verifica que `RAILWAY_VOLUME_MOUNT_PATH=/data` esté configurado
- Confirma que el volumen esté montado en `/data`
- Revisa logs del backend

### Si hay errores de CORS:
- Verifica que `FRONTEND_URL` esté configurado correctamente
- Confirma que ambos servicios usen HTTPS

### Si la base de datos no conecta:
- Revisa las variables `DB_*` 
- Confirma que MySQL esté en la misma región
- Verifica firewall rules en Railway