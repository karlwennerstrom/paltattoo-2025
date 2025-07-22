import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiClock } from 'react-icons/fi';
import Button from '../components/common/Button';
import { Card } from '../components/common/Layout';

const SubscriptionPending = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-warning-500 rounded-full flex items-center justify-center">
              <FiClock className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-primary-100 mb-4">
            Pago Pendiente
          </h1>
          
          <p className="text-primary-300 mb-8">
            Tu pago está siendo procesado. Te notificaremos por correo electrónico cuando esté completado.
          </p>
          
          <div className="bg-primary-800 p-4 rounded-lg mb-8 text-left">
            <h3 className="font-semibold text-primary-200 mb-2">
              ¿Qué sucede ahora?
            </h3>
            <ul className="text-sm text-primary-400 space-y-1">
              <li>• El pago puede tardar hasta 48 horas en procesarse</li>
              <li>• Recibirás un correo cuando esté confirmado</li>
              <li>• Tu suscripción se activará automáticamente</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/artist/subscription')}
            >
              Ver Estado de Suscripción
            </Button>
            
            <Button
              variant="ghost"
              fullWidth
              onClick={() => navigate('/artist/dashboard')}
            >
              Ir al Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionPending;