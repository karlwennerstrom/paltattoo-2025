-- Create sponsored shops table
CREATE TABLE IF NOT EXISTS sponsored_shops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    instagram VARCHAR(100),
    facebook VARCHAR(255),
    logo_url VARCHAR(255),
    cover_image_url VARCHAR(255),
    business_hours JSON,
    category ENUM('aftercare', 'equipment', 'supplies', 'apparel', 'piercing', 'jewelry', 'studio', 'other') NOT NULL,
    tags TEXT, -- Comma-separated tags
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    featured_until DATETIME,
    click_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_active (is_active),
    INDEX idx_featured (is_featured, featured_until),
    INDEX idx_category (category),
    INDEX idx_location (city, region),
    INDEX idx_search (name, category),
    INDEX idx_stats (click_count, view_count),
    
    FULLTEXT idx_fulltext_search (name, description, tags)
);

-- Create shop reviews table
CREATE TABLE IF NOT EXISTS shop_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (shop_id) REFERENCES sponsored_shops(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_shop_rating (shop_id, rating),
    INDEX idx_user_reviews (user_id),
    INDEX idx_approved (is_approved),
    
    UNIQUE KEY unique_user_shop_review (user_id, shop_id)
);

-- Create shop gallery table for additional images
CREATE TABLE IF NOT EXISTS shop_gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    caption TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (shop_id) REFERENCES sponsored_shops(id) ON DELETE CASCADE,
    
    INDEX idx_shop_gallery (shop_id, display_order)
);

-- Create shop analytics table for tracking
CREATE TABLE IF NOT EXISTS shop_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    event_type ENUM('view', 'click', 'contact', 'website_visit') NOT NULL,
    user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (shop_id) REFERENCES sponsored_shops(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_shop_analytics (shop_id, event_type, created_at),
    INDEX idx_user_analytics (user_id, created_at)
);

