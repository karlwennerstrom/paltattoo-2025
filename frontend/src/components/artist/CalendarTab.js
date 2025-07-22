import React, { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, Grid } from '../common/Layout';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import { getProfileImageUrl } from '../../utils/imageHelpers';
import { calendarService } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { hasCalendarAccess, getUserPlanName } from '../../utils/subscriptionHelpers';

const CalendarTab = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month');
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [isManagingAvailability, setIsManagingAvailability] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);

  // Check if user has access to calendar (pro or premium plans only)
  const userHasCalendarAccess = hasCalendarAccess(user);

  // Real appointments data
  const [appointments, setAppointments] = useState([]);
  
  // Mock appointments for development
  const mockAppointments = [
    {
      id: 1,
      client: {
        name: 'Ana Martínez',
        avatar: null,
        phone: '+56 9 1111 1111',
        email: 'ana@email.com'
      },
      title: 'Tatuaje de León Realista',
      type: 'session',
      date: '2024-01-22',
      startTime: '15:00',
      endTime: '18:00',
      status: 'confirmed',
      description: 'Sesión 1 de tatuaje realista',
      proposalId: 1,
      price: 280000,
      estimatedDuration: '3 horas',
      notes: 'Cliente muy puntual, traer referencias adicionales'
    },
    {
      id: 2,
      client: {
        name: 'Carlos López',
        avatar: null,
        phone: '+56 9 2222 2222',
        email: 'carlos@email.com'
      },
      title: 'Consulta Inicial - Retrato',
      type: 'consultation',
      date: '2024-01-23',
      startTime: '10:30',
      endTime: '11:00',
      status: 'confirmed',
      description: 'Primera consulta para retrato familiar',
      proposalId: 2,
      price: 0,
      estimatedDuration: '30 min',
      notes: 'Traer fotos de referencia'
    },
    {
      id: 3,
      client: {
        name: 'María González',
        avatar: null,
        phone: '+56 9 3333 3333',
        email: 'maria@email.com'
      },
      title: 'Mandala Espalda - Continuación',
      type: 'session',
      date: '2024-01-25',
      startTime: '16:00',
      endTime: '19:00',
      status: 'pending',
      description: 'Continuar trabajo en mandala espalda',
      proposalId: 3,
      price: 250000,
      estimatedDuration: '3 horas',
      notes: 'Revisar proceso de curación'
    }
  ];
  
  // Load appointments from backend
  useEffect(() => {
    loadAppointments();
    loadAvailability();
  }, []);
  
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await calendarService.getAppointments();
      
      // Transform the data to match the expected structure
      const appointmentsData = response.data?.data || response.data || [];
      const transformedAppointments = (Array.isArray(appointmentsData) ? appointmentsData : []).map(apt => ({
        id: apt.id,
        client: {
          name: apt.client_name || 'Cliente',
          avatar: apt.client_avatar,
          phone: apt.client_phone,
          email: apt.client_email
        },
        title: apt.request_title || apt.title || 'Cita',
        type: apt.type || 'session',
        date: apt.appointment_date ? apt.appointment_date.split('T')[0] : apt.date,
        startTime: apt.start_time,
        endTime: apt.end_time,
        status: apt.status,
        description: apt.request_description || apt.description || '',
        proposalId: apt.proposal_id,
        price: apt.estimated_price || apt.price || 0,
        estimatedDuration: apt.duration_hours ? `${apt.duration_hours} hora${apt.duration_hours !== 1 ? 's' : ''}` : '1 hora',
        notes: apt.notes
      }));
      
      setAppointments(transformedAppointments.length > 0 ? transformedAppointments : mockAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      toast.error('Error al cargar las citas');
      setAppointments(mockAppointments);
    } finally {
      setLoading(false);
    }
  };
  
  const loadAvailability = async () => {
    try {
      const response = await calendarService.getAvailability();
      if (response.data?.weekly_schedule) {
        setAvailability(response.data.weekly_schedule);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  // Availability configuration
  const [availability, setAvailability] = useState({
    monday: { available: true, start: '10:00', end: '19:00', break: { start: '13:00', end: '14:00' } },
    tuesday: { available: true, start: '10:00', end: '19:00', break: { start: '13:00', end: '14:00' } },
    wednesday: { available: true, start: '10:00', end: '19:00', break: { start: '13:00', end: '14:00' } },
    thursday: { available: true, start: '10:00', end: '19:00', break: { start: '13:00', end: '14:00' } },
    friday: { available: true, start: '10:00', end: '19:00', break: { start: '13:00', end: '14:00' } },
    saturday: { available: true, start: '11:00', end: '17:00', break: null },
    sunday: { available: false }
  });

  const [newAppointment, setNewAppointment] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    title: '',
    type: 'consultation',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    price: '',
    notes: ''
  });

  const appointmentTypes = [
    { value: 'consultation', label: 'Consulta inicial', color: 'bg-blue-600', duration: 30 },
    { value: 'session', label: 'Sesión de tatuaje', color: 'bg-green-600', duration: 180 },
    { value: 'touch_up', label: 'Retoque', color: 'bg-yellow-600', duration: 60 },
    { value: 'design', label: 'Diseño', color: 'bg-purple-600', duration: 120 }
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getAppointmentsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateString);
  };

  const isDateAvailable = (date) => {
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    return availability[dayOfWeek]?.available || false;
  };

  const getAvailableTimeSlots = (date) => {
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    const dayAvailability = availability[dayOfWeek];
    
    if (!dayAvailability?.available) return [];

    const slots = [];
    const appointments = getAppointmentsForDate(date);
    
    // Generate time slots (every 30 minutes)
    let currentTime = new Date(`2024-01-01 ${dayAvailability.start}`);
    const endTime = new Date(`2024-01-01 ${dayAvailability.end}`);
    
    while (currentTime < endTime) {
      const timeStr = currentTime.toTimeString().substring(0, 5);
      
      // Check if this slot is available (not booked and not during break)
      const isBooked = appointments.some(apt => 
        timeStr >= apt.startTime && timeStr < apt.endTime
      );
      
      const isDuringBreak = dayAvailability.break && 
        timeStr >= dayAvailability.break.start && timeStr < dayAvailability.break.end;

      if (!isBooked && !isDuringBreak) {
        slots.push(timeStr);
      }
      
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
    
    return slots;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-CL', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'cancelled': return 'bg-red-600';
      case 'completed': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getTypeColor = (type) => {
    const typeConfig = appointmentTypes.find(t => t.value === type);
    return typeConfig?.color || 'bg-gray-600';
  };

  const handleAddAppointment = async () => {
    // Validate form
    if (!newAppointment.clientName || !newAppointment.date || !newAppointment.startTime) {
      toast.error('Por favor completa los campos obligatorios');
      return;
    }

    if (operationLoading) return;

    try {
      setOperationLoading(true);
      // Calculate end time based on appointment type
      const typeConfig = appointmentTypes.find(t => t.value === newAppointment.type);
      const startTime = new Date(`2024-01-01 ${newAppointment.startTime}`);
      startTime.setMinutes(startTime.getMinutes() + typeConfig.duration);
      const endTime = newAppointment.endTime || startTime.toTimeString().substring(0, 5);

      const appointmentData = {
        client_name: newAppointment.clientName,
        client_phone: newAppointment.clientPhone,
        client_email: newAppointment.clientEmail,
        title: newAppointment.title,
        appointment_date: newAppointment.date,
        start_time: newAppointment.startTime,
        end_time: endTime,
        duration_hours: typeConfig.duration / 60, // Convert minutes to hours
        estimated_price: parseInt(newAppointment.price) || null,
        notes: newAppointment.notes,
        location: null
      };
      
      const response = await calendarService.createStandaloneAppointment(appointmentData);
      
      if (response.data) {
        toast.success('Cita creada exitosamente');
        await loadAppointments();
        setNewAppointment({
          clientName: '',
          clientPhone: '',
          clientEmail: '',
          title: '',
          type: 'consultation',
          date: '',
          startTime: '',
          endTime: '',
          description: '',
          price: '',
          notes: ''
        });
        setIsAddingAppointment(false);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Error al crear la cita');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    if (operationLoading) return;
    
    try {
      setOperationLoading(true);
      if (newStatus === 'cancelled') {
        await calendarService.cancelAppointment(appointmentId, 'Cancelado por el artista');
        toast.success('Cita cancelada exitosamente');
      } else if (newStatus === 'completed') {
        await calendarService.completeAppointment(appointmentId, {});
        toast.success('Cita marcada como completada');
      } else {
        await calendarService.updateAppointment(appointmentId, { status: newStatus });
        toast.success('Estado actualizado exitosamente');
      }
      await loadAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Error al actualizar el estado de la cita');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      if (operationLoading) return;
      
      try {
        setOperationLoading(true);
        await calendarService.cancelAppointment(appointmentId, 'Eliminado por el artista');
        toast.success('Cita eliminada exitosamente');
        await loadAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error('Error al eliminar la cita');
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Show upgrade message for basic plan users
  if (!userHasCalendarAccess) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="max-w-2xl mx-auto text-center">
          <div className="py-12 px-8">
            <div className="w-20 h-20 bg-accent-600 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-primary-100 mb-4">
              Calendario Profesional
            </h2>
            
            <p className="text-primary-300 mb-8 max-w-md mx-auto">
              Gestiona tus citas y horarios de disponibilidad con nuestro calendario profesional. 
              Esta función está disponible en los planes Pro y Premium.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center space-x-2 text-primary-400">
                <svg className="h-5 w-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Gestión completa de citas</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-primary-400">
                <svg className="h-5 w-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Configuración de horarios disponibles</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-primary-400">
                <svg className="h-5 w-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Sincronización con propuestas aceptadas</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-primary-400">
                <svg className="h-5 w-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Notificaciones automáticas</span>
              </div>
            </div>

            <Link to="/artist/subscription">
              <Button variant="primary" size="lg" className="min-w-[200px]">
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Actualizar a Pro
              </Button>
            </Link>

            <p className="text-primary-500 text-sm mt-4">
              Tu plan actual: <span className="text-primary-300 font-medium capitalize">{getUserPlanName(user)}</span>
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-primary-100">Mi Calendario</h1>
          <p className="text-primary-400">Gestiona tus citas y horarios de disponibilidad</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" onClick={() => setIsManagingAvailability(true)}>
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Configurar Disponibilidad
          </Button>
          <Button variant="primary" onClick={() => setIsAddingAppointment(true)}>
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Cita
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={prevMonth}
            className="p-2 text-primary-400 hover:text-primary-200 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-primary-100 min-w-[200px] text-center">
            {currentDate.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 text-primary-400 hover:text-primary-200 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span className="text-primary-400">Confirmada</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-600 rounded"></div>
            <span className="text-primary-400">Pendiente</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span className="text-primary-400">Cancelada</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
              </div>
            ) : (
              <>
                {/* Calendar Header */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-primary-400">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="h-28"></div>;
                }

                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                const dayAppointments = getAppointmentsForDate(date);
                const isSelected = selectedDate && selectedDate.getDate() === day;
                const isAvailable = isDateAvailable(date);

                return (
                  <div
                    key={`day-${index}-${day}`}
                    onClick={() => setSelectedDate(date)}
                    className={twMerge(
                      'h-28 p-2 border border-primary-700 cursor-pointer transition-colors hover:bg-primary-700',
                      isToday(day) && 'bg-accent-600 bg-opacity-20 border-accent-500',
                      isSelected && 'bg-accent-600 bg-opacity-40',
                      !isAvailable && 'bg-primary-800 opacity-50'
                    )}
                  >
                    <div className={twMerge(
                      'text-sm font-medium mb-1 flex items-center justify-between',
                      isToday(day) ? 'text-accent-300' : 'text-primary-200'
                    )}>
                      <span>{day}</span>
                      {!isAvailable && (
                        <svg className="h-3 w-3 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
                        </svg>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayAppointments.slice(0, 2).map((apt) => (
                        <div
                          key={apt.id}
                          className={twMerge(
                            'text-xs px-1 py-0.5 rounded text-white truncate cursor-pointer',
                            getStatusColor(apt.status)
                          )}
                          title={`${apt.startTime} - ${apt.client.name} - ${apt.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAppointment(apt);
                          }}
                        >
                          {apt.startTime} {apt.client.name}
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
              </>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Info */}
          {selectedDate && (
            <Card title={formatDate(selectedDate)}>
              <div className="space-y-3">
                {isDateAvailable(selectedDate) ? (
                  <>
                    {getAppointmentsForDate(selectedDate).map((apt) => (
                      <div
                        key={apt.id}
                        className="p-3 bg-primary-800 rounded-lg cursor-pointer hover:bg-primary-700 transition-colors"
                        onClick={() => setSelectedAppointment(apt)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-primary-100">{apt.client.name}</h4>
                          <span className={twMerge(
                            'px-2 py-1 text-xs rounded text-white',
                            getStatusColor(apt.status)
                          )}>
                            {apt.status === 'confirmed' ? 'Confirmada' : 
                             apt.status === 'pending' ? 'Pendiente' : 
                             apt.status === 'cancelled' ? 'Cancelada' : 'Completada'}
                          </span>
                        </div>
                        <p className="text-sm text-primary-400 mb-1">{apt.title}</p>
                        <p className="text-xs text-primary-500">{apt.startTime} - {apt.endTime}</p>
                        {apt.price > 0 && (
                          <p className="text-xs text-accent-400 mt-1">{formatCurrency(apt.price)}</p>
                        )}
                      </div>
                    ))}
                    {getAppointmentsForDate(selectedDate).length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-primary-500 text-sm mb-3">No hay citas para este día</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setNewAppointment(prev => ({ 
                              ...prev, 
                              date: selectedDate.toISOString().split('T')[0] 
                            }));
                            setIsAddingAppointment(true);
                          }}
                        >
                          Agregar Cita
                        </Button>
                      </div>
                    )}
                    
                    {/* Available Time Slots */}
                    <div className="mt-4 pt-4 border-t border-primary-700">
                      <h5 className="text-sm font-medium text-primary-200 mb-2">Horarios disponibles</h5>
                      <div className="grid grid-cols-3 gap-1">
                        {getAvailableTimeSlots(selectedDate).slice(0, 9).map((slot) => (
                          <div
                            key={slot}
                            className="text-xs text-center py-1 bg-primary-700 text-primary-300 rounded cursor-pointer hover:bg-accent-600 hover:text-white transition-colors"
                            onClick={() => {
                              setNewAppointment(prev => ({ 
                                ...prev, 
                                date: selectedDate.toISOString().split('T')[0],
                                startTime: slot
                              }));
                              setIsAddingAppointment(true);
                            }}
                          >
                            {slot}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-primary-500 text-sm text-center py-4">
                    No disponible este día
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Upcoming Appointments */}
          <Card title="Próximas Citas">
            <div className="space-y-3">
              {appointments
                .filter(apt => new Date(apt.date) >= new Date())
                .slice(0, 3)
                .map((apt) => (
                <div key={apt.id} className="p-3 bg-primary-800 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-primary-100">{apt.client.name}</h4>
                    <span className="text-xs text-primary-400">
                      {new Date(apt.date).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                  <p className="text-sm text-primary-400">{apt.title}</p>
                  <div className="flex items-center justify-between text-xs text-primary-500 mt-1">
                    <span>{apt.startTime} - {apt.endTime}</span>
                    {apt.price > 0 && <span>{formatCurrency(apt.price)}</span>}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" fullWidth className="mt-4">
              Ver todas las citas
            </Button>
          </Card>

          {/* Quick Stats */}
          <Card title="Estadísticas">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-primary-400">Hoy</span>
                <span className="text-sm text-primary-100 font-medium">
                  {appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length} citas
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-400">Esta semana</span>
                <span className="text-sm text-primary-100 font-medium">
                  {appointments.filter(apt => {
                    const aptDate = new Date(apt.date);
                    const now = new Date();
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    return aptDate >= weekStart && aptDate <= weekEnd;
                  }).length} citas
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-400">Este mes</span>
                <span className="text-sm text-primary-100 font-medium">
                  {appointments.length} citas
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-primary-400">Ingresos proyectados</span>
                <span className="text-sm text-primary-100 font-medium">
                  {formatCurrency(appointments.reduce((sum, apt) => sum + apt.price, 0))}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Appointment Modal */}
      <Modal
        isOpen={isAddingAppointment}
        onClose={() => setIsAddingAppointment(false)}
        title="Nueva Cita"
        size="lg"
      >
        <div className="space-y-4">
          <Grid cols={2} gap={4}>
            <Input
              label="Nombre del cliente *"
              value={newAppointment.clientName}
              onChange={(e) => setNewAppointment(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="Nombre completo"
            />
            <Input
              label="Teléfono"
              value={newAppointment.clientPhone}
              onChange={(e) => setNewAppointment(prev => ({ ...prev, clientPhone: e.target.value }))}
              placeholder="+56 9 1234 5678"
            />
          </Grid>

          <Input
            label="Email"
            type="email"
            value={newAppointment.clientEmail}
            onChange={(e) => setNewAppointment(prev => ({ ...prev, clientEmail: e.target.value }))}
            placeholder="cliente@email.com"
          />

          <Input
            label="Título de la cita *"
            value={newAppointment.title}
            onChange={(e) => setNewAppointment(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Ej: Consulta inicial para tatuaje realista"
          />

          <Grid cols={2} gap={4}>
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">Tipo de cita *</label>
              <select
                value={newAppointment.type}
                onChange={(e) => setNewAppointment(prev => ({ ...prev, type: e.target.value }))}
                className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 focus:border-accent-500 focus:outline-none"
              >
                {appointmentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} ({type.duration} min)
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Precio (CLP)"
              type="number"
              value={newAppointment.price}
              onChange={(e) => setNewAppointment(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0"
            />
          </Grid>

          <Grid cols={3} gap={4}>
            <Input
              label="Fecha *"
              type="date"
              value={newAppointment.date}
              onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
            />
            <Input
              label="Hora inicio *"
              type="time"
              value={newAppointment.startTime}
              onChange={(e) => setNewAppointment(prev => ({ ...prev, startTime: e.target.value }))}
            />
            <Input
              label="Hora fin"
              type="time"
              value={newAppointment.endTime}
              onChange={(e) => setNewAppointment(prev => ({ ...prev, endTime: e.target.value }))}
              placeholder="Se calculará automáticamente"
            />
          </Grid>

          <textarea
            value={newAppointment.description}
            onChange={(e) => setNewAppointment(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descripción de la cita..."
            rows={3}
            className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none"
          />

          <textarea
            value={newAppointment.notes}
            onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notas adicionales..."
            rows={2}
            className="w-full bg-primary-700 border border-primary-600 rounded-lg px-3 py-2 text-primary-100 placeholder-primary-400 focus:border-accent-500 focus:outline-none"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setIsAddingAppointment(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddAppointment}
              disabled={operationLoading}
            >
              {operationLoading ? 'Creando...' : 'Crear Cita'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={selectedAppointment !== null}
        onClose={() => setSelectedAppointment(null)}
        title="Detalles de la Cita"
        size="md"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-primary-100 mb-1">{selectedAppointment.title}</h3>
                <p className="text-primary-400">{selectedAppointment.description}</p>
              </div>
              <span className={twMerge(
                'px-3 py-1 text-sm rounded text-white',
                getStatusColor(selectedAppointment.status)
              )}>
                {selectedAppointment.status === 'confirmed' ? 'Confirmada' : 
                 selectedAppointment.status === 'pending' ? 'Pendiente' : 
                 selectedAppointment.status === 'cancelled' ? 'Cancelada' : 'Completada'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-primary-200 mb-2">Cliente</h4>
                <div className="space-y-1">
                  <p className="text-primary-300">{selectedAppointment.client.name}</p>
                  {selectedAppointment.client.phone && (
                    <p className="text-primary-500 text-sm">{selectedAppointment.client.phone}</p>
                  )}
                  {selectedAppointment.client.email && (
                    <p className="text-primary-500 text-sm">{selectedAppointment.client.email}</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-primary-200 mb-2">Información de la cita</h4>
                <div className="space-y-1">
                  <p className="text-primary-300 text-sm">
                    {new Date(selectedAppointment.date).toLocaleDateString('es-CL')}
                  </p>
                  <p className="text-primary-300 text-sm">
                    {selectedAppointment.startTime} - {selectedAppointment.endTime}
                  </p>
                  <p className="text-primary-300 text-sm">
                    Duración: {selectedAppointment.estimatedDuration}
                  </p>
                  {selectedAppointment.price > 0 && (
                    <p className="text-accent-400 text-sm font-medium">
                      {formatCurrency(selectedAppointment.price)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {selectedAppointment.notes && (
              <div>
                <h4 className="text-sm font-medium text-primary-200 mb-2">Notas</h4>
                <p className="text-primary-400 text-sm p-3 bg-primary-800 rounded-lg">
                  {selectedAppointment.notes}
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-primary-700">
              <div className="flex space-x-2">
                {selectedAppointment.status === 'pending' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handleUpdateAppointmentStatus(selectedAppointment.id, 'confirmed');
                      setSelectedAppointment(null);
                    }}
                  >
                    Confirmar
                  </Button>
                )}
                {selectedAppointment.status === 'confirmed' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handleUpdateAppointmentStatus(selectedAppointment.id, 'completed');
                      setSelectedAppointment(null);
                    }}
                  >
                    Marcar Completada
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleUpdateAppointmentStatus(selectedAppointment.id, 'cancelled');
                    setSelectedAppointment(null);
                  }}
                  className="text-error-400 hover:text-error-300"
                >
                  Cancelar Cita
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                  className="text-error-400 hover:text-error-300"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Availability Management Modal */}
      <Modal
        isOpen={isManagingAvailability}
        onClose={() => setIsManagingAvailability(false)}
        title="Configurar Disponibilidad"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-primary-400 text-sm">
            Configura tus horarios de trabajo para cada día de la semana.
          </p>
          
          {Object.entries(availability).map(([day, settings]) => {
            const dayLabels = {
              monday: 'Lunes',
              tuesday: 'Martes', 
              wednesday: 'Miércoles',
              thursday: 'Jueves',
              friday: 'Viernes',
              saturday: 'Sábado',
              sunday: 'Domingo'
            };

            return (
              <div key={day} className="p-4 bg-primary-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-primary-100 font-medium">{dayLabels[day]}</h4>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.available}
                      onChange={(e) => setAvailability(prev => ({
                        ...prev,
                        [day]: { ...prev[day], available: e.target.checked }
                      }))}
                      className="w-4 h-4 text-accent-600 bg-primary-700 border-primary-600 rounded focus:ring-accent-500"
                    />
                    <span className="text-sm text-primary-300">Disponible</span>
                  </label>
                </div>

                {settings.available && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-primary-400 mb-1">Hora inicio</label>
                      <input
                        type="time"
                        value={settings.start}
                        onChange={(e) => setAvailability(prev => ({
                          ...prev,
                          [day]: { ...prev[day], start: e.target.value }
                        }))}
                        className="w-full bg-primary-700 border border-primary-600 rounded px-2 py-1 text-sm text-primary-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-primary-400 mb-1">Hora fin</label>
                      <input
                        type="time"
                        value={settings.end}
                        onChange={(e) => setAvailability(prev => ({
                          ...prev,
                          [day]: { ...prev[day], end: e.target.value }
                        }))}
                        className="w-full bg-primary-700 border border-primary-600 rounded px-2 py-1 text-sm text-primary-100"
                      />
                    </div>
                    {settings.break && (
                      <>
                        <div>
                          <label className="block text-xs text-primary-400 mb-1">Descanso inicio</label>
                          <input
                            type="time"
                            value={settings.break.start}
                            onChange={(e) => setAvailability(prev => ({
                              ...prev,
                              [day]: { 
                                ...prev[day], 
                                break: { ...prev[day].break, start: e.target.value }
                              }
                            }))}
                            className="w-full bg-primary-700 border border-primary-600 rounded px-2 py-1 text-sm text-primary-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-primary-400 mb-1">Descanso fin</label>
                          <input
                            type="time"
                            value={settings.break.end}
                            onChange={(e) => setAvailability(prev => ({
                              ...prev,
                              [day]: { 
                                ...prev[day], 
                                break: { ...prev[day].break, end: e.target.value }
                              }
                            }))}
                            className="w-full bg-primary-700 border border-primary-600 rounded px-2 py-1 text-sm text-primary-100"
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setIsManagingAvailability(false)}>
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={async () => {
                try {
                  await calendarService.updateAvailability(availability);
                  toast.success('Disponibilidad actualizada exitosamente');
                  setIsManagingAvailability(false);
                } catch (error) {
                  console.error('Error updating availability:', error);
                  toast.error('Error al actualizar disponibilidad');
                }
              }}
            >
              Guardar Disponibilidad
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarTab;