-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    artist_id INT NOT NULL,
    client_id INT NOT NULL,
    proposal_id INT,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(3,1) NOT NULL DEFAULT 1.0,
    status ENUM('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show') DEFAULT 'scheduled',
    notes TEXT,
    location VARCHAR(255),
    estimated_price DECIMAL(10,2),
    deposit_amount DECIMAL(10,2),
    deposit_paid BOOLEAN DEFAULT FALSE,
    reminder_sent BOOLEAN DEFAULT FALSE,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL,
    
    INDEX idx_artist_date (artist_id, appointment_date),
    INDEX idx_client_date (client_id, appointment_date),
    INDEX idx_status (status),
    INDEX idx_appointment_datetime (appointment_date, start_time)
);

-- Create availability table
CREATE TABLE IF NOT EXISTS availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    artist_id INT NOT NULL,
    day_of_week TINYINT NOT NULL, -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    break_start TIME,
    break_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_artist_availability (artist_id, day_of_week, is_available),
    
    -- Ensure no overlapping availability for the same artist on the same day
    UNIQUE KEY unique_artist_day_time (artist_id, day_of_week, start_time, end_time)
);

-- Insert default availability for all existing artists (9 AM to 6 PM, Monday to Friday)
INSERT INTO availability (artist_id, day_of_week, start_time, end_time, is_available, break_start, break_end)
SELECT 
    id as artist_id,
    day_of_week,
    '09:00:00' as start_time,
    '18:00:00' as end_time,
    TRUE as is_available,
    '13:00:00' as break_start,
    '14:00:00' as break_end
FROM users
CROSS JOIN (
    SELECT 1 as day_of_week UNION ALL
    SELECT 2 UNION ALL
    SELECT 3 UNION ALL
    SELECT 4 UNION ALL
    SELECT 5
) days
WHERE users.type = 'artist'
ON DUPLICATE KEY UPDATE artist_id = artist_id; -- Avoid duplicates if running multiple times

-- Create appointment_history table for tracking changes
CREATE TABLE IF NOT EXISTS appointment_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL,
    changed_by INT NOT NULL,
    change_type ENUM('created', 'updated', 'cancelled', 'completed') NOT NULL,
    old_values JSON,
    new_values JSON,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_appointment_history (appointment_id),
    INDEX idx_change_date (created_at)
);

-- Create triggers to automatically log appointment changes
DELIMITER $$

CREATE TRIGGER appointment_insert_trigger
AFTER INSERT ON appointments
FOR EACH ROW
BEGIN
    INSERT INTO appointment_history (appointment_id, changed_by, change_type, new_values, notes)
    VALUES (
        NEW.id,
        NEW.artist_id,
        'created',
        JSON_OBJECT(
            'appointment_date', NEW.appointment_date,
            'start_time', NEW.start_time,
            'end_time', NEW.end_time,
            'status', NEW.status,
            'estimated_price', NEW.estimated_price
        ),
        'Appointment created'
    );
END$$

CREATE TRIGGER appointment_update_trigger
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    INSERT INTO appointment_history (appointment_id, changed_by, change_type, old_values, new_values, notes)
    VALUES (
        NEW.id,
        NEW.artist_id,
        CASE 
            WHEN OLD.status != NEW.status AND NEW.status = 'cancelled' THEN 'cancelled'
            WHEN OLD.status != NEW.status AND NEW.status = 'completed' THEN 'completed'
            ELSE 'updated'
        END,
        JSON_OBJECT(
            'appointment_date', OLD.appointment_date,
            'start_time', OLD.start_time,
            'end_time', OLD.end_time,
            'status', OLD.status,
            'estimated_price', OLD.estimated_price
        ),
        JSON_OBJECT(
            'appointment_date', NEW.appointment_date,
            'start_time', NEW.start_time,
            'end_time', NEW.end_time,
            'status', NEW.status,
            'estimated_price', NEW.estimated_price
        ),
        CASE 
            WHEN OLD.status != NEW.status AND NEW.status = 'cancelled' THEN CONCAT('Appointment cancelled: ', COALESCE(NEW.cancellation_reason, 'No reason provided'))
            WHEN OLD.status != NEW.status AND NEW.status = 'completed' THEN 'Appointment completed'
            ELSE 'Appointment updated'
        END
    );
END$$

DELIMITER ;

-- Create indexes for better query performance
CREATE INDEX idx_appointments_upcoming ON appointments (artist_id, appointment_date, start_time, status);
CREATE INDEX idx_appointments_client_upcoming ON appointments (client_id, appointment_date, start_time, status);
CREATE INDEX idx_availability_lookup ON availability (artist_id, day_of_week, is_available, start_time, end_time);

-- Create view for upcoming appointments with client details
CREATE VIEW upcoming_appointments AS
SELECT 
    a.id,
    a.artist_id,
    a.client_id,
    a.proposal_id,
    a.appointment_date,
    a.start_time,
    a.end_time,
    a.duration_hours,
    a.status,
    a.notes,
    a.location,
    a.estimated_price,
    a.deposit_amount,
    a.deposit_paid,
    u_client.name as client_name,
    u_client.email as client_email,
    u_client.phone as client_phone,
    u_artist.name as artist_name,
    u_artist.email as artist_email,
    tr.title as request_title,
    tr.description as request_description
FROM appointments a
LEFT JOIN users u_client ON a.client_id = u_client.id
LEFT JOIN users u_artist ON a.artist_id = u_artist.id
LEFT JOIN proposals p ON a.proposal_id = p.id
LEFT JOIN tattoo_requests tr ON p.tattoo_request_id = tr.id
WHERE a.appointment_date >= CURDATE() 
  AND a.status IN ('scheduled', 'confirmed')
ORDER BY a.appointment_date ASC, a.start_time ASC;