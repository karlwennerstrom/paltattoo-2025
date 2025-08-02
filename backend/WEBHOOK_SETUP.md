# Configuración del Webhook de MercadoPago

## ⚠️ IMPORTANTE: El webhook no se activa automáticamente después del pago

### Problema Actual
Los pagos se procesan correctamente pero el webhook de MercadoPago no se ejecuta automáticamente para activar las suscripciones.

### Solución: Configurar Webhook en MercadoPago

1. **Accede a tu panel de MercadoPago**
   - URL: https://www.mercadopago.cl/developers/panel/app/[TU_APP_ID]/webhooks

2. **Configura la URL del webhook**
   ```
   URL: https://paltattoo-backend.onrender.com/api/payments/webhook
   Eventos: payment, preapproval
   ```

3. **Verifica que el webhook esté activo**
   - Estado: Activo
   - Modo: Producción

4. **Test del webhook**
   - Endpoint de test: GET https://paltattoo-backend.onrender.com/api/payments/webhook/test
   - Debe retornar: `{"status":"ok","message":"Webhook endpoint is accessible"}`

### Solución Temporal (Manual)
Mientras configuras el webhook, puedes activar manualmente las suscripciones:

1. En la base de datos, busca la suscripción pendiente:
   ```sql
   SELECT * FROM user_subscriptions WHERE user_id = [USER_ID] AND status = 'pending' ORDER BY created_at DESC;
   ```

2. Activa la suscripción:
   ```sql
   UPDATE user_subscriptions 
   SET status = 'authorized', 
       start_date = CURDATE(), 
       next_payment_date = DATE_ADD(CURDATE(), INTERVAL 30 DAY)
   WHERE id = [SUBSCRIPTION_ID];
   ```

### Logs para Debugging
El webhook ahora incluye logs detallados:
- Headers recibidos
- Body completo del request
- Métodos de búsqueda de suscripción
- Errores detallados

### Verificación del Token de MercadoPago
Asegúrate de que tienes el token correcto en las variables de entorno:
```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-2420278478851432-010220-de6b3a3c5e7b8f9c6d8e7f0a1b2c3d4e-183050733
```

### URLs de MercadoPago para Configuración
- Panel de aplicaciones: https://www.mercadopago.cl/developers/panel
- Configuración de webhooks: https://www.mercadopago.cl/developers/panel/app/5698143216134280/webhooks
- Documentación: https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks