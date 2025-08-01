import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';
import Button from '../components/common/Button';
import { Card } from '../components/common/Layout';

const SubscriptionFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const errorMessage = searchParams.get('error') || 'El pago no pudo ser procesado';

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-error-500 rounded-full flex items-center justify-center">
              <FiXCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-primary-100 mb-4">
            Pago Rechazado
          </h1>
          
          <p className="text-primary-300 mb-4">
            Lo sentimos, no pudimos procesar tu pago.
          </p>
          
          <p className="text-error-400 text-sm mb-8">
            {errorMessage}
          </p>
          
          <div className="space-y-3">
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/artist/subscription')}
            >
              Intentar Nuevamente
            </Button>
            
            <Button
              variant="ghost"
              fullWidth
              onClick={() => navigate('/artist')}
            >
              Volver al Dashboard
            </Button>
          </div>
          
          <p className="text-sm text-primary-400 mt-6">
            Si el problema persiste, por favor{' '}
            <a href="/contact" className="text-accent-400 hover:text-accent-300">
              contáctanos
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionFailure;