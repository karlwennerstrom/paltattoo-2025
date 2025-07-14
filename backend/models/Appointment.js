const db = require('../config/database');

class Appointment {
  constructor(data) {
    this.id = data.id;
    this.artist_id = data.artist_id;
    this.client_id = data.client_id;
    this.proposal_id = data.proposal_id;
    this.appointment_date = data.appointment_date;
    this.start_time = data.start_time;
    this.end_time = data.end_time;
    this.duration_hours = data.duration_hours;
    this.status = data.status || 'scheduled';
    this.notes = data.notes;
    this.location = data.location;
    this.estimated_price = data.estimated_price;
    this.deposit_amount = data.deposit_amount;
    this.deposit_paid = data.deposit_paid || false;
    this.reminder_sent = data.reminder_sent || false;
    this.cancellation_reason = data.cancellation_reason;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT 
          a.*,
          CONCAT(up_client.first_name, ' ', up_client.last_name) as client_name,
          u_client.email as client_email,
          up_client.phone as client_phone,
          CONCAT(up_artist.first_name, ' ', up_artist.last_name) as artist_name,
          u_artist.email as artist_email,
          to_offer.title as request_title,
          to_offer.description as request_description
        FROM appointments a
        LEFT JOIN users u_client ON a.client_id = u_client.id
        LEFT JOIN user_profiles up_client ON u_client.id = up_client.user_id
        LEFT JOIN users u_artist ON a.artist_id = u_artist.id
        LEFT JOIN user_profiles up_artist ON u_artist.id = up_artist.user_id
        LEFT JOIN proposals p ON a.proposal_id = p.id
        LEFT JOIN tattoo_offers to_offer ON p.offer_id = to_offer.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.artist_id) {
        query += ` AND a.artist_id = ?`;
        params.push(filters.artist_id);
      }
      
      if (filters.client_id) {
        query += ` AND a.client_id = ?`;
        params.push(filters.client_id);
      }
      
      if (filters.status) {
        query += ` AND a.status = ?`;
        params.push(filters.status);
      }
      
      if (filters.date_from) {
        query += ` AND a.appointment_date >= ?`;
        params.push(filters.date_from);
      }
      
      if (filters.date_to) {
        query += ` AND a.appointment_date <= ?`;
        params.push(filters.date_to);
      }
      
      query += ` ORDER BY a.appointment_date ASC, a.start_time ASC`;
      