-- Insert sample sponsored shops
INSERT INTO sponsored_shops (
    name, description, address, city, region, phone, email, website, 
    instagram, facebook, category, tags, is_active, is_featured, 
    business_hours, featured_until
) VALUES
(
    'TattooSupply Pro',
    'Tu tienda de confianza para todos los suministros de tatuaje. Ofrecemos las mejores marcas en tintas, agujas, máquinas y equipos profesionales.',
    'Av. Providencia 1234',
    'Santiago',
    'Metropolitana',
    '+56912345678',
    'info@tattoosupplypro.cl',
    'https://www.tattoosupplypro.cl',
    '@tattoosupplypro',
    'TattooSupplyPro',
    'supplies',
    'tintas,agujas,máquinas,equipos,profesional',
    TRUE,
    TRUE,
    JSON_OBJECT(
        'monday', JSON_OBJECT('open', '09:00', 'close', '18:00'),
        'tuesday', JSON_OBJECT('open', '09:00', 'close', '18:00'),
        'wednesday', JSON_OBJECT('open', '09:00', 'close', '18:00'),
        'thursday', JSON_OBJECT('open', '09:00', 'close', '18:00'),
        'friday', JSON_OBJECT('open', '09:00', 'close', '18:00'),
        'saturday', JSON_OBJECT('open', '10:00', 'close', '16:00'),
        'sunday', JSON_OBJECT('open', null, 'close', null)
    ),
    DATE_ADD(NOW(), INTERVAL 30 DAY)
),
(
    'Aftercare Solutions',
    'Productos especializados para el cuidado post-tatuaje. Cremas, lociones y productos naturales para una mejor cicatrización.',
    'Calle Huérfanos 567',
    'Santiago',
    'Metropolitana',
    '+56987654321',
    'contacto@aftercaresolutions.cl',
    'https://www.aftercaresolutions.cl',
    '@aftercaresolutions',
    'AftercareSolutions',
    'aftercare',
    'cremas,cuidado,cicatrización,natural,post-tatuaje',
    TRUE,
    TRUE,
    JSON_OBJECT(
        'monday', JSON_OBJECT('open', '10:00', 'close', '19:00'),
        'tuesday', JSON_OBJECT('open', '10:00', 'close', '19:00'),
        'wednesday', JSON_OBJECT('open', '10:00', 'close', '19:00'),
        'thursday', JSON_OBJECT('open', '10:00', 'close', '19:00'),
        'friday', JSON_OBJECT('open', '10:00', 'close', '20:00'),
        'saturday', JSON_OBJECT('open', '10:00', 'close', '18:00'),
        'sunday', JSON_OBJECT('open', '11:00', 'close', '16:00')
    ),
    DATE_ADD(NOW(), INTERVAL 15 DAY)
),
(
    'Ink & Steel Studio Equipment',
    'Equipos profesionales para estudios de tatuaje. Máquinas rotativas, bobinas, fuentes de poder y mobiliario especializado.',
    'Av. Italia 890',
    'Valparaíso',
    'Valparaíso',
    '+56945678901',
    'ventas@inksteel.cl',
    'https://www.inksteel.cl',
    '@inksteel',
    'InkSteelChile',
    'equipment',
    'máquinas,rotativas,bobinas,fuentes,mobiliario',
    TRUE,
    FALSE,
    JSON_OBJECT(
        'monday', JSON_OBJECT('open', '09:30', 'close', '18:30'),
        'tuesday', JSON_OBJECT('open', '09:30', 'close', '18:30'),
        'wednesday', JSON_OBJECT('open', '09:30', 'close', '18:30'),
        'thursday', JSON_OBJECT('open', '09:30', 'close', '18:30'),
        'friday', JSON_OBJECT('open', '09:30', 'close', '18:30'),
        'saturday', JSON_OBJECT('open', '10:00', 'close', '15:00'),
        'sunday', JSON_OBJECT('open', null, 'close', null)
    ),
    NULL
),
(
    'Body Jewelry Boutique',
    'Joyería corporal de alta calidad. Piercings, expansores, tunnels y accesorios únicos en acero quirúrgico y titanio.',
    'Paseo Ahumada 123',
    'Santiago',
    'Metropolitana',
    '+56923456789',
    'info@bodyjewelry.cl',
    'https://www.bodyjewelry.cl',
    '@bodyjewelryboutique',
    'BodyJewelryBoutique',
    'jewelry',
    'piercings,expansores,tunnels,acero,titanio',
    TRUE,
    TRUE,
    JSON_OBJECT(
        'monday', JSON_OBJECT('open', '11:00', 'close', '20:00'),
        'tuesday', JSON_OBJECT('open', '11:00', 'close', '20:00'),
        'wednesday', JSON_OBJECT('open', '11:00', 'close', '20:00'),
        'thursday', JSON_OBJECT('open', '11:00', 'close', '20:00'),
        'friday', JSON_OBJECT('open', '11:00', 'close', '21:00'),
        'saturday', JSON_OBJECT('open', '11:00', 'close', '21:00'),
        'sunday', JSON_OBJECT('open', '12:00', 'close', '19:00')
    ),
    DATE_ADD(NOW(), INTERVAL 60 DAY)
),
(
    'Tattoo Fashion Store',
    'Ropa y accesorios para los amantes del arte corporal. Camisetas, hoodies, gorras y merchandise exclusivo.',
    'Av. Manuel Montt 456',
    'Santiago',
    'Metropolitana',
    '+56911223344',
    'tienda@tattoofashion.cl',
    'https://www.tattoofashion.cl',
    '@tattoofashionstore',
    'TattooFashionStore',
    'apparel',
    'camisetas,hoodies,gorras,ropa,merchandise',
    TRUE,
    FALSE,
    JSON_OBJECT(
        'monday', JSON_OBJECT('open', '10:00', 'close', '19:00'),
        'tuesday', JSON_OBJECT('open', '10:00', 'close', '19:00'),
        'wednesday', JSON_OBJECT('open', '10:00', 'close', '19:00'),
        'thursday', JSON_OBJECT('open', '10:00', 'close', '19:00'),
        'friday', JSON_OBJECT('open', '10:00', 'close', '20:00'),
        'saturday', JSON_OBJECT('open', '10:00', 'close', '20:00'),
        'sunday', JSON_OBJECT('open', '12:00', 'close', '18:00')
    ),
    NULL
);

