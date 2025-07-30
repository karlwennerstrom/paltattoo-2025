import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import MercadoPagoCheckout from '../payments/MercadoPagoCheckout';
import { FiAlertTriangle, FiTrendingUp, FiTrendingDown, FiDollarSign, FiCalendar, FiImage, FiX } from 'react-icons/fi';
import { formatPlanName } from '../../utils/subscriptionHelpers';

const PlanChangeModal = ({ 
  isOpen, 
  onClose, 
  currentPlan, 
  targetPlan, 
  onConfirm,
  loading = false,
  prorationInfo = null // Add proration info from backend
}) => {
  const [agreed, setAgreed] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  if (!currentPlan || !targetPlan) return null;

  const isUpgrade = targetPlan.price > currentPlan.price;
  const isDowngrade = targetPlan.price < currentPlan.price;
  const isSameTier = targetPlan.price === currentPlan.price;
  const isFreeTarget = targetPlan.price === 0;
  const isFreeCurrent = currentPlan.price === 0;

  // Use real proration info from backend if available
  const proratedAmount = prorationInfo?.immediateCharge || 0;
  const hasProrationInfo = !!prorationInfo;

  const getChangeType = () => {
    if (isSameTier) return 'same';
    if (isUpgrade) return 'upgrade';
    if (isDowngrade) return 'downgrade';
    return 'change';
  };

  const getIcon = () => {
    const changeType = getChangeType();
    switch (changeType) {
      case 'upgrade':
        return <FiTrendingUp className="w-8 h-8 text-success-400" />;
      case 'downgrade':
        return <FiTrendingDown className="w-8 h-8 text-warning-400" />;
      case 'same':
        return <FiDollarSign className="w-8 h-8 text-accent-400" />;
      default:
        return <FiAlertTriangle className="w-8 h-8 text-warning-400" />;
    }
  };

  const getTitle = () => {
    const changeType = getChangeType();
    switch (changeType) {
      case 'upgrade':
        return 'Actualizar Plan';
      case 'downgrade':
        return 'Cambiar a Plan Menor';
      case 'same':
        return 'Cambiar Plan';
      default:
        return 'Modificar Suscripción';
    }
  };

  const getWarnings = () => {
    const warnings = [];

    if (isDowngrade) {
      warnings.push({
        icon: FiDollarSign,
        title: 'Sin Devolución de Dinero',
        description: 'No se realizarán devoluciones por el cambio a un plan menor. El tiempo restante del plan actual se perderá.'
      });

      if (!isFreeTarget) {
        warnings.push({
          icon: FiImage,
          title: 'Colecciones Limitadas',
          description: 'Las colecciones que excedan el límite del nuevo plan serán ocultadas y no podrás modificarlas hasta que actualices tu plan.'
        });
      }

      if (isFreeTarget || !targetPlan.features?.calendar) {
        warnings.push({
          icon: FiCalendar,
          title: 'Calendario Desactivado',
          description: 'El sistema de agendamiento se desactivará. Las reservas existentes quedarán desconectadas del sistema.'
        });
      }
    }

    return warnings;
  };

  const warnings = getWarnings();

  const handleConfirm = () => {
    if (isDowngrade && !agreed) return;
    
    // For upgrades that require payment, show payment component
    if (isUpgrade && proratedAmount > 0) {
      setShowPayment(true);
      return;
    }
    
    // For free plans or downgrades, proceed directly
    onConfirm();
  };

  const handlePaymentSuccess = (paymentResult) => {
    // Payment successful, now complete the plan change
    onConfirm(paymentResult);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  // Show payment component for upgrades
  if (showPayment && isUpgrade) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-primary-100">
                Actualizar Plan - Pago Requerido
              </h2>
              <p className="text-sm text-primary-400">
                Cambiar de {formatPlanName(currentPlan.name)} a {formatPlanName(targetPlan.name)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-primary-400 hover:text-primary-200 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <MercadoPagoCheckout
            planId={targetPlan.id}
            planName={formatPlanName(targetPlan.name)}
            planPrice={proratedAmount > 0 ? proratedAmount : targetPlan.price}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {getIcon()}
            <div>
              <h2 className="text-xl font-semibold text-primary-100">
                {getTitle()}
              </h2>
              <p className="text-sm text-primary-400">
                Cambiar de {formatPlanName(currentPlan.name)} a {formatPlanName(targetPlan.name)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-primary-400 hover:text-primary-200 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Comparison */}
        <div className="bg-primary-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-primary-400 mb-1">Plan Actual</p>
              <p className="text-lg font-semibold text-primary-100">
                {formatPlanName(currentPlan.name)}
              </p>
              <p className="text-sm text-primary-300">
                ${currentPlan.price?.toLocaleString('es-CL')}/mes
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-primary-400 mb-1">Nuevo Plan</p>
              <p className="text-lg font-semibold text-accent-400">
                {formatPlanName(targetPlan.name)}
              </p>
              <p className="text-sm text-primary-300">
                ${targetPlan.price?.toLocaleString('es-CL')}/mes
              </p>
            </div>
          </div>
        </div>

        {/* Proration Info */}
        {prorationInfo && (isUpgrade || isDowngrade) && (
          <div className={`border rounded-lg p-4 mb-6 ${
            prorationInfo.isUpgrade 
              ? 'bg-success-900/20 border-success-600/30' 
              : 'bg-warning-900/20 border-warning-600/30'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <FiDollarSign className={`w-5 h-5 ${
                prorationInfo.isUpgrade ? 'text-success-400' : 'text-warning-400'
              }`} />
              <h3 className={`font-medium ${
                prorationInfo.isUpgrade ? 'text-success-400' : 'text-warning-400'
              }`}>
                {prorationInfo.isUpgrade ? 'Cargo Inmediato' : 'Crédito Aplicado'}
              </h3>
            </div>
            
            {/* Description */}
            <p className="text-sm text-primary-300 mb-3">
              {prorationInfo.description}
            </p>
            
            {/* Amount */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-primary-400">
                {prorationInfo.isUpgrade ? 'Monto a pagar ahora:' : 'Crédito aplicado:'}
              </span>
              <span className={`text-lg font-semibold ${
                prorationInfo.isUpgrade ? 'text-success-400' : 'text-warning-400'
              }`}>
                ${Math.abs(proratedAmount).toLocaleString('es-CL')}
              </span>
            </div>
            
            {/* Next billing info */}
            {prorationInfo.details && (
              <div className="pt-3 border-t border-primary-700">
                <div className="flex items-center space-x-2 mb-2">
                  <FiCalendar className="w-4 h-4 text-primary-400" />
                  <span className="text-sm text-primary-400">Próximo cobro:</span>
                </div>
                <p className="text-sm text-primary-300">
                  ${prorationInfo.details.proration.nextBillingAmount.toLocaleString('es-CL')} el {new Date(prorationInfo.details.proration.nextBillingDate).toLocaleDateString('es-CL')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-warning-400 flex items-center">
              <FiAlertTriangle className="w-5 h-5 mr-2" />
              Advertencias Importantes
            </h3>
            {warnings.map((warning, index) => (
              <div key={index} className="bg-warning-900/20 border border-warning-600/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <warning.icon className="w-5 h-5 text-warning-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-warning-400 mb-1">
                      {warning.title}
                    </h4>
                    <p className="text-sm text-primary-300">
                      {warning.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Agreement Checkbox for Downgrades */}
        {isDowngrade && (
          <div className="bg-primary-800 rounded-lg p-4 mb-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-accent-500 bg-primary-700 border-primary-600 rounded focus:ring-accent-500 focus:ring-2"
              />
              <div className="text-sm">
                <p className="text-primary-200 font-medium mb-1">
                  Acepto las condiciones del cambio de plan
                </p>
                <p className="text-primary-400">
                  Entiendo que no habrá devolución de dinero y que algunas funciones pueden ser limitadas o desactivadas.
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={loading || (isDowngrade && !agreed)}
            loading={loading}
            className="flex-1 bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400"
          >
            {isUpgrade 
              ? `Pagar $${proratedAmount > 0 ? proratedAmount.toLocaleString('es-CL') : targetPlan.price.toLocaleString('es-CL')}`
              : isFreeTarget 
                ? 'Cambiar a Plan Gratuito'
                : 'Confirmar Cambio'
            }
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PlanChangeModal;