import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { Card } from '../common/Layout';
import Button from '../common/Button';
import Input from '../common/Input';

const ContactInfo = ({ artist, className = '' }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSending(false);
    setSent(true);
    setMessage('');
    
    // Reset sent status after 3 seconds
    setTimeout(() => setSent(false), 3000);
  };

  const contactMethods = [
    {
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Email',
      value: artist?.email || 'contacto@tatuador.com',
      action: 'Enviar email',
      onClick: () => window.location.href = `mailto:${artist?.email || 'contacto@tatuador.com'}`
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      label: 'Teléfono',
      value: artist?.phone || '+56 9 1234 5678',
      action: 'Llamar',
      onClick: () => window.location.href = `tel:${artist?.phone || '+56912345678'}`
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
      label: 'WhatsApp',
      value: artist?.whatsapp || '+56 9 1234 5678',
      action: 'Enviar mensaje',
      onClick: () => window.open(`https://wa.me/${artist?.whatsapp?.replace(/\D/g, '') || '56912345678'}`, '_blank')
    },
    {
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
        </svg>
      ),
      label: 'Instagram',
      value: artist?.instagram || '@tatuador_arte',
      action: 'Ver perfil',
      onClick: () => window.open(`https://instagram.com/${artist?.instagram?.replace('@', '') || 'tatuador_arte'}`, '_blank')
    }
  ];

  const workingHours = artist?.workingHours || {
    monday: { open: '10:00', close: '19:00' },
    tuesday: { open: '10:00', close: '19:00' },
    wednesday: { open: '10:00', close: '19:00' },
    thursday: { open: '10:00', close: '19:00' },
    friday: { open: '10:00', close: '19:00' },
    saturday: { open: '11:00', close: '17:00' },
    sunday: { closed: true }
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  return (
    <div className={twMerge('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
      {/* Contact Methods */}
      <Card title="Información de Contacto">
        <div className="space-y-4">
          {contactMethods.map((method, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-primary-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="text-accent-400">{method.icon}</div>
                <div>
                  <p className="text-xs text-primary-400">{method.label}</p>
                  <p className="text-sm text-primary-100">{method.value}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={method.onClick}>
                {method.action}
              </Button>
            </div>
          ))}
        </div>

        {/* Studio Address */}
        {artist?.studioAddress && (
          <div className="mt-6 p-4 bg-primary-800 rounded-lg">
            <h4 className="text-sm font-semibold text-primary-100 mb-2 flex items-center">
              <svg className="h-4 w-4 mr-2 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ubicación del Estudio
            </h4>
            <p className="text-primary-300 text-sm mb-3">{artist.studioAddress}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              fullWidth
              onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(artist.studioAddress)}`, '_blank')}
            >
              Ver en Google Maps
            </Button>
          </div>
        )}
      </Card>

      {/* Quick Message & Working Hours */}
      <div className="space-y-6">
        {/* Quick Message */}
        <Card title="Mensaje Rápido">
          <form onSubmit={handleSendMessage} className="space-y-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              className="w-full h-32 bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none resize-none"
            />
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={sending}
              disabled={!message.trim() || sending}
            >
              {sent ? 'Mensaje enviado ✓' : 'Enviar Mensaje'}
            </Button>
          </form>
        </Card>

        {/* Working Hours */}
        <Card title="Horario de Atención">
          <div className="space-y-2">
            {daysOfWeek.map((day) => {
              const hours = workingHours[day.key];
              const isClosed = hours?.closed;
              
              return (
                <div key={day.key} className="flex justify-between py-2 border-b border-primary-700 last:border-0">
                  <span className="text-primary-300 text-sm">{day.label}</span>
                  <span className={twMerge(
                    'text-sm',
                    isClosed ? 'text-error-400' : 'text-primary-100'
                  )}>
                    {isClosed ? 'Cerrado' : `${hours?.open || '10:00'} - ${hours?.close || '19:00'}`}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Response Time */}
          <div className="mt-4 p-3 bg-primary-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-primary-300">
                Tiempo de respuesta promedio: <span className="text-primary-100 font-medium">2-4 horas</span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContactInfo;