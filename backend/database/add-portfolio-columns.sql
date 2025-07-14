-- Add new columns to portfolio_images table for multimedia support
USE tattoo_connect;

ALTER TABLE portfolio_images 
ADD COLUMN media_type ENUM('image', 'video') DEFAULT 'image' AFTER is_featured,
ADD COLUMN thumbnail_url VARCHAR(255) NULL AFTER media_type,
ADD COLUMN duration DECIMAL(5,2) NULL AFTER thumbnail_url,
ADD COLUMN file_size INT NULL AFTER duration,
ADD COLUMN created_by INT NULL AFTER file_size,
ADD COLUMN category VARCHAR(50) NULL AFTER created_by,
ADD INDEX idx_media_type (media_type),
ADD INDEX idx_category (category);