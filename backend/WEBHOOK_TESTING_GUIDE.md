# 🧪 Guía de Pruebas del Webhook

## ✅ Ya Probado
- **Conectividad**: Webhook recibe notificaciones ✅
- **Validación de firma**: Funcionando correctamente ✅
- **Logging**: Información detallada ✅
- **Respuesta 200**: MercadoPago recibe confirmación ✅

## 🔄 Próximas Pruebas Recomendadas

### 1. **Prueba con Pago Real** (CRÍTICA)
**Objetivo**: Verificar que los pagos reales activen automáticamente las suscripciones

**Pasos**:
1. Hacer una nueva suscripción desde el frontend
2. Completar el pago con tarjeta real o de prueba
3. Verificar que recibas un webhook de tipo `payment`
4. Confirmar que la suscripción se active automáticamente

**Logs esperados**:
```
Processing payment notification for ID: [REAL_PAYMENT_ID]
External reference parts: ['user', '14', 'plan', '2', '[timestamp]']
Subscription found by external reference: [subscription_object]
Processing approved payment for subscription: [subscription_id]
Subscription activated: [subscription_id]
```

### 2. **Prueba de Tipos de Webhook**
**Objetivo**: Verificar todos los tipos de notificación

**Tipos esperados**:
- ✅ `subscription_preapproval` - Cambios en suscripción
- 🔄 `payment` - Pagos individuales  
- 🔄 `preapproval` - Cambios en preaprobaciones
- 🔄 `authorized_payment` - Pagos recurrentes

### 3. **Prueba de Fallo de Pago**
**Objetivo**: Verificar comportamiento con pagos rechazados

**Escenarios**:
- Tarjeta sin fondos
- Tarjeta vencida
- Datos incorrectos

### 4. **Prueba de Suscripción Cancelada**
**Objetivo**: Verificar que las cancelaciones se reflejen

## 🛠️ Configuración Requerida

### Variables de Entorno Faltantes
```bash
# Agregar a tu plataforma de hosting:
MERCADOPAGO_WEBHOOK_URL=https://paltattoo-backend.onrender.com/api/payments/webhook
```

## 📊 Monitoreo de Webhooks

### Logs a Revisar
1. **Timestamp**: Cuando llega el webhook
2. **Headers**: Verificar x-signature y x-request-id
3. **Body**: Tipo de evento y datos
4. **Processing**: Si se procesó exitosamente
5. **Database**: Si se actualizó la suscripción

### Comandos Útiles para Debugging
```sql
-- Verificar suscripciones recientes
SELECT id, user_id, plan_id, status, created_at, updated_at 
FROM user_subscriptions 
WHERE created_at >= CURDATE() 
ORDER BY created_at DESC;

-- Verificar pagos procesados
SELECT * FROM payment_history 
WHERE created_at >= CURDATE() 
ORDER BY created_at DESC;
```

## 🚨 Qué Hacer Si Falla

### Si no llegan webhooks:
1. Verificar URL en panel MercadoPago
2. Comprobar que el servidor esté accesible
3. Revisar logs del servidor

### Si llegan pero no se procesan:
1. Verificar la validación de firma
2. Comprobar que la suscripción existe en BD
3. Revisar logs de errores en procesamiento

### Si se procesan pero no se activa la suscripción:
1. Verificar external_reference format
2. Comprobar que el payment status sea 'approved'
3. Verificar que el usuario y plan existan

## ✅ Criterios de Éxito

### Webhook Funcionando 100%:
- [x] Recibe notificaciones de MercadoPago
- [x] Valida firma correctamente
- [x] Responde 200 OK
- [ ] Procesa pagos reales automáticamente
- [ ] Activa suscripciones sin intervención manual
- [ ] Envía emails de confirmación
- [ ] Actualiza el frontend automáticamente

## 📈 Estado Actual: 70% Completo
**Siguiente paso crítico**: Prueba con pago real para llegar al 100%