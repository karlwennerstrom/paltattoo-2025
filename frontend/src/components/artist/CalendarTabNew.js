import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, Grid } from '../common/Layout';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { getProfileImageUrl } from '../../utils/imageHelpers';
import { calendarService } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  FiPlus, FiCalendar, FiClock, FiUser, FiPhone, FiMail, 
  FiEdit, FiTrash2, FiCheck, FiX, FiChevronLeft, FiChevronRight, 
  FiSettings, FiEye 
} from 'react-icons/fi';

const CalendarTab = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month');
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState({});
  
  // Modal states
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [isManagingAvailability, setIsManagingAvailability] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);

  useEffect(() => {
    loadAppointments();
    loadAvailability();
  }, [currentDate]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await calendarService.getAppointments({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });
      
      // Ensure appointments is always an array
      // Backend returns { success: true, data: appointments }
      const appointmentsData = response.data?.data || response.data || [];
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (error) {
      console.log('API not available, using mock data:', error.message);
      setAppointments(getMockAppointments());
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      const response = await calendarService.getAvailability('current');
      setAvailability(response.data || getDefaultAvailability());
    } catch (error) {
      console.log('Availability API not available:', error.message);
      setAvailability(getDefaultAvailability());
    }
  };

  const getMockAppointments = () => [
    {
      id: 1,
      client_name: 'Ana Martínez',
      client_phone: '+56 9 1111 1111',
      client_email: 'ana@email.com',
      title: 'Tatuaje de León Realista',
      appointment_date: '2024-01-22',
      start_time: '15:00',
      end_time: '18:00',
      status: 'confirmed',
      notes: 'Cliente muy puntual, traer referencias adicionales',
      estimated_price: 280000,
      duration_hours: 3
    },
    {
      id: 2,
      client_name: 'Carlos López',
      client_phone: '+56 9 2222 2222',
      client_email: 'carlos@email.com',
      title: 'Consulta Inicial - Retrato',
      appointment_date: '2024-01-23',
      start_time: '10:30',
      end_time: '11:00',
      status: 'confirmed',
      notes: 'Traer fotos de referencia',
      estimated_price: 0,
      duration_hours: 0.5
    },
    {
      id: 3,
      client_name: 'María González',
      client_phone: '+56 9 3333 3333',
      client_email: 'maria@email.com',
      title: 'Mandala Espalda - Continuación',
      appointment_date: '2024-01-25',
      start_time: '16:00',
      end_time: '19:00',
      status: 'scheduled',
      notes: 'Revisar proceso de curación',
      estimated_price: 250000,
      duration_hours: 3
    }
  ];

  const getDefaultAvailability = () => ({
    monday: { available: true, start_time: '09:00', end_time: '18:00', break_start: '13:00', break_end: '14:00' },
    tuesday: { available: true, start_time: '09:00', end_time: '18:00', break_start: '13:00', break_end: '14:00' },
    wednesday: { available: true, start_time: '09:00', end_time: '18:00', break_start: '13:00', break_end: '14:00' },
    thursday: { available: true, start_time: '09:00', end_time: '18:00', break_start: '13:00', break_end: '14:00' },
    friday: { available: true, start_time: '09:00', end_time: '18:00', break_start: '13:00', break_end: '14:00' },
    saturday: { available: true, start_time: '10:00', end_time: '16:00', break_start: '', break_end: '' },
    sunday: { available: false, start_time: '', end_time: '', break_start: '', break_end: '' }
  });

  const handleCreateAppointment = async (appointmentData) => {
    try {
      await calendarService.createAppointment(appointmentData);
      toast.success('Cita creada exitosamente');
      setIsAddingAppointment(false);
      loadAppointments();
    } catch (error) {
      toast.error('Error al crear la cita');
      console.error('Error creating appointment:', error);
    }
  };

  const handleUpdateAppointment = async (id, data) => {
    try {
      await calendarService.updateAppointment(id, data);
      toast.success('Cita actualizada exitosamente');
      setEditingAppointment(null);
      loadAppointments();
    } catch (error) {
      toast.error('Error al actualizar la cita');
    }
  };

  const handleCancelAppointment = async (id) => {
    const reason = prompt('Motivo de la cancelación (opcional):');
    try {
      await calendarService.cancelAppointment(id, reason);
      toast.success('Cita cancelada exitosamente');
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error) {
      toast.error('Error al cancelar la cita');
    }
  };

  const handleCompleteAppointment = async (id) => {
    try {
      await calendarService.completeAppointment(id, { completion_notes: 'Completado satisfactoriamente' });
      toast.success('Cita marcada como completada');
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error) {
      toast.error('Error al completar la cita');
    }
  };

  const handleUpdateAvailability = async (newAvailability) => {
    try {
      await calendarService.updateAvailability(newAvailability);
      toast.success('Disponibilidad actualizada exitosamente');
      setAvailability(newAvailability);
      setIsManagingAvailability(false);
    } catch (error) {
      toast.error('Error al actualizar disponibilidad');
    }
  };

  const getAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    if (!Array.isArray(appointments)) return [];
    return appointments.filter(apt => apt.appointment_date === dateString);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'scheduled': return 'Programada';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Completada';
      default: return 'Pendiente';
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const formatTime = (time) => {
    return time ? time.substring(0, 5) : '';
  };

  const CalendarGrid = () => {
    const days = getDaysInMonth(currentDate);
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-primary-400">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="p-2 h-24"></div>;
          }

          const dayAppointments = getAppointmentsForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();

          return (
            <div
              key={index}
              onClick={() => setSelectedDate(day)}
              className={twMerge(
                'p-2 h-24 border border-primary-700 cursor-pointer hover:bg-primary-800 transition-colors',
                isToday && 'bg-accent-900 border-accent-500',
                isSelected && 'bg-accent-800 border-accent-400'
              )}
            >
              <div className={twMerge(
                'text-sm font-medium mb-1',
                isToday ? 'text-accent-200' : 'text-primary-200'
              )}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayAppointments.slice(0, 2).map(apt => (
                  <div
                    key={apt.id}
                    className={twMerge(
                      'text-xs px-1 py-0.5 rounded text-white truncate',
                      getStatusColor(apt.status)
                    )}
                    title={`${apt.title} - ${formatTime(apt.start_time)}`}
                  >
                    {formatTime(apt.start_time)} {apt.title}
                  </div>
                ))}
                {dayAppointments.length > 2 && (
                  <div className="text-xs text-primary-400">
                    +{dayAppointments.length - 2} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const AppointmentForm = ({ appointment, onSubmit, onCancel, isEditing = false }) => {
    const [formData, setFormData] = useState({
      client_name: appointment?.client_name || '',
      client_phone: appointment?.client_phone || '',
      client_email: appointment?.client_email || '',
      title: appointment?.title || '',
      appointment_date: appointment?.appointment_date || selectedDate?.toISOString().split('T')[0] || '',
      start_time: appointment?.start_time || '',
      end_time: appointment?.end_time || '',
      notes: appointment?.notes || '',
      estimated_price: appointment?.estimated_price || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Grid cols={2} gap={4}>
          <Input
            label="Nombre del cliente"
            value={formData.client_name}
            onChange={(e) => setFormData({...formData, client_name: e.target.value})}
            required
          />
          <Input
            label="Teléfono"
            value={formData.client_phone}
            onChange={(e) => setFormData({...formData, client_phone: e.target.value})}
          />
        </Grid>

        <Input
          label="Email"
          type="email"
          value={formData.client_email}
          onChange={(e) => setFormData({...formData, client_email: e.target.value})}
        />

        <Input
          label="Título de la cita"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />

        <Grid cols={3} gap={4}>
          <Input
            label="Fecha"
            type="date"
            value={formData.appointment_date}
            onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
            required
          />
          <Input
            label="Hora inicio"
            type="time"
            value={formData.start_time}
            onChange={(e) => setFormData({...formData, start_time: e.target.value})}
            required
          />
          <Input
            label="Hora fin"
            type="time"
            value={formData.end_time}
            onChange={(e) => setFormData({...formData, end_time: e.target.value})}
            required
          />
        </Grid>

        <Input
          label="Precio estimado"
          type="number"
          value={formData.estimated_price}
          onChange={(e) => setFormData({...formData, estimated_price: e.target.value})}
          placeholder="0"
        />

        <div>
          <label className="block text-sm font-medium text-primary-300 mb-1">
            Notas
          </label>
          <textarea
            className="input-field w-full h-20"
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Notas adicionales sobre la cita..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            {isEditing ? 'Actualizar' : 'Crear'} Cita
          </Button>
        </div>
      </form>
    );
  };

  if (loading && (!Array.isArray(appointments) || appointments.length === 0)) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-primary-400">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-primary-100">Mi Calendario</h2>
          <p className="text-primary-400">Gestiona tus citas y disponibilidad</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => setIsManagingAvailability(true)}
          >
            <FiSettings className="mr-2" size={16} />
            Disponibilidad
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddingAppointment(true)}
          >
            <FiPlus className="mr-2" size={16} />
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary-100">
            {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth(-1)}
            >
              <FiChevronLeft size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Hoy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth(1)}
            >
              <FiChevronRight size={16} />
            </Button>
          </div>
        </div>

        <CalendarGrid />
      </Card>

      {/* Upcoming Appointments */}
      <Card title="Próximas Citas">
        {!Array.isArray(appointments) || appointments.length === 0 ? (
          <div className="text-center py-8">
            <FiCalendar className="mx-auto mb-4 text-primary-400" size={48} />
            <p className="text-primary-300">No tienes citas programadas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.slice(0, 5).map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-primary-700 rounded-lg hover:bg-primary-600 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={twMerge(
                    'w-3 h-3 rounded-full',
                    getStatusColor(appointment.status)
                  )}></div>
                  <div>
                    <h4 className="font-medium text-primary-100">{appointment.title}</h4>
                    <p className="text-sm text-primary-400">
                      {appointment.client_name} • {appointment.appointment_date} • {formatTime(appointment.start_time)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={twMerge(
                    'px-2 py-1 rounded text-xs font-medium text-white',
                    getStatusColor(appointment.status)
                  )}>
                    {getStatusText(appointment.status)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    <FiEye size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modals */}
      <Modal
        isOpen={isAddingAppointment}
        onClose={() => setIsAddingAppointment(false)}
        title="Nueva Cita"
        size="lg"
      >
        <AppointmentForm
          onSubmit={handleCreateAppointment}
          onCancel={() => setIsAddingAppointment(false)}
        />
      </Modal>

      <Modal
        isOpen={editingAppointment !== null}
        onClose={() => setEditingAppointment(null)}
        title="Editar Cita"
        size="lg"
      >
        {editingAppointment && (
          <AppointmentForm
            appointment={editingAppointment}
            isEditing
            onSubmit={(data) => handleUpdateAppointment(editingAppointment.id, data)}
            onCancel={() => setEditingAppointment(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={selectedAppointment !== null}
        onClose={() => setSelectedAppointment(null)}
        title="Detalles de la Cita"
        size="md"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-primary-100 mb-2">{selectedAppointment.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-primary-400">Cliente:</span>
                  <p className="text-primary-200">{selectedAppointment.client_name}</p>
                </div>
                <div>
                  <span className="text-primary-400">Fecha:</span>
                  <p className="text-primary-200">{selectedAppointment.appointment_date}</p>
                </div>
                <div>
                  <span className="text-primary-400">Hora:</span>
                  <p className="text-primary-200">
                    {formatTime(selectedAppointment.start_time)} - {formatTime(selectedAppointment.end_time)}
                  </p>
                </div>
                <div>
                  <span className="text-primary-400">Estado:</span>
                  <span className={twMerge(
                    'px-2 py-1 rounded text-xs font-medium text-white ml-2',
                    getStatusColor(selectedAppointment.status)
                  )}>
                    {getStatusText(selectedAppointment.status)}
                  </span>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div className="mt-4">
                  <span className="text-primary-400">Notas:</span>
                  <p className="text-primary-200 mt-1">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-primary-700">
              {selectedAppointment.status === 'scheduled' && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => setEditingAppointment(selectedAppointment)}
                  >
                    <FiEdit className="mr-2" size={16} />
                    Editar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleCompleteAppointment(selectedAppointment.id)}
                  >
                    <FiCheck className="mr-2" size={16} />
                    Completar
                  </Button>
                </>
              )}
              
              {['scheduled', 'confirmed'].includes(selectedAppointment.status) && (
                <Button
                  variant="ghost"
                  onClick={() => handleCancelAppointment(selectedAppointment.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <FiX className="mr-2" size={16} />
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarTab;