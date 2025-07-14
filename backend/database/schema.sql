-- Create database if not exists
CREATE DATABASE IF NOT EXISTS tattoo_connect;
USE tattoo_connect;

-- Users table (base authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('client', 'artist', 'admin') NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User profiles (common data for all users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    profile_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Comunas table
CREATE TABLE IF NOT EXISTS comunas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tattoo styles catalog
CREATE TABLE IF NOT EXISTS tattoo_styles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Body parts catalog
CREATE TABLE IF NOT EXISTS body_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Color types catalog
CREATE TABLE IF NOT EXISTS color_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tattoo artists specific information
CREATE TABLE IF NOT EXISTS tattoo_artists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bio TEXT,
    studio_name VARCHAR(255),
    instagram VARCHAR(100),
    whatsapp VARCHAR(20),
    comuna_id INT,
    address TEXT,
    years_experience INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    subscription_type ENUM('free', 'basic', 'premium') DEFAULT 'free',
    subscription_expires_at DATETIME,
    portfolio_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comuna_id) REFERENCES comunas(id)
);

-- Artist specialties (many-to-many)
CREATE TABLE IF NOT EXISTS artist_styles (
    artist_id INT NOT NULL,
    style_id INT NOT NULL,
    PRIMARY KEY (artist_id, style_id),
    FOREIGN KEY (artist_id) REFERENCES tattoo_artists(id) ON DELETE CASCADE,
    FOREIGN KEY (style_id) REFERENCES tattoo_styles(id) ON DELETE CASCADE
);

-- Clients specific information
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    comuna_id INT,
    preferences TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comuna_id) REFERENCES comunas(id)
);

-- Tattoo offers/requests from clients
CREATE TABLE IF NOT EXISTS tattoo_offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    style_id INT,
    body_part_id INT,
    color_type_id INT,
    comuna_id INT,
    size_approximate VARCHAR(100),
    urgency ENUM('flexible', 'this_month', 'this_week', 'urgent') DEFAULT 'flexible',
    status ENUM('active', 'in_progress', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (style_id) REFERENCES tattoo_styles(id),
    FOREIGN KEY (body_part_id) REFERENCES body_parts(id),
    FOREIGN KEY (color_type_id) REFERENCES color_types(id),
    FOREIGN KEY (comuna_id) REFERENCES comunas(id)
);

-- Reference images for offers
CREATE TABLE IF NOT EXISTS offer_references (
    id INT AUTO_INCREMENT PRIMARY KEY,
    offer_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES tattoo_offers(id) ON DELETE CASCADE
);

-- Proposals from artists to offers
CREATE TABLE IF NOT EXISTS proposals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    offer_id INT NOT NULL,
    artist_id INT NOT NULL,
    message TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    estimated_time VARCHAR(100),
    portfolio_examples TEXT,
    status ENUM('pending', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES tattoo_offers(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES tattoo_artists(id) ON DELETE CASCADE,
    UNIQUE KEY unique_proposal (offer_id, artist_id)
);

-- Portfolio items for artists
CREATE TABLE IF NOT EXISTS portfolio_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    artist_id INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    media_type ENUM('image', 'video') NOT NULL,
    media_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    style_id INT,
    is_featured BOOLEAN DEFAULT false,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES tattoo_artists(id) ON DELETE CASCADE,
    FOREIGN KEY (style_id) REFERENCES tattoo_styles(id)
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    artist_id INT NOT NULL,
    offer_id INT,
    proposal_id INT,
    appointment_date DATETIME NOT NULL,
    duration_hours INT DEFAULT 1,
    status ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES tattoo_artists(id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES tattoo_offers(id),
    FOREIGN KEY (proposal_id) REFERENCES proposals(id)
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    artist_id INT,
    offer_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES tattoo_artists(id) ON DELETE CASCADE,
    FOREIGN KEY (offer_id) REFERENCES tattoo_offers(id) ON DELETE CASCADE
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    artist_id INT NOT NULL,
    appointment_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES tattoo_artists(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSON,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better performance (Skip if exists)
-- CREATE INDEX idx_offers_status ON tattoo_offers(status);
-- CREATE INDEX idx_offers_comuna ON tattoo_offers(comuna_id);
-- CREATE INDEX idx_offers_style ON tattoo_offers(style_id);
-- CREATE INDEX idx_proposals_status ON proposals(status);
-- CREATE INDEX idx_appointments_date ON appointments(appointment_date);
-- CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);