      const [rows] = await db.execute(query, params);
      return rows.map(row => new Appointment(row));
    } catch (error) {
      throw new Error(`Error finding appointments: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT 
          a.*,
          CONCAT(up_client.first_name, ' ', up_client.last_name) as client_name,
          u_client.email as client_email,
          up_client.phone as client_phone,
          CONCAT(up_artist.first_name, ' ', up_artist.last_name) as artist_name,
          u_artist.email as artist_email,
          to_offer.title as request_title,
          to_offer.description as request_description
        FROM appointments a
        LEFT JOIN users u_client ON a.client_id = u_client.id
        LEFT JOIN user_profiles up_client ON u_client.id = up_client.user_id
        LEFT JOIN users u_artist ON a.artist_id = u_artist.id
        LEFT JOIN user_profiles up_artist ON u_artist.id = up_artist.user_id
        LEFT JOIN proposals p ON a.proposal_id = p.id
        LEFT JOIN tattoo_offers to_offer ON p.offer_id = to_offer.id
        WHERE a.id = ?
      `;
      
      const [rows] = await db.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Appointment(rows[0]);
    } catch (error) {
      throw new Error(`Error finding appointment: ${error.message}`);
    }
  }

  static async create(data) {
    try {
      const query = `
        INSERT INTO appointments (
          artist_id, client_id, proposal_id, appointment_date, start_time, end_time,
          duration_hours, status, notes, location, estimated_price, deposit_amount,
          deposit_paid, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const [result] = await db.execute(query, [
        data.artist_id,
        data.client_id,
        data.proposal_id,
        data.appointment_date,
        data.start_time,
        data.end_time,
        data.duration_hours,
        data.status || 'scheduled',
        data.notes || null,
        data.location || null,
        data.estimated_price || null,
        data.deposit_amount || null,
        data.deposit_paid || false
      ]);
      
      return await this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Error creating appointment: ${error.message}`);
    }
  }

  async update(data) {
    try {
      const fields = [];
      const values = [];
      
      if (data.appointment_date !== undefined) {
        fields.push('appointment_date = ?');
        values.push(data.appointment_date);
      }
      
      if (data.start_time !== undefined) {
        fields.push('start_time = ?');
        values.push(data.start_time);
      }
      
      if (data.end_time !== undefined) {
        fields.push('end_time = ?');
        values.push(data.end_time);
      }
      
      if (data.duration_hours !== undefined) {
        fields.push('duration_hours = ?');
        values.push(data.duration_hours);
      }
      
      if (data.status !== undefined) {
        fields.push('status = ?');
        values.push(data.status);
      }
      
      if (data.notes !== undefined) {
        fields.push('notes = ?');
        values.push(data.notes);
      }
      
      if (data.location !== undefined) {
        fields.push('location = ?');
        values.push(data.location);
      }
      
      if (data.estimated_price !== undefined) {
        fields.push('estimated_price = ?');
        values.push(data.estimated_price);
      }
      
      if (data.deposit_amount !== undefined) {
        fields.push('deposit_amount = ?');
        values.push(data.deposit_amount);
      }
      
      if (data.deposit_paid !== undefined) {
        fields.push('deposit_paid = ?');
        values.push(data.deposit_paid);
      }
      
      if (data.reminder_sent !== undefined) {
        fields.push('reminder_sent = ?');
        values.push(data.reminder_sent);
      }
      
      if (data.cancellation_reason !== undefined) {
        fields.push('cancellation_reason = ?');
        values.push(data.cancellation_reason);
      }
      
      if (fields.length === 0) {
        return this;
      }
      
      fields.push('updated_at = NOW()');
      values.push(this.id);
      
      const query = `UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`;
      await db.execute(query, values);
      
      return await this.constructor.findById(this.id);
    } catch (error) {
      throw new Error(`Error updating appointment: ${error.message}`);
    }
  }

  async delete() {
    try {
      const query = `DELETE FROM appointments WHERE id = ?`;
      await db.execute(query, [this.id]);
      return true;
    } catch (error) {
      throw new Error(`Error deleting appointment: ${error.message}`);
    }
  }

  static async findByProposalId(proposalId) {
    try {
      const query = `
        SELECT 
          a.*,
          u_client.name as client_name,
          u_client.email as client_email,
          u_artist.name as artist_name,
          u_artist.email as artist_email
        FROM appointments a
        LEFT JOIN users u_client ON a.client_id = u_client.id
        LEFT JOIN users u_artist ON a.artist_id = u_artist.id
        WHERE a.proposal_id = ?
        ORDER BY a.appointment_date ASC, a.start_time ASC
      `;
      
      const [rows] = await db.execute(query, [proposalId]);
      return rows.map(row => new Appointment(row));
    } catch (error) {
      throw new Error(`Error finding appointments by proposal: ${error.message}`);
    }
  }

  static async findUpcoming(artistId, days = 7) {
    try {
      const query = `
        SELECT 
          a.*,
          u_client.name as client_name,
          u_client.email as client_email,
          u_client.phone as client_phone,
          to_offer.title as request_title
        FROM appointments a
        LEFT JOIN users u_client ON a.client_id = u_client.id
        LEFT JOIN proposals p ON a.proposal_id = p.id
        LEFT JOIN tattoo_offers to_offer ON p.offer_id = to_offer.id
        WHERE a.artist_id = ? 
          AND a.appointment_date >= CURDATE() 
          AND a.appointment_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
          AND a.status IN ('scheduled', 'confirmed')
        ORDER BY a.appointment_date ASC, a.start_time ASC
      `;
      
      const [rows] = await db.execute(query, [artistId, days]);
      return rows.map(row => new Appointment(row));
    } catch (error) {
      throw new Error(`Error finding upcoming appointments: ${error.message}`);
    }
  }

  static async checkAvailability(artistId, date, startTime, endTime, excludeId = null) {
    try {
      let query = `
        SELECT COUNT(*) as count
        FROM appointments
        WHERE artist_id = ? 
          AND appointment_date = ?
          AND status IN ('scheduled', 'confirmed')
          AND (
            (start_time <= ? AND end_time > ?) OR
            (start_time < ? AND end_time >= ?) OR
            (start_time >= ? AND end_time <= ?)
          )
      `;
      
      const params = [artistId, date, startTime, startTime, endTime, endTime, startTime, endTime];
      
      if (excludeId) {
        query += ` AND id != ?`;
        params.push(excludeId);
      }
      
      const [rows] = await db.execute(query, params);
      return rows[0].count === 0;
    } catch (error) {
      throw new Error(`Error checking availability: ${error.message}`);
    }
  }

  static async getStats(artistId) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
          COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
          COUNT(CASE WHEN status = 'no_show' THEN 1 END) as no_show,
          SUM(CASE WHEN status = 'completed' THEN estimated_price ELSE 0 END) as total_revenue,
          AVG(CASE WHEN status = 'completed' THEN duration_hours ELSE NULL END) as avg_duration
        FROM appointments
        WHERE artist_id = ?
      `;
      
      const [rows] = await db.execute(query, [artistId]);
      return rows[0];
    } catch (error) {
      throw new Error(`Error getting appointment stats: ${error.message}`);
    }
  }
}

module.exports = Appointment;