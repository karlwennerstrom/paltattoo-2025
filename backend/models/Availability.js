const db = require('../config/database');

class Availability {
  constructor(data) {
    this.id = data.id;
    this.artist_id = data.artist_id;
    this.day_of_week = data.day_of_week; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    this.start_time = data.start_time;
    this.end_time = data.end_time;
    this.is_available = data.is_available || true;
    this.break_start = data.break_start;
    this.break_end = data.break_end;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT 
          a.*,
          u.name as artist_name
        FROM availability a
        LEFT JOIN users u ON a.artist_id = u.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.artist_id) {
        query += ` AND a.artist_id = ?`;
        params.push(filters.artist_id);
      }
      
      if (filters.day_of_week !== undefined) {
        query += ` AND a.day_of_week = ?`;
        params.push(filters.day_of_week);
      }
      
      if (filters.is_available !== undefined) {
        query += ` AND a.is_available = ?`;
        params.push(filters.is_available);
      }
      
      query += ` ORDER BY a.day_of_week ASC, a.start_time ASC`;
      
      const [rows] = await db.execute(query, params);
      return rows.map(row => new Availability(row));
    } catch (error) {
      throw new Error(`Error finding availability: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT 
          a.*,
          u.name as artist_name
        FROM availability a
        LEFT JOIN users u ON a.artist_id = u.id
        WHERE a.id = ?
      `;
      
      const [rows] = await db.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Availability(rows[0]);
    } catch (error) {
      throw new Error(`Error finding availability: ${error.message}`);
    }
  }

  static async findByArtistId(artistId) {
    try {
      const query = `
        SELECT * FROM availability 
        WHERE artist_id = ? 
        ORDER BY day_of_week ASC, start_time ASC
      `;
      
      const [rows] = await db.execute(query, [artistId]);
      return rows.map(row => new Availability(row));
    } catch (error) {
      throw new Error(`Error finding availability by artist: ${error.message}`);
    }
  }

  static async create(data) {
    try {
      const query = `
        INSERT INTO availability (
          artist_id, day_of_week, start_time, end_time, is_available, 
          break_start, break_end, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const [result] = await db.execute(query, [
        data.artist_id,
        data.day_of_week,
        data.start_time,
        data.end_time,
        data.is_available !== undefined ? data.is_available : true,
        data.break_start || null,
        data.break_end || null
      ]);
      
      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating availability: ${error.message}`);
    }
  }

  async update(data) {
    try {
      const fields = [];
      const values = [];
      
      if (data.day_of_week !== undefined) {
        fields.push('day_of_week = ?');
        values.push(data.day_of_week);
      }
      
      if (data.start_time !== undefined) {
        fields.push('start_time = ?');
        values.push(data.start_time);
      }
      
      if (data.end_time !== undefined) {
        fields.push('end_time = ?');
        values.push(data.end_time);
      }
      
      if (data.is_available !== undefined) {
        fields.push('is_available = ?');
        values.push(data.is_available);
      }
      
      if (data.break_start !== undefined) {
        fields.push('break_start = ?');
        values.push(data.break_start);
      }
      
      if (data.break_end !== undefined) {
        fields.push('break_end = ?');
        values.push(data.break_end);
      }
      
      if (fields.length === 0) {
        return this;
      }
      
      fields.push('updated_at = NOW()');
      values.push(this.id);
      
      const query = `UPDATE availability SET ${fields.join(', ')} WHERE id = ?`;
      await db.execute(query, values);
      
      return await this.constructor.findById(this.id);
    } catch (error) {
      throw new Error(`Error updating availability: ${error.message}`);
    }
  }

  async delete() {
    try {
      const query = `DELETE FROM availability WHERE id = ?`;
      await db.execute(query, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Error deleting availability: ${error.message}`);
    }
  }

  static async createWeeklySchedule(artistId, weeklySchedule) {
    try {
      // First, delete existing availability for this artist
      await db.execute('DELETE FROM availability WHERE artist_id = ?', [artistId]);
      
      // Create new availability entries
      const results = [];
      for (const schedule of weeklySchedule) {
        if (schedule.is_available) {
          const availability = await this.create({
            artist_id: artistId,
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            is_available: schedule.is_available,
            break_start: schedule.break_start,
            break_end: schedule.break_end
          });
          results.push(availability);
        }
      }
      
      return results;
    } catch (error) {
      throw new Error(`Error creating weekly schedule: ${error.message}`);
    }
  }

  static async getAvailableSlots(artistId, date, duration = 1) {
    try {
      const dayOfWeek = new Date(date).getDay();
      
      // Get availability for this day
      const availabilityQuery = `
        SELECT * FROM availability 
        WHERE artist_id = ? AND day_of_week = ? AND is_available = true
        ORDER BY start_time ASC
      `;
      
      const [availabilityRows] = await db.execute(availabilityQuery, [artistId, dayOfWeek]);
      
      if (availabilityRows.length === 0) {
        return [];
      }
      
      // Get existing appointments for this date
      const appointmentsQuery = `
        SELECT start_time, end_time FROM appointments 
        WHERE artist_id = ? AND appointment_date = ? AND status IN ('scheduled', 'confirmed')
        ORDER BY start_time ASC
      `;
      
      const [appointmentRows] = await db.execute(appointmentsQuery, [artistId, date]);
      
      const availableSlots = [];
      
      for (const availability of availabilityRows) {
        const slots = this.generateTimeSlots(
          availability.start_time,
          availability.end_time,
          duration,
          availability.break_start,
          availability.break_end,
          appointmentRows
        );
        availableSlots.push(...slots);
      }
      
      return availableSlots;
    } catch (error) {
      throw new Error(`Error getting available slots: ${error.message}`);
    }
  }

  static generateTimeSlots(startTime, endTime, duration, breakStart, breakEnd, existingAppointments) {
    const slots = [];
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const durationMs = duration * 60 * 60 * 1000; // Convert hours to milliseconds
    
    let current = new Date(start);
    
    while (current.getTime() + durationMs <= end.getTime()) {
      const slotStart = current.toTimeString().slice(0, 5);
      const slotEnd = new Date(current.getTime() + durationMs).toTimeString().slice(0, 5);
      
      // Check if slot conflicts with break time
      if (breakStart && breakEnd) {
        const breakStartTime = new Date(`2000-01-01 ${breakStart}`);
        const breakEndTime = new Date(`2000-01-01 ${breakEnd}`);
        
        if (current < breakEndTime && new Date(current.getTime() + durationMs) > breakStartTime) {
          // Skip this slot as it conflicts with break
          current = new Date(current.getTime() + (30 * 60 * 1000)); // Move 30 minutes forward
          continue;
        }
      }
      
      // Check if slot conflicts with existing appointments
      let conflictsWithAppointment = false;
      for (const appointment of existingAppointments) {
        const appointmentStart = new Date(`2000-01-01 ${appointment.start_time}`);
        const appointmentEnd = new Date(`2000-01-01 ${appointment.end_time}`);
        
        if (current < appointmentEnd && new Date(current.getTime() + durationMs) > appointmentStart) {
          conflictsWithAppointment = true;
          break;
        }
      }
      
      if (!conflictsWithAppointment) {
        slots.push({
          start_time: slotStart,
          end_time: slotEnd
        });
      }
      
      // Move to next 30-minute slot
      current = new Date(current.getTime() + (30 * 60 * 1000));
    }
    
    return slots;
  }

  static getDayName(dayOfWeek) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayOfWeek];
  }

  getDayName() {
    return this.constructor.getDayName(this.day_of_week);
  }
}

module.exports = Availability;