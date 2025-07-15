-- ==============================================
-- PalTattoo Database Setup Script
-- ==============================================

-- Create database
CREATE DATABASE IF NOT EXISTS paltattoo 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE paltattoo;

-- ==============================================
-- Core Tables
-- ==============================================

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('client', 'artist') NOT NULL,
    google_id VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expires DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User profiles table
CREATE TABLE user_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL,
    bio TEXT NULL,
    profile_image VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==============================================
-- Geographic Tables
-- ==============================================

-- Regions table
CREATE TABLE regions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL
);

-- Comunas table
CREATE TABLE comunas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    region_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (region_id) REFERENCES regions(id)
);

-- ==============================================
-- Catalog Tables
-- ==============================================

-- Tattoo styles table
CREATE TABLE tattoo_styles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Body parts table
CREATE TABLE body_parts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Color types table
CREATE TABLE color_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- User Specific Tables
-- ==============================================

-- Clients table
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    comuna_id INT NULL,
    birth_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comuna_id) REFERENCES comunas(id)
);

-- Tattoo artists table
CREATE TABLE tattoo_artists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    studio_name VARCHAR(255) NULL,
    comuna_id INT NULL,
    address TEXT NULL,
    years_experience INT DEFAULT 0,
    min_price DECIMAL(10,2) NULL,
    max_price DECIMAL(10,2) NULL,
    instagram_url VARCHAR(255) NULL,
    is_verified BOOLEAN DEFAULT false,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comuna_id) REFERENCES comunas(id)
);

-- Artist styles relationship
CREATE TABLE artist_styles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    artist_id INT NOT NULL,
    style_id INT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES tattoo_artists(id) ON DELETE CASCADE,
    FOREIGN KEY (style_id) REFERENCES tattoo_styles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_artist_style (artist_id, style_id)
);

-- ==============================================
-- Portfolio Tables
-- ==============================================

-- Portfolio images table
CREATE TABLE portfolio_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    artist_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    title VARCHAR(255) NULL,
    description TEXT NULL,
    style_id INT NULL,
    is_featured BOOLEAN DEFAULT false,
    media_type ENUM('image', 'video') DEFAULT 'image',
    thumbnail_url VARCHAR(255) NULL,
    duration INT NULL,
    file_size INT NULL,
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES tattoo_artists(id) ON DELETE CASCADE,
    FOREIGN KEY (style_id) REFERENCES tattoo_styles(id)
);

-- ==============================================
-- Offers and Proposals Tables
-- ==============================================

-- Tattoo offers table
CREATE TABLE tattoo_offers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    body_part_id INT NOT NULL,
    style_id INT NOT NULL,
    color_type_id INT NOT NULL,
    size_description VARCHAR(255) NULL,
    budget_min DECIMAL(10,2) NULL,
    budget_max DECIMAL(10,2) NULL,
    deadline DATE NULL,
    status ENUM('active', 'in_progress', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (body_part_id) REFERENCES body_parts(id),
    FOREIGN KEY (style_id) REFERENCES tattoo_styles(id),
    FOREIGN KEY (color_type_id) REFERENCES color_types(id)
);

-- Offer reference images
CREATE TABLE offer_references (
    id INT PRIMARY KEY AUTO_INCREMENT,
    offer_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES tattoo_offers(id) ON DELETE CASCADE
);

-- Proposals table
CREATE TABLE proposals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    offer_id INT NOT NULL,
    artist_id INT NOT NULL,
    message TEXT NOT NULL,
    proposed_price DECIMAL(10,2) NOT NULL,
    estimated_duration INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'withdrawn') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (offer_id) REFERENCES tattoo_offers(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES tattoo_artists(id) ON DELETE CASCADE,
    UNIQUE KEY unique_offer_artist (offer_id, artist_id)
);

-- ==============================================
-- Subscription Tables
-- ==============================================

-- Subscription plans table
CREATE TABLE subscription_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle ENUM('monthly', 'yearly') NOT NULL,
    features JSON NOT NULL,
    max_portfolio_images INT DEFAULT -1,
    max_active_requests INT DEFAULT -1,
    priority_support BOOLEAN DEFAULT false,
    featured_listing BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    mercadopago_subscription_id VARCHAR(255) NULL,
    status ENUM('pending', 'active', 'cancelled', 'expired') DEFAULT 'pending',
    start_date DATETIME NULL,
    end_date DATETIME NULL,
    next_billing_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- ==============================================
-- Payment Tables
-- ==============================================

-- Payments table
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    subscription_id INT NULL,
    mercadopago_payment_id VARCHAR(255) NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'CLP',
    payment_method VARCHAR(50) NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled', 'refunded') DEFAULT 'pending',
    transaction_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
);

-- ==============================================
-- Calendar and Appointments Tables
-- ==============================================

-- Availability table
CREATE TABLE availability (
    id INT PRIMARY KEY AUTO_INCREMENT,
    artist_id INT NOT NULL,
    day_of_week TINYINT NOT NULL, -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start_time TIME NULL,
    break_end_time TIME NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES tattoo_artists(id) ON DELETE CASCADE
);

-- Appointments table
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    artist_id INT NOT NULL,
    client_id INT NOT NULL,
    proposal_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    notes TEXT NULL,
    cancellation_reason TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES tattoo_artists(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id)
);

-- ==============================================
-- Reviews and Ratings Tables
-- ==============================================

-- Reviews table
CREATE TABLE reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    artist_id INT NOT NULL,
    appointment_id INT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (artist_id) REFERENCES tattoo_artists(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    UNIQUE KEY unique_client_artist_appointment (client_id, artist_id, appointment_id)
);

-- ==============================================
-- Sponsored Shops Tables
-- ==============================================

-- Sponsored shops table
CREATE TABLE sponsored_shops (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    website_url VARCHAR(255) NULL,
    instagram_url VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    email VARCHAR(255) NULL,
    address TEXT NULL,
    comuna_id INT NULL,
    logo_url VARCHAR(255) NULL,
    cover_image_url VARCHAR(255) NULL,
    is_featured BOOLEAN DEFAULT false,
    click_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (comuna_id) REFERENCES comunas(id)
);

-- Shop reviews table
CREATE TABLE shop_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    shop_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES sponsored_shops(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_shop_user_review (shop_id, user_id)
);

-- ==============================================
-- Indexes for Performance
-- ==============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_google_id ON users(google_id);

-- Offers indexes
CREATE INDEX idx_offers_status ON tattoo_offers(status);
CREATE INDEX idx_offers_created_at ON tattoo_offers(created_at);
CREATE INDEX idx_offers_style_id ON tattoo_offers(style_id);
CREATE INDEX idx_offers_body_part_id ON tattoo_offers(body_part_id);

-- Proposals indexes
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_offer_id ON proposals(offer_id);
CREATE INDEX idx_proposals_artist_id ON proposals(artist_id);

-- Artists indexes
CREATE INDEX idx_artists_comuna_id ON tattoo_artists(comuna_id);
CREATE INDEX idx_artists_is_verified ON tattoo_artists(is_verified);
CREATE INDEX idx_artists_rating ON tattoo_artists(rating);

-- Portfolio indexes
CREATE INDEX idx_portfolio_artist_id ON portfolio_images(artist_id);
CREATE INDEX idx_portfolio_is_featured ON portfolio_images(is_featured);

-- Appointments indexes
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_artist_id ON appointments(artist_id);
CREATE INDEX idx_appointments_status ON appointments(status);