-- Insert sample reviews
INSERT INTO shop_reviews (shop_id, user_id, rating, review_text, is_approved) VALUES
(1, 1, 5, 'Excelente servicio y productos de primera calidad. Muy recomendado para profesionales.', TRUE),
(1, 2, 4, 'Buenos precios y atención rápida. Amplio catálogo de productos.', TRUE),
(2, 3, 5, 'Los productos de cuidado son increíbles. Mi tatuaje sanó perfectamente.', TRUE),
(3, 1, 4, 'Máquinas de excelente calidad. Entrega rápida y bien embalado.', TRUE),
(4, 2, 5, 'Joyería hermosa y de alta calidad. Perfecto para mi colección.', TRUE);

-- Update shop ratings based on reviews
UPDATE sponsored_shops ss
SET rating = (
    SELECT AVG(rating) 
    FROM shop_reviews sr 
    WHERE sr.shop_id = ss.id AND sr.is_approved = TRUE
),
review_count = (
    SELECT COUNT(*) 
    FROM shop_reviews sr 
    WHERE sr.shop_id = ss.id AND sr.is_approved = TRUE
);

-- Create triggers to update shop ratings when reviews are added/updated
DELIMITER $$

CREATE TRIGGER update_shop_rating_after_insert
AFTER INSERT ON shop_reviews
FOR EACH ROW
BEGIN
    IF NEW.is_approved = TRUE THEN
        UPDATE sponsored_shops 
        SET rating = (
            SELECT AVG(rating) 
            FROM shop_reviews 
            WHERE shop_id = NEW.shop_id AND is_approved = TRUE
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM shop_reviews 
            WHERE shop_id = NEW.shop_id AND is_approved = TRUE
        )
        WHERE id = NEW.shop_id;
    END IF;
END$$

CREATE TRIGGER update_shop_rating_after_update
AFTER UPDATE ON shop_reviews
FOR EACH ROW
BEGIN
    IF OLD.is_approved != NEW.is_approved OR OLD.rating != NEW.rating THEN
        UPDATE sponsored_shops 
        SET rating = (
            SELECT AVG(rating) 
            FROM shop_reviews 
            WHERE shop_id = NEW.shop_id AND is_approved = TRUE
        ),
        review_count = (
            SELECT COUNT(*) 
            FROM shop_reviews 
            WHERE shop_id = NEW.shop_id AND is_approved = TRUE
        )
        WHERE id = NEW.shop_id;
    END IF;
END$$

CREATE TRIGGER update_shop_rating_after_delete
AFTER DELETE ON shop_reviews
FOR EACH ROW
BEGIN
    UPDATE sponsored_shops 
    SET rating = COALESCE((
        SELECT AVG(rating) 
        FROM shop_reviews 
        WHERE shop_id = OLD.shop_id AND is_approved = TRUE
    ), 0.00),
    review_count = (
        SELECT COUNT(*) 
        FROM shop_reviews 
        WHERE shop_id = OLD.shop_id AND is_approved = TRUE
    )
    WHERE id = OLD.shop_id;
END$$

DELIMITER ;

-- Create indexes for better performance
CREATE INDEX idx_shops_featured_active ON sponsored_shops (is_featured, is_active, featured_until);
CREATE INDEX idx_shops_category_active ON sponsored_shops (category, is_active);
CREATE INDEX idx_shops_location_active ON sponsored_shops (city, region, is_active);

-- Create view for active featured shops
CREATE VIEW active_featured_shops AS
SELECT 
    ss.*,
    COALESCE(ss.rating, 0) as shop_rating,
    COALESCE(ss.review_count, 0) as total_reviews
FROM sponsored_shops ss
WHERE ss.is_active = TRUE 
  AND ss.is_featured = TRUE 
  AND (ss.featured_until IS NULL OR ss.featured_until > NOW())
ORDER BY ss.view_count DESC, ss.created_at DESC;