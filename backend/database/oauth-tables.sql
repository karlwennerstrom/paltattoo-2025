-- Add OAuth fields to users table
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) UNIQUE,
ADD COLUMN google_access_token TEXT,
ADD COLUMN profile_picture VARCHAR(255),
ADD COLUMN password_reset_token VARCHAR(255),
ADD COLUMN password_reset_expires TIMESTAMP,
ADD COLUMN last_login TIMESTAMP,
ADD COLUMN email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN first_name VARCHAR(100),
ADD COLUMN last_name VARCHAR(100),
ADD COLUMN name VARCHAR(200);

-- Add indexes for better performance
CREATE INDEX idx_users_google_id ON users (google_id);
CREATE INDEX idx_users_password_reset_token ON users (password_reset_token);
CREATE INDEX idx_users_email_verified ON users (email_verified);
CREATE INDEX idx_users_last_login ON users (last_login);

-- Update existing users to have email_verified = true if they have a password
UPDATE users SET email_verified = TRUE WHERE password IS NOT NULL;

-- Add OAuth providers table for future extensibility
CREATE TABLE IF NOT EXISTS oauth_providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    provider ENUM('google', 'facebook', 'apple', 'github') NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    profile_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_oauth_user_provider (user_id, provider),
    INDEX idx_oauth_provider_id (provider, provider_id),
    
    UNIQUE KEY unique_user_provider (user_id, provider),
    UNIQUE KEY unique_provider_account (provider, provider_id)
);

-- Add session storage table for Passport sessions
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    expires INT(11) UNSIGNED NOT NULL,
    data MEDIUMTEXT COLLATE utf8mb4_bin,
    PRIMARY KEY (session_id)
);

-- Add user login history table
CREATE TABLE IF NOT EXISTS user_login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_method ENUM('email', 'google', 'facebook', 'apple', 'github') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN DEFAULT TRUE,
    failure_reason VARCHAR(255),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_login_history_user (user_id, login_at),
    INDEX idx_login_history_method (login_method),
    INDEX idx_login_history_ip (ip_address)
);

-- Add user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    language VARCHAR(10) DEFAULT 'es',
    timezone VARCHAR(50) DEFAULT 'America/Santiago',
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT TRUE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    privacy_settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_preferences (user_id)
);

-- Insert default preferences for existing users
INSERT INTO user_preferences (user_id, language, timezone, email_notifications, push_notifications, marketing_emails)
SELECT id, 'es', 'America/Santiago', TRUE, TRUE, TRUE
FROM users
WHERE id NOT IN (SELECT user_id FROM user_preferences);

-- Add email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_email_verification_token (token),
    INDEX idx_email_verification_email (email),
    INDEX idx_email_verification_expires (expires_at)
);

-- Add two-factor authentication table
CREATE TABLE IF NOT EXISTS two_factor_auth (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    secret VARCHAR(255) NOT NULL,
    backup_codes JSON,
    enabled BOOLEAN DEFAULT FALSE,
    last_used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_2fa (user_id)
);

-- Add account linking table for multiple OAuth providers
CREATE TABLE IF NOT EXISTS account_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    linked_user_id INT NOT NULL,
    link_type ENUM('oauth_merge', 'manual_link', 'admin_link') NOT NULL,
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    linked_by INT,
    notes TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (linked_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (linked_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_account_links_user (user_id),
    INDEX idx_account_links_linked (linked_user_id),
    
    UNIQUE KEY unique_account_link (user_id, linked_user_id)
);

-- Create view for user authentication info
CREATE VIEW user_auth_info AS
SELECT 
    u.id,
    u.email,
    u.name,
    u.first_name,
    u.last_name,
    u.user_type,
    u.is_active,
    u.email_verified,
    u.profile_picture,
    u.last_login,
    u.created_at,
    GROUP_CONCAT(DISTINCT op.provider) as oauth_providers,
    up.language,
    up.timezone,
    up.email_notifications,
    up.push_notifications,
    up.marketing_emails,
    up.two_factor_enabled,
    tfa.enabled as has_2fa_enabled
FROM users u
LEFT JOIN oauth_providers op ON u.id = op.user_id
LEFT JOIN user_preferences up ON u.id = up.user_id
LEFT JOIN two_factor_auth tfa ON u.id = tfa.user_id
GROUP BY u.id;

-- Add function to clean up expired tokens
DELIMITER $$

CREATE EVENT IF NOT EXISTS cleanup_expired_tokens
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    -- Clean up expired password reset tokens
    UPDATE users 
    SET password_reset_token = NULL, password_reset_expires = NULL
    WHERE password_reset_expires < NOW();
    
    -- Clean up expired email verification tokens
    DELETE FROM email_verification_tokens 
    WHERE expires_at < NOW() AND used_at IS NULL;
    
    -- Clean up old login history (keep last 90 days)
    DELETE FROM user_login_history 
    WHERE login_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
    
    -- Clean up old sessions
    DELETE FROM sessions 
    WHERE expires < UNIX_TIMESTAMP();
END$$

DELIMITER ;

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;