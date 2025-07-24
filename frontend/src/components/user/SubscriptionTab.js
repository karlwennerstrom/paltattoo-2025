import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { FiCreditCard, FiDownload, FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiDollarSign, FiFileText, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';
import { paymentService, subscriptionsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import SubscriptionBadge from '../common/SubscriptionBadge';
import { jsPDF } from 'jspdf';

const SubscriptionTab = () => {
  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [subscriptionChanges, setSubscriptionChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subRes, historyRes, changesRes] = await Promise.all([
        paymentService.getActiveSubscription().catch(() => ({ data: null })),
        paymentService.getPaymentHistoryByUser().catch(() => ({ data: [] })),
        paymentService.getSubscriptionChanges().catch(() => ({ data: [] }))
      ]);
      
      setSubscription(subRes.data);
      setPaymentHistory(historyRes.data);
      setSubscriptionChanges(changesRes.data);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      // Mock data for development
      setSubscription({
        id: 1,
        status: 'authorized',
        plan: {
          id: 2,
          name: 'Plan Pro',
          plan_type: 'premium',
          price: 19990,
          features: ['Portfolio ilimitado', 'Propuestas ilimitadas', 'Analytics avanzado']
        },
        start_date: '2024-01-15',
        end_date: '2024-02-15',
        next_payment_date: '2024-02-15',
        created_at: '2024-01-15'
      });
      
      setPaymentHistory([
        {
          id: 1,
          amount: 19990,
          status: 'approved',
          payment_method: 'credit_card',
          transaction_date: '2024-01-15',
          description: 'Plan Pro - Mensual',
          invoice_url: null,
          mercadopago_payment_id: 'MP123456'
        },
        {
          id: 2,
          amount: 9990,
          status: 'approved',
          payment_method: 'debit_card',
          transaction_date: '2023-12-15',
          description: 'Plan Básico - Mensual',
          invoice_url: null,
          mercadopago_payment_id: 'MP789012'
        },
        {
          id: 3,
          amount: 9990,
          status: 'failed',
          payment_method: 'credit_card',
          transaction_date: '2023-11-15',
          description: 'Plan Básico - Mensual',
          invoice_url: null,
          mercadopago_payment_id: 'MP345678'
        }
      ]);
      
      setSubscriptionChanges([
        {
          id: 1,
          change_type: 'upgrade',
          old_plan_name: 'Plan Básico',
          new_plan_name: 'Plan Pro',
          created_at: '2024-01-15',
          change_reason: 'Upgrade manual'
        },
        {
          id: 2,
          change_type: 'new',
          old_plan_name: null,
          new_plan_name: 'Plan Básico',
          created_at: '2023-10-15',
          change_reason: 'Primera suscripción'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: { color: 'bg-green-600', text: 'Aprobado', icon: FiCheckCircle },
      authorized: { color: 'bg-green-600', text: 'Autorizado', icon: FiCheckCircle },
      pending: { color: 'bg-yellow-600', text: 'Pendiente', icon: FiClock },
      failed: { color: 'bg-red-600', text: 'Fallido', icon: FiXCircle },
      cancelled: { color: 'bg-gray-600', text: 'Cancelado', icon: FiXCircle }
    };
    return badges[status] || badges.pending;
  };

  const getChangeTypeBadge = (changeType) => {
    const badges = {
      upgrade: { color: 'bg-blue-600', text: 'Actualización' },
      downgrade: { color: 'bg-orange-600', text: 'Degradación' },
      cancel: { color: 'bg-red-600', text: 'Cancelación' },
      reactivate: { color: 'bg-green-600', text: 'Reactivación' },
      new: { color: 'bg-purple-600', text: 'Nueva' }
    };
    return badges[changeType] || badges.new;
  };

  const generatePDF = async (payment) => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('COMPROBANTE DE PAGO', 20, 30);
      
      // Company info
      doc.setFontSize(12);
      doc.text('PalTattoo', 20, 50);
      doc.text('Plataforma de Tatuajes', 20, 60);
      doc.text('Chile', 20, 70);
      
      // Payment details
      doc.setFontSize(14);
      doc.text('DETALLES DE LA TRANSACCIÓN', 20, 100);
      
      doc.setFontSize(12);
      doc.text(`ID de Transacción: ${payment.mercadopago_payment_id}`, 20, 120);
      doc.text(`Fecha: ${new Date(payment.transaction_date).toLocaleDateString('es-CL')}`, 20, 135);
      doc.text(`Descripción: ${payment.description}`, 20, 150);
      doc.text(`Método de Pago: ${payment.payment_method === 'credit_card' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}`, 20, 165);
      doc.text(`Estado: ${getStatusBadge(payment.status).text}`, 20, 180);
      
      // Amount
      doc.setFontSize(16);
      doc.text(`TOTAL: ${formatCurrency(payment.amount)}`, 20, 210);
      
      // Footer
      doc.setFontSize(10);
      doc.text('Este es un comprobante generado automáticamente.', 20, 250);
      doc.text(`Generado el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}`, 20, 260);
      
      // Download
      doc.save(`comprobante-${payment.mercadopago_payment_id}.pdf`);
      toast.success('Comprobante descargado exitosamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el comprobante PDF');
    }
  };

  const getDaysUntilExpiration = () => {
    if (!subscription?.end_date) return null;
    
    const endDate = new Date(subscription.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const OverviewSection = () => {
    const daysUntilExpiration = getDaysUntilExpiration();
    
    return (
      <div className="space-y-6">
        {/* Current Subscription Status */}
        <div className="bg-background-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Estado de Suscripción</h3>
            <SubscriptionBadge subscriptionType={subscription?.plan?.plan_type} size="md" />
          </div>
          
          {subscription ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background-primary rounded-lg">
                  <FiCreditCard className="mx-auto mb-2 text-accent-400" size={24} />
                  <p className="text-2xl font-bold text-white">{subscription.plan.name}</p>
                  <p className="text-sm text-gray-400">Plan actual</p>
                </div>
                
                <div className="text-center p-4 bg-background-primary rounded-lg">
                  <FiDollarSign className="mx-auto mb-2 text-accent-400" size={24} />
                  <p className="text-2xl font-bold text-white">{formatCurrency(subscription.plan.price)}</p>
                  <p className="text-sm text-gray-400">Costo mensual</p>
                </div>
                
                <div className="text-center p-4 bg-background-primary rounded-lg">
                  <FiCalendar className="mx-auto mb-2 text-accent-400" size={24} />
                  <p className="text-2xl font-bold text-white">
                    {daysUntilExpiration !== null ? `${daysUntilExpiration} días` : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-400">Hasta renovación</p>
                </div>
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Fecha de inicio:</span>
                  <span className="text-white">
                    {new Date(subscription.start_date).toLocaleDateString('es-CL')}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Fecha de expiración:</span>
                  <span className="text-white">
                    {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString('es-CL') : 'Sin fecha límite'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Próximo pago:</span>
                  <span className="text-white">
                    {subscription.next_payment_date ? new Date(subscription.next_payment_date).toLocaleDateString('es-CL') : 'N/A'}
                  </span>
                </div>
              </div>
              
              {/* Expiration Warning */}
              {daysUntilExpiration !== null && daysUntilExpiration <= 7 && (
                <div className="flex items-center space-x-3 p-4 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg">
                  <FiAlertTriangle className="text-yellow-500" size={20} />
                  <div>
                    <p className="text-yellow-200 font-medium">Tu suscripción expira pronto</p>
                    <p className="text-yellow-300 text-sm">
                      Quedan {daysUntilExpiration} días. Asegúrate de renovar para mantener todos los beneficios.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiCreditCard className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-300 mb-4">No tienes una suscripción activa</p>
              <Button variant="primary">
                Ver Planes Disponibles
              </Button>
            </div>
          )}
        </div>
        
        {/* Recent Activity */}
        <div className="bg-background-card rounded-xl p-6 border border-border">
          <h3 className="text-xl font-semibold text-white mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            {subscriptionChanges.slice(0, 3).map((change) => {
              const badge = getChangeTypeBadge(change.change_type);
              return (
                <div key={change.id} className="flex items-center justify-between p-3 bg-background-primary rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={twMerge('px-2 py-1 rounded text-xs text-white', badge.color)}>
                      {badge.text}
                    </div>
                    <div>
                      <p className="text-white text-sm">
                        {change.change_type === 'new' 
                          ? `Suscripción a ${change.new_plan_name}`
                          : `De ${change.old_plan_name} a ${change.new_plan_name}`
                        }
                      </p>
                      <p className="text-gray-400 text-xs">
                        {new Date(change.created_at).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const PaymentHistorySection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Historial de Transacciones</h3>
          <p className="text-gray-400">Todas tus transacciones y pagos</p>
        </div>
        <Button 
          variant="ghost" 
          onClick={loadSubscriptionData}
          disabled={loadingHistory}
        >
          <FiRefreshCw className={`mr-2 ${loadingHistory ? 'animate-spin' : ''}`} size={16} />
          Actualizar
        </Button>
      </div>
      
      <div className="bg-background-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background-primary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paymentHistory.map((payment) => {
                const statusBadge = getStatusBadge(payment.status);
                const StatusIcon = statusBadge.icon;
                
                return (
                  <tr key={payment.id} className="hover:bg-background-primary transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {new Date(payment.transaction_date).toLocaleDateString('es-CL')}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(payment.transaction_date).toLocaleTimeString('es-CL')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">{payment.description}</div>
                      <div className="text-xs text-gray-400">ID: {payment.mercadopago_payment_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {payment.payment_method === 'credit_card' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={twMerge(
                        'inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-white',
                        statusBadge.color
                      )}>
                        <StatusIcon size={12} />
                        <span>{statusBadge.text}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generatePDF(payment)}
                      >
                        <FiDownload size={14} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {paymentHistory.length === 0 && (
          <div className="text-center py-8">
            <FiFileText className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-300">No hay transacciones registradas</p>
          </div>
        )}
      </div>
    </div>
  );

  const sections = [
    { id: 'overview', label: 'Resumen', component: OverviewSection },
    { id: 'history', label: 'Historial de Pagos', component: PaymentHistorySection }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="flex space-x-1 bg-background-card p-1 rounded-lg w-fit border border-border">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={twMerge(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeSection === section.id
                ? 'bg-accent-600 text-white'
                : 'text-gray-300 hover:text-white'
            )}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      {sections.find(s => s.id === activeSection)?.component()}
    </div>
  );
};

export default SubscriptionTab;