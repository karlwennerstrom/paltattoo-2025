const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const Proposal = require('../models/Proposal');
const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');

class CalendarController {
  
  // Get all appointments for an artist or client
  static async getAppointments(req, res) {
    try {
      const userType = req.user.user_type;
      const userId = req.user.id;
      
      const filters = {};
      
      if (userType === 'artist') {
        filters.artist_id = userId;
      } else if (userType === 'client') {
        filters.client_id = userId;
      }
      
      // Additional filters from query params
      if (req.query.status) {
        filters.status = req.query.status;
      }
      
      if (req.query.date_from) {
        filters.date_from = req.query.date_from;
      }
      
      if (req.query.date_to) {
        filters.date_to = req.query.date_to;
      }
      
      const appointments = await Appointment.findAll(filters);
      
      res.json({
        success: true,
        data: appointments
      });
    } catch (error) {
      console.error('Error getting appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las citas',
        error: error.message
      });
    }
  }

  // Get appointment by ID
  static async getAppointmentById(req, res) {
    try {
      const { id } = req.params;
      const appointment = await Appointment.findById(id);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }
      
      // Check if user has permission to view this appointment
      if (appointment.artist_id !== req.user.id && appointment.client_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para ver esta cita'
        });
      }
      
      res.json({
        success: true,
        data: appointment
      });
    } catch (error) {
      console.error('Error getting appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la cita',
        error: error.message
      });
    }
  }

  // Create appointment from proposal
  static async createAppointment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: errors.array()
        });
      }
      
      const { 
        proposal_id, 
        appointment_date, 
        start_time, 
        end_time, 
        duration_hours,
        notes, 
        location, 
        estimated_price, 
        deposit_amount 
      } = req.body;
      
      // Validate proposal exists and user has permission
      const proposal = await Proposal.findById(proposal_id);
      if (!proposal) {
        return res.status(404).json({
          success: false,
          message: 'Propuesta no encontrada'
        });
      }
      
      // Only artist can create appointments
      if (req.user.user_type !== 'artist' || proposal.artist_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear esta cita'
        });
      }
      
      // Check if proposal is accepted
      if (proposal.status !== 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'Solo se pueden crear citas para propuestas aceptadas'
        });
      }
      
      // Check availability
      const isAvailable = await Appointment.checkAvailability(
        req.user.id,
        appointment_date,
        start_time,
        end_time
      );
      
      if (!isAvailable) {
        return res.status(400).json({
          success: false,
          message: 'El horario seleccionado no está disponible'
        });
      }
      
      // Create appointment
      const appointment = await Appointment.create({
        artist_id: req.user.id,
        client_id: proposal.client_id,
        proposal_id,
        appointment_date,
        start_time,
        end_time,
        duration_hours,
        notes,
        location,
        estimated_price,
        deposit_amount,
        status: 'scheduled'
      });
      
      // Send email notification to client
      try {
        await emailService.sendAppointmentNotification(
          appointment.client_email,
          appointment.client_name,
          appointment.artist_name,
          appointment
        );
      } catch (emailError) {
        console.error('Error sending appointment notification:', emailError);
      }
      
      res.status(201).json({
        success: true,
        message: 'Cita creada exitosamente',
        data: appointment
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la cita',
        error: error.message
      });
    }
  }

  // Create standalone appointment (without proposal)
  static async createStandaloneAppointment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: errors.array()
        });
      }
      
      const { 
        appointment_date, 
        start_time, 
        end_time, 
        duration_hours,
        title,
        client_name,
        client_email,
        client_phone,
        notes, 
        location, 
        estimated_price, 
        deposit_amount 
      } = req.body;
      
      // Only artists can create appointments
      if (req.user.user_type !== 'artist') {
        return res.status(403).json({
          success: false,
          message: 'Solo los artistas pueden crear citas'
        });
      }
      
      // Check for conflicts
      const conflicts = await Appointment.checkConflicts(
        req.user.id, 
        appointment_date, 
        start_time, 
        end_time
      );
      
      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Ya tienes una cita programada en este horario',
          conflicts
        });
      }
      
      // Create appointment data
      const appointmentData = {
        artist_id: req.user.id,
        client_id: null, // External client (not in system)
        proposal_id: null, // Standalone appointment
        appointment_date,
        start_time,
        end_time,
        duration_hours,
        title,
        client_name,
        client_email,
        client_phone,
        status: 'scheduled',
        notes: notes || null,
        location: location || null,
        estimated_price: estimated_price || null,
        deposit_amount: deposit_amount || null,
        deposit_paid: false
      };
      
      const appointmentId = await Appointment.create(appointmentData);
      const appointment = await Appointment.findById(appointmentId);
      
      // Send notifications (email to client if email provided)
      if (client_email && emailService) {
        try {
          await emailService.sendAppointmentConfirmation({
            email: client_email,
            clientName: client_name,
            appointmentDate: appointment_date,
            startTime: start_time,
            endTime: end_time,
            artistName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Tu Artista',
            title: title,
            location: location,
            notes: notes
          });
        } catch (emailError) {
          console.error('Error sending appointment email:', emailError);
          // Don't fail the appointment creation if email fails
        }
      }

      // Send in-app notification to artist (confirmation of created appointment)
      try {
        // This could be extended to use a real-time notification system like Socket.io
        console.log(`[NOTIFICATION] New appointment created for artist ${req.user.id}:`, {
          title,
          clientName: client_name,
          date: appointment_date,
          time: `${start_time} - ${end_time}`,
          appointmentId: appointmentId
        });
      } catch (notificationError) {
        console.error('Error sending in-app notification:', notificationError);
      }
      
      res.status(201).json({
        success: true,
        message: 'Cita creada exitosamente',
        data: appointment
      });
    } catch (error) {
      console.error('Error creating standalone appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la cita',
        error: error.message
      });
    }
  }

  // Update appointment
  static async updateAppointment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: errors.array()
        });
      }
      
      const { id } = req.params;
      const appointment = await Appointment.findById(id);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }
      
      // Check permissions
      if (appointment.artist_id !== req.user.id && appointment.client_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar esta cita'
        });
      }
      
      // Some fields can only be updated by artist
      const artistOnlyFields = ['appointment_date', 'start_time', 'end_time', 'duration_hours', 'estimated_price', 'deposit_amount'];
      if (req.user.user_type === 'client') {
        for (const field of artistOnlyFields) {
          if (req.body[field] !== undefined) {
            return res.status(403).json({
              success: false,
              message: 'Solo el artista puede modificar los detalles de la cita'
            });
          }
        }
      }
      
      // If time is being changed, check availability
      if (req.body.appointment_date || req.body.start_time || req.body.end_time) {
        const newDate = req.body.appointment_date || appointment.appointment_date;
        const newStartTime = req.body.start_time || appointment.start_time;
        const newEndTime = req.body.end_time || appointment.end_time;
        
        const isAvailable = await Appointment.checkAvailability(
          appointment.artist_id,
          newDate,
          newStartTime,
          newEndTime,
          appointment.id
        );
        
        if (!isAvailable) {
          return res.status(400).json({
            success: false,
            message: 'El nuevo horario no está disponible'
          });
        }
      }
      
      const updatedAppointment = await appointment.update(req.body);
      
      res.json({
        success: true,
        message: 'Cita actualizada exitosamente',
        data: updatedAppointment
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la cita',
        error: error.message
      });
    }
  }

  // Cancel appointment
  static async cancelAppointment(req, res) {
    try {
      const { id } = req.params;
      const { cancellation_reason } = req.body;
      
      const appointment = await Appointment.findById(id);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }
      
      // Check permissions
      if (appointment.artist_id !== req.user.id && appointment.client_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para cancelar esta cita'
        });
      }
      
      // Update appointment status
      const updatedAppointment = await appointment.update({
        status: 'cancelled',
        cancellation_reason: cancellation_reason || 'Cancelada por el usuario'
      });
      
      // Send cancellation notification
      try {
        const notificationEmail = req.user.id === appointment.artist_id ? 
          appointment.client_email : appointment.artist_email;
        const notificationName = req.user.id === appointment.artist_id ? 
          appointment.client_name : appointment.artist_name;
        
        await emailService.sendAppointmentCancellation(
          notificationEmail,
          notificationName,
          updatedAppointment
        );
      } catch (emailError) {
        console.error('Error sending cancellation notification:', emailError);
      }
      
      res.json({
        success: true,
        message: 'Cita cancelada exitosamente',
        data: updatedAppointment
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cancelar la cita',
        error: error.message
      });
    }
  }

  // Get my own availability (for artists)
  static async getMyAvailability(req, res) {
    try {
      if (req.user.user_type !== 'artist') {
        return res.status(403).json({
          success: false,
          message: 'Solo los artistas pueden ver su disponibilidad'
        });
      }
      
      // Get the artist record to get the artist_id
      const TattooArtist = require('../models/TattooArtist');
      const artist = await TattooArtist.findByUserId(req.user.id);
      
      if (!artist) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de artista no encontrado'
        });
      }
      
      const availability = await Availability.findByArtistId(artist.id);
      
      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      console.error('Error getting my availability:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la disponibilidad',
        error: error.message
      });
    }
  }

  // Get artist availability
  static async getAvailability(req, res) {
    try {
      const { artist_id } = req.params;
      const availability = await Availability.findByArtistId(artist_id);
      
      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      console.error('Error getting availability:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la disponibilidad',
        error: error.message
      });
    }
  }

  // Update artist availability (only for artists)
  static async updateAvailability(req, res) {
    try {
      if (req.user.user_type !== 'artist') {
        return res.status(403).json({
          success: false,
          message: 'Solo los artistas pueden actualizar su disponibilidad'
        });
      }
      
      const { weekly_schedule } = req.body;
      
      if (!Array.isArray(weekly_schedule) || weekly_schedule.length !== 7) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar un horario semanal completo (7 días)'
        });
      }
      
      const availability = await Availability.createWeeklySchedule(req.user.id, weekly_schedule);
      
      res.json({
        success: true,
        message: 'Disponibilidad actualizada exitosamente',
        data: availability
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la disponibilidad',
        error: error.message
      });
    }
  }

  // Get available time slots for a specific date
  static async getAvailableSlots(req, res) {
    try {
      const { artist_id } = req.params;
      const { date, duration = 1 } = req.query;
      
      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Fecha requerida'
        });
      }
      
      const slots = await Availability.getAvailableSlots(artist_id, date, parseFloat(duration));
      
      res.json({
        success: true,
        data: slots
      });
    } catch (error) {
      console.error('Error getting available slots:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los horarios disponibles',
        error: error.message
      });
    }
  }

  // Get upcoming appointments
  static async getUpcomingAppointments(req, res) {
    try {
      const { days = 7 } = req.query;
      
      if (req.user.user_type !== 'artist') {
        return res.status(403).json({
          success: false,
          message: 'Solo los artistas pueden ver sus próximas citas'
        });
      }
      
      const appointments = await Appointment.findUpcoming(req.user.id, parseInt(days));
      
      res.json({
        success: true,
        data: appointments
      });
    } catch (error) {
      console.error('Error getting upcoming appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las próximas citas',
        error: error.message
      });
    }
  }

  // Get appointment statistics
  static async getAppointmentStats(req, res) {
    try {
      if (req.user.user_type !== 'artist') {
        return res.status(403).json({
          success: false,
          message: 'Solo los artistas pueden ver sus estadísticas'
        });
      }
      
      const stats = await Appointment.getStats(req.user.id);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting appointment stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las estadísticas',
        error: error.message
      });
    }
  }

  // Mark appointment as completed
  static async completeAppointment(req, res) {
    try {
      const { id } = req.params;
      const { final_price, notes } = req.body;
      
      const appointment = await Appointment.findById(id);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }
      
      // Only artist can mark as completed
      if (req.user.user_type !== 'artist' || appointment.artist_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Solo el artista puede marcar la cita como completada'
        });
      }
      
      const updatedAppointment = await appointment.update({
        status: 'completed',
        estimated_price: final_price || appointment.estimated_price,
        notes: notes || appointment.notes
      });
      
      res.json({
        success: true,
        message: 'Cita marcada como completada',
        data: updatedAppointment
      });
    } catch (error) {
      console.error('Error completing appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Error al completar la cita',
        error: error.message
      });
    }
  }
}

module.exports = CalendarController;