import React, { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { twMerge } from 'tailwind-merge';
import { Card } from '../common/Layout';
import Button from '../common/Button';
import { paymentService } from '../../services/api';
import toast from 'react-hot-toast';
import { FiCreditCard, FiShield, FiCheck } from 'react-icons/fi';

const MercadoPagoCheckout = ({ 
  planId, 
  planName, 
  planPrice, 
  onSuccess, 
  onCancel,
  className 
}) => {
  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    email: '',
    docType: 'CI',
    docNumber: ''
  });

  useEffect(() => {
    // Initialize MercadoPago with your public key
    initMercadoPago(process.env.REACT_APP_MERCADOPAGO_PUBLIC_KEY || 'TEST-c8dd9825-5d5c-4ad1-847e-5bb1c1c3ae2b');
  }, []);

  const createPreference = async () => {
    try {
      setLoading(true);
      
      // Send only planId as expected by backend
      const subscriptionData = {
        planId: planId
      };

      const response = await paymentService.createSubscription(subscriptionData);
      
      if (response.data?.success && response.data?.data?.initPoint) {
        // Always redirect to simulate real flow
        toast.success('Redirigiendo a MercadoPago...');
        
        // Small delay to show the message
        setTimeout(() => {
          window.location.href = response.data.data.initPoint;
        }, 500);
        
        return;
      } else {
        throw new Error(response.data?.error || 'No se pudo crear la suscripción');
      }
    } catch (error) {
      console.error('Error creating preference:', error);
      toast.error('Error al procesar el pago. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentResult = (result) => {
    console.log('Payment result:', result);
    
    if (result.status === 'approved') {
      setPaymentStatus('success');
      toast.success('¡Pago procesado exitosamente!');
      if (onSuccess) {
        onSuccess(result);
      }
    } else if (result.status === 'rejected') {
      setPaymentStatus('error');
      toast.error('El pago fue rechazado. Verifica tus datos.');
    } else if (result.status === 'pending') {
      setPaymentStatus('pending');
      toast.info('Tu pago está siendo procesado.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleCardInput = (field, value) => {
    setCardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateCardForm = () => {
    const { cardNumber, expiryDate, cvv, cardName, email, docNumber } = cardData;
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Número de tarjeta inválido');
      return false;
    }
    
    if (!expiryDate || expiryDate.length < 5) {
      toast.error('Fecha de vencimiento inválida');
      return false;
    }
    
    if (!cvv || cvv.length < 3) {
      toast.error('CVV inválido');
      return false;
    }
    
    if (!cardName.trim()) {
      toast.error('Nombre del titular es requerido');
      return false;
    }
    
    if (!email.trim() || !email.includes('@')) {
      toast.error('Email inválido');
      return false;
    }
    
    if (!docNumber.trim()) {
      toast.error('Número de documento es requerido');
      return false;
    }
    
    return true;
  };

  const processCardPayment = async () => {
    if (!validateCardForm()) return;
    
    try {
      setLoading(true);
      
      // First, create card token
      const tokenResponse = await paymentService.createCardToken({
        cardData: {
          number: cardData.cardNumber.replace(/\s/g, ''),
          expiryMonth: cardData.expiryDate.split('/')[0],
          expiryYear: '20' + cardData.expiryDate.split('/')[1],
          cvv: cardData.cvv,
          name: cardData.cardName,
          email: cardData.email,
          docType: cardData.docType,
          docNumber: cardData.docNumber
        }
      });
      
      if (!tokenResponse.data?.success) {
        throw new Error('Error al procesar la tarjeta');
      }
      
      const cardToken = tokenResponse.data.data.token;
      
      // Create subscription with card token
      const subscriptionData = {
        planId: planId,
        cardToken: cardToken
      };
      
      const response = await paymentService.createSubscription(subscriptionData);
      
      if (response.data?.success) {
        // If we have an initPoint (development mode), redirect
        if (response.data.data?.initPoint) {
          toast.success('Procesando pago...');
          setTimeout(() => {
            window.location.href = response.data.data.initPoint;
          }, 500);
        } else {
          // Otherwise show success directly
          setPaymentStatus('success');
          toast.success('¡Pago procesado exitosamente!');
          if (onSuccess) {
            onSuccess({ 
              status: 'approved', 
              payment_method: 'credit_card',
              subscription_id: response.data.data.subscriptionId 
            });
          }
        }
      } else {
        throw new Error(response.data?.error || 'Error al procesar el pago');
      }
      
    } catch (error) {
      console.error('Error processing card payment:', error);
      toast.error(error.message || 'Error al procesar el pago con tarjeta');
    } finally {
      setLoading(false);
    }
  };

  if (paymentStatus === 'success') {
    return (
      <Card className={twMerge('p-8 text-center', className)}>
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-primary-100 mb-2">
          ¡Pago Exitoso!
        </h3>
        <p className="text-primary-400 mb-6">
          Tu suscripción al plan {planName} ha sido activada correctamente.
        </p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Continuar
        </Button>
      </Card>
    );
  }

  return (
    <Card className={twMerge('p-6', className)}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-primary-100 mb-2">
          Procesar Pago - Plan {planName}
        </h3>
        <div className="flex items-center justify-between p-4 bg-primary-800 rounded-lg">
          <span className="text-primary-300">Total a pagar:</span>
          <span className="text-xl font-bold text-accent-400">
            {formatCurrency(planPrice)}/mes
          </span>
        </div>
      </div>

      {/* Security badges */}
      <div className="flex items-center justify-center space-x-4 mb-6 p-4 bg-primary-800 rounded-lg">
        <div className="flex items-center space-x-2">
          <FiShield className="h-5 w-5 text-green-400" />
          <span className="text-sm text-primary-300">Pago 100% Seguro</span>
        </div>
        <div className="flex items-center space-x-2">
          <FiCreditCard className="h-5 w-5 text-blue-400" />
          <span className="text-sm text-primary-300">Tarjetas y MercadoPago</span>
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-4">
        {!showCardForm ? (
          <>
            <Button
              variant="primary"
              fullWidth
              onClick={createPreference}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                'Pagar con MercadoPago'
              )}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-primary-900 text-primary-400">o pagar con tarjeta</span>
              </div>
            </div>
            
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setShowCardForm(true)}
              disabled={loading}
            >
              <FiCreditCard className="h-4 w-4 mr-2" />
              Pagar con Tarjeta de Crédito
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            {/* Card Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-1">
                  Número de tarjeta
                </label>
                <input
                  type="text"
                  value={cardData.cardNumber}
                  onChange={(e) => handleCardInput('cardNumber', formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className="w-full px-3 py-2 bg-primary-800 border border-primary-600 rounded-lg text-primary-100 focus:border-accent-500 focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-1">
                    Vencimiento
                  </label>
                  <input
                    type="text"
                    value={cardData.expiryDate}
                    onChange={(e) => handleCardInput('expiryDate', formatExpiryDate(e.target.value))}
                    placeholder="MM/AA"
                    maxLength="5"
                    className="w-full px-3 py-2 bg-primary-800 border border-primary-600 rounded-lg text-primary-100 focus:border-accent-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardData.cvv}
                    onChange={(e) => handleCardInput('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    maxLength="4"
                    className="w-full px-3 py-2 bg-primary-800 border border-primary-600 rounded-lg text-primary-100 focus:border-accent-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-1">
                  Nombre del titular
                </label>
                <input
                  type="text"
                  value={cardData.cardName}
                  onChange={(e) => handleCardInput('cardName', e.target.value)}
                  placeholder="Nombre como aparece en la tarjeta"
                  className="w-full px-3 py-2 bg-primary-800 border border-primary-600 rounded-lg text-primary-100 focus:border-accent-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={cardData.email}
                  onChange={(e) => handleCardInput('email', e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full px-3 py-2 bg-primary-800 border border-primary-600 rounded-lg text-primary-100 focus:border-accent-500 focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-1">
                    Documento
                  </label>
                  <select
                    value={cardData.docType}
                    onChange={(e) => handleCardInput('docType', e.target.value)}
                    className="w-full px-3 py-2 bg-primary-800 border border-primary-600 rounded-lg text-primary-100 focus:border-accent-500 focus:outline-none"
                  >
                    <option value="CI">CI</option>
                    <option value="RUT">RUT</option>
                    <option value="DNI">DNI</option>
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-primary-200 mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    value={cardData.docNumber}
                    onChange={(e) => handleCardInput('docNumber', e.target.value)}
                    placeholder="12345678-9"
                    className="w-full px-3 py-2 bg-primary-800 border border-primary-600 rounded-lg text-primary-100 focus:border-accent-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="ghost"
                onClick={() => setShowCardForm(false)}
                disabled={loading}
                className="flex-1"
              >
                Volver
              </Button>
              <Button
                variant="primary"
                onClick={processCardPayment}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  'Pagar con Tarjeta'
                )}
              </Button>
            </div>
          </div>
        )}
        
        {onCancel && !showCardForm && (
          <Button variant="ghost" fullWidth onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>

      {/* Payment methods info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-primary-500 mb-2">
          Métodos de pago disponibles:
        </p>
        <div className="flex items-center justify-center space-x-3">
          <span className="text-xs bg-primary-700 px-2 py-1 rounded">Visa</span>
          <span className="text-xs bg-primary-700 px-2 py-1 rounded">Mastercard</span>
          <span className="text-xs bg-primary-700 px-2 py-1 rounded">Redcompra</span>
          <span className="text-xs bg-primary-700 px-2 py-1 rounded">Transferencia</span>
        </div>
      </div>
    </Card>
  );
};

export default MercadoPagoCheckout;