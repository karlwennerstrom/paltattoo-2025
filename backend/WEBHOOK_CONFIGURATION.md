# 🔧 Configuración Completa del Webhook de MercadoPago

## ✅ Ya Completado
- ✅ Webhook configurado en MercadoPago
- ✅ Clave secreta generada: `ecb1a476c629bde840e17424a9137c0bd575e01b86f2527ae5f0bec72ef50800`
- ✅ Eventos seleccionados: Pagos y Planes y Suscripciones
- ✅ Validación de firma implementada en el código

## 🔄 Próximos Pasos

### 1. Agregar la Clave Secreta a tu Servidor

**En tu plataforma de hosting (Railway/Render/etc), agrega esta variable de entorno:**

```bash
MERCADOPAGO_WEBHOOK_SECRET=ecb1a476c629bde840e17424a9137c0bd575e01b86f2527ae5f0bec72ef50800
```

### 2. Verificar la Configuración

Una vez agregada la variable, verifica que todo esté configurado correctamente:

**URL de prueba:** https://paltattoo-backend.onrender.com/api/payments/webhook/test

La respuesta debe mostrar:
```json
{
  "status": "ok",
  "webhookConfig": {
    "hasSecret": true,
    "secretPreview": "ecb1a476...",
    "signatureValidation": "enabled"
  }
}
```

### 3. Prueba con un Pago Real

1. **Crea una nueva suscripción** desde el frontend
2. **Completa el pago** en MercadoPago
3. **Verifica automáticamente** que la suscripción se active

### 4. Monitoreo de Logs

Los logs del webhook ahora incluyen:
- ✅ Validación de firma
- 📊 Headers completos de MercadoPago
- 🔍 Métodos de búsqueda de suscripción
- ⚡ Tiempos de procesamiento

## 🛠️ Debugging

### Si el webhook no funciona:

1. **Verifica la URL en MercadoPago:**
   - URL: `https://paltattoo-backend.onrender.com/api/payments/webhook`
   - Estado: Activo
   - Eventos: payment, preapproval

2. **Verifica las variables de entorno:**
   ```bash
   MERCADOPAGO_WEBHOOK_SECRET=ecb1a476c629bde840e17424a9137c0bd575e01b86f2527ae5f0bec72ef50800
   NODE_ENV=production
   ```

3. **Revisa los logs del servidor** para ver si llegan las notificaciones

### Test Manual del Webhook

```bash
node test-webhook-complete.js
```

## 🔒 Seguridad

- ✅ Validación de firma HMAC-SHA256
- ✅ Verificación de timestamp y request-id
- ✅ Solo webhooks firmados son procesados en producción
- ✅ Logs detallados para auditoria

## 📈 Flujo Completo Esperado

1. **Usuario paga** → MercadoPago procesa
2. **MercadoPago envía webhook** → Backend recibe y valida firma
3. **Webhook procesa pago** → Busca y activa suscripción
4. **Usuario automáticamente** → Ve su plan activado
5. **Email enviado** → Confirmación de activación

## ⚠️ Importante

- La validación de firma **solo está activa en producción**
- En desarrollo, el webhook funciona sin validación para testing
- Guarda la clave secreta de forma segura
- No compartas la clave secreta en el código fuente