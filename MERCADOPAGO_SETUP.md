# Configuración de MercadoPago para PalTattoo

## 1. Obtener Credenciales de MercadoPago

### Credenciales de Prueba (Sandbox)
1. Ingresa a [MercadoPago Developers](https://www.mercadopago.cl/developers/panel)
2. Ve a "Credenciales" en el menú lateral
3. Selecciona tu aplicación o crea una nueva
4. Copia las credenciales de **PRUEBA**:
   - Access Token de Prueba
   - Public Key de Prueba

### Credenciales de Producción
1. En la misma sección, selecciona "Credenciales de producción"
2. Completa la información de tu negocio si es necesario
3. Copia las credenciales de **PRODUCCIÓN**:
   - Access Token de Producción
   - Public Key de Producción

## 2. Configurar Variables de Entorno

### Backend (.env)
```env
# MercadoPago - Desarrollo/Pruebas
MERCADOPAGO_ACCESS_TOKEN=TEST-2420278478851432-010220-f91dd4f673b51cc5c8cf80e03b2becd8-183050733
MERCADOPAGO_PUBLIC_KEY=TEST-d7f1cd01-74cf-4b2f-b6f0-e86c9a98fb2d
MERCADOPAGO_TEST_MODE=true

# MercadoPago - Producción (comentar las de arriba y usar estas)
# MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu-access-token-de-produccion
# MERCADOPAGO_PUBLIC_KEY=APP_USR-tu-public-key-de-produccion
# MERCADOPAGO_TEST_MODE=false

# URLs
FRONTEND_URL=https://paltattoo-2025.vercel.app
BACKEND_URL=https://paltattoo-2025-production.up.railway.app
```

### Frontend (.env)
```env
# MercadoPago Public Key
REACT_APP_MERCADOPAGO_PUBLIC_KEY=TEST-d7f1cd01-74cf-4b2f-b6f0-e86c9a98fb2d

# Para producción:
# REACT_APP_MERCADOPAGO_PUBLIC_KEY=APP_USR-tu-public-key-de-produccion
```

## 3. Configurar Webhook (Producción)

1. En el panel de MercadoPago, ve a "Webhooks"
2. Crea un nuevo webhook con la URL:
   ```
   https://paltattoo-2025-production.up.railway.app/api/payments/webhook
   ```
3. Selecciona los eventos:
   - payment.created
   - payment.updated

## 4. Flujo de Pago

### 1. Usuario selecciona un plan
```javascript
// Frontend llama a la API
const response = await api.post('/api/payments/subscription/preference', {
  planId: selectedPlanId,
  subscriptionId: currentSubscriptionId
});
```

### 2. Backend crea preferencia
- Valida usuario y plan
- Crea preferencia en MercadoPago
- Retorna URL de pago

### 3. Usuario es redirigido a MercadoPago
```javascript
// Frontend redirige al usuario
window.location.href = response.data.initPoint;
```

### 4. Después del pago
- **Éxito**: Usuario vuelve a `/dashboard?payment=success`
- **Error**: Usuario vuelve a `/dashboard?payment=failure`
- **Pendiente**: Usuario vuelve a `/dashboard?payment=pending`

### 5. Webhook procesa el pago
- MercadoPago envía notificación al backend
- Backend actualiza el estado de la suscripción
- Se activa el plan del usuario

## 5. Probar en Desarrollo

### Usuarios de Prueba
Usa las [tarjetas de prueba de MercadoPago](https://www.mercadopago.cl/developers/es/docs/checkout-pro/additional-content/test-cards):

**Tarjeta de crédito aprobada:**
- Número: 5031 7557 3453 0604
- Fecha: 11/25
- CVV: 123
- Nombre: APRO
- RUT: 12345678-5

**Tarjeta de crédito rechazada:**
- Número: 5031 7557 3453 0604
- Fecha: 11/25
- CVV: 123
- Nombre: OTHE
- RUT: 12345678-5

## 6. Modo de Prueba Simplificado

Si quieres probar sin integración real de MercadoPago:

1. En el backend, configura:
   ```env
   MERCADOPAGO_TEST_MODE=true
   ```

2. Las suscripciones se activarán automáticamente sin pago real

## 7. Monitoreo

### Logs importantes
- Creación de preferencia: `Creating MercadoPago preference:`
- Webhook recibido: `MercadoPago webhook received:`
- Errores de pago: `Error processing payment:`

### Estados de suscripción
- `pending`: Esperando pago
- `authorized`: Pago aprobado, suscripción activa
- `cancelled`: Suscripción cancelada

## 8. Troubleshooting

### Error: "Invalid credentials"
- Verifica que estés usando las credenciales correctas (test vs producción)
- Asegúrate de que el Access Token esté completo

### Error: "Invalid payer email"
- Verifica que el usuario tenga un email válido en la base de datos

### Webhook no llega
- En desarrollo, usa [webhook.site](https://webhook.site) para debugging
- En producción, verifica que la URL sea accesible públicamente

### Suscripción no se activa
- Revisa los logs del webhook
- Verifica que el external_reference coincida
- Comprueba el estado en la tabla `user_subscriptions`

## 9. Seguridad

- **NUNCA** commits credenciales de producción
- Usa variables de entorno siempre
- Valida las notificaciones del webhook
- Implementa idempotencia en los pagos