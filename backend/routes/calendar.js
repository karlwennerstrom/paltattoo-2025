const express = require('express');
const router = express.Router();
const CalendarController = require('../controllers/calendarController');
const { authenticate } = require('../middleware/auth');
const { body, param, query } = require('express-validator');

// Apply authentication middleware to all routes
router.use(authenticate);

// Validation middleware
const validateAppointment = [
  body('proposal_id').isInt({ min: 1 }).withMessage('ID de propuesta válido requerido'),
  body('appointment_date').isISO8601().withMessage('Fecha válida requerida'),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de inicio válida requerida (HH:MM)'),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de fin válida requerida (HH:MM)'),
  body('duration_hours').isFloat({ min: 0.5, max: 12 }).withMessage('Duración debe ser entre 0.5 y 12 horas'),
  body('estimated_price').optional().isFloat({ min: 0 }).withMessage('Precio estimado debe ser mayor a 0'),
  body('deposit_amount').optional().isFloat({ min: 0 }).withMessage('Depósito debe ser mayor a 0'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notas no pueden exceder 1000 caracteres'),
  body('location').optional().isLength({ max: 255 }).withMessage('Ubicación no puede exceder 255 caracteres')
];

// Validation for standalone appointments (without proposal)
const validateStandaloneAppointment = [
  body('appointment_date').isISO8601().withMessage('Fecha válida requerida'),
  body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de inicio válida requerida (HH:MM)'),
  body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de fin válida requerida (HH:MM)'),
  body('duration_hours').isFloat({ min: 0.5, max: 12 }).withMessage('Duración debe ser entre 0.5 y 12 horas'),
  body('title').isLength({ min: 1, max: 255 }).withMessage('Título es requerido y no puede exceder 255 caracteres'),
  body('client_name').isLength({ min: 1, max: 255 }).withMessage('Nombre del cliente es requerido'),
  body('client_email').optional().isEmail().withMessage('Email del cliente debe ser válido'),
  body('client_phone').optional().isLength({ min: 1, max: 50 }).withMessage('Teléfono del cliente no puede exceder 50 caracteres'),
  body('estimated_price').optional().isFloat({ min: 0 }).withMessage('Precio estimado debe ser mayor a 0'),
  body('deposit_amount').optional().isFloat({ min: 0 }).withMessage('Depósito debe ser mayor a 0'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notas no pueden exceder 1000 caracteres'),
  body('location').optional().isLength({ max: 255 }).withMessage('Ubicación no puede exceder 255 caracteres')
];

const validateAppointmentUpdate = [
  body('appointment_date').optional().isISO8601().withMessage('Fecha válida requerida'),
  body('start_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de inicio válida requerida (HH:MM)'),
  body('end_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de fin válida requerida (HH:MM)'),
  body('duration_hours').optional().isFloat({ min: 0.5, max: 12 }).withMessage('Duración debe ser entre 0.5 y 12 horas'),
  body('status').optional().isIn(['scheduled', 'confirmed', 'cancelled', 'completed', 'no_show']).withMessage('Estado inválido'),
  body('estimated_price').optional().isFloat({ min: 0 }).withMessage('Precio estimado debe ser mayor a 0'),
  body('deposit_amount').optional().isFloat({ min: 0 }).withMessage('Depósito debe ser mayor a 0'),
  body('deposit_paid').optional().isBoolean().withMessage('Depósito pagado debe ser true o false'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notas no pueden exceder 1000 caracteres'),
  body('location').optional().isLength({ max: 255 }).withMessage('Ubicación no puede exceder 255 caracteres')
];

const validateAvailability = [
  body('weekly_schedule').isArray({ min: 7, max: 7 }).withMessage('Horario semanal debe contener 7 días'),
  body('weekly_schedule.*.day_of_week').isInt({ min: 0, max: 6 }).withMessage('Día de la semana inválido'),
  body('weekly_schedule.*.is_available').isBoolean().withMessage('Disponibilidad debe ser true o false'),
  body('weekly_schedule.*.start_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de inicio válida requerida (HH:MM)'),
  body('weekly_schedule.*.end_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de fin válida requerida (HH:MM)'),
  body('weekly_schedule.*.break_start').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de inicio de descanso válida requerida (HH:MM)'),
  body('weekly_schedule.*.break_end').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Hora de fin de descanso válida requerida (HH:MM)')
];

const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID válido requerido')
];

const validateArtistId = [
  param('artist_id').isInt({ min: 1 }).withMessage('ID de artista válido requerido')
];

// Routes for appointments
router.get('/appointments', CalendarController.getAppointments);
router.get('/appointments/upcoming', CalendarController.getUpcomingAppointments);
router.get('/appointments/stats', CalendarController.getAppointmentStats);
router.get('/appointments/:id', validateId, CalendarController.getAppointmentById);
router.post('/appointments', validateAppointment, CalendarController.createAppointment);
router.post('/appointments/standalone', validateStandaloneAppointment, CalendarController.createStandaloneAppointment);
router.put('/appointments/:id', validateId, validateAppointmentUpdate, CalendarController.updateAppointment);
router.put('/appointments/:id/cancel', validateId, CalendarController.cancelAppointment);
router.put('/appointments/:id/complete', validateId, CalendarController.completeAppointment);

// Routes for availability
router.get('/availability', CalendarController.getMyAvailability); // Get my own availability
router.get('/availability/:artist_id', validateArtistId, CalendarController.getAvailability);
router.put('/availability', validateAvailability, CalendarController.updateAvailability);
router.get('/availability/:artist_id/slots', 
  validateArtistId, 
  query('date').isISO8601().withMessage('Fecha válida requerida'),
  query('duration').optional().isFloat({ min: 0.5, max: 12 }).withMessage('Duración debe ser entre 0.5 y 12 horas'),
  CalendarController.getAvailableSlots
);

module.exports = router;