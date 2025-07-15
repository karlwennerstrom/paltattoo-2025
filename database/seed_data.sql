-- ==============================================
-- PalTattoo Sample Data
-- ==============================================

USE paltattoo;

-- ==============================================
-- Geographic Data
-- ==============================================

-- Insert regions
INSERT INTO regions (name, code) VALUES
('Región Metropolitana', 'RM'),
('Región de Valparaíso', 'V'),
('Región del Biobío', 'VIII'),
('Región de Los Lagos', 'X');

-- Insert comunas
INSERT INTO comunas (name, region, region_id) VALUES
('Santiago', 'Región Metropolitana', 1),
('Providencia', 'Región Metropolitana', 1),
('Las Condes', 'Región Metropolitana', 1),
('Ñuñoa', 'Región Metropolitana', 1),
('Maipú', 'Región Metropolitana', 1),
('Ñuñoa', 'Región Metropolitana', 1),
('Valparaíso', 'Región de Valparaíso', 2),
('Viña del Mar', 'Región de Valparaíso', 2),
('Concepción', 'Región del Biobío', 3),
('Puerto Montt', 'Región de Los Lagos', 4);

-- ==============================================
-- Catalog Data
-- ==============================================

-- Insert tattoo styles
INSERT INTO tattoo_styles (name, description) VALUES
('Realismo', 'Tatuajes que recrean imágenes fotorealistas'),
('Tradicional', 'Estilo clásico americano con líneas gruesas y colores sólidos'),
('Neo-tradicional', 'Evolución del tradicional con más detalles y sombreado'),
('Acuarela', 'Estilo que simula pintura en acuarela'),
('Minimalista', 'Diseños simples y líneas finas'),
('Blackwork', 'Tatuajes realizados únicamente en negro'),
('Japonés', 'Estilo tradicional japonés con elementos culturales'),
('Geométrico', 'Diseños basados en formas geométricas'),
('Lettering', 'Especializado en tipografías y caligrafías'),
('Dotwork', 'Técnica de puntillismo para crear diseños'),
('Ilustrativo', 'Estilo de ilustración artística');

-- Insert body parts
INSERT INTO body_parts (name, category) VALUES
('Brazo completo', 'Brazos'),
('Antebrazo', 'Brazos'),
('Hombro', 'Brazos'),
('Muñeca', 'Brazos'),
('Mano', 'Brazos'),
('Pierna completa', 'Piernas'),
('Muslo', 'Piernas'),
('Pantorrilla', 'Piernas'),
('Tobillo', 'Piernas'),
('Pie', 'Piernas'),
('Espalda completa', 'Torso'),
('Espalda alta', 'Torso'),
('Espalda baja', 'Torso'),
('Pecho', 'Torso'),
('Costillas', 'Torso'),
('Abdomen', 'Torso'),
('Cuello', 'Cuello'),
('Nuca', 'Cuello'),
('Cabeza', 'Cabeza'),
('Cara', 'Cabeza');

-- Insert color types
INSERT INTO color_types (name, description) VALUES
('Negro', 'Tatuaje únicamente en tinta negra'),
('Color', 'Tatuaje con múltiples colores'),
('Blanco y negro', 'Tatuaje en escala de grises');

-- ==============================================
-- Sample Users and Profiles
-- ==============================================

-- Insert test users (passwords are hashed for 'password123')
INSERT INTO users (email, password, user_type, is_active, email_verified) VALUES
('carlos.tattoo@email.com', '$2a$10$rQ/gXzQKvB8K6qQ5wGQq4eX9L5wKsV8zS2qN1vJ2Dh3Bp4cM8nR6K', 'artist', true, true),
('maria.ink@email.com', '$2a$10$rQ/gXzQKvB8K6qQ5wGQq4eX9L5wKsV8zS2qN1vJ2Dh3Bp4cM8nR6K', 'artist', true, true),
('diego.art@email.com', '$2a$10$rQ/gXzQKvB8K6qQ5wGQq4eX9L5wKsV8zS2qN1vJ2Dh3Bp4cM8nR6K', 'artist', true, true),
('sofia.needle@email.com', '$2a$10$rQ/gXzQKvB8K6qQ5wGQq4eX9L5wKsV8zS2qN1vJ2Dh3Bp4cM8nR6K', 'artist', true, false),
('pablo.studio@email.com', '$2a$10$rQ/gXzQKvB8K6qQ5wGQq4eX9L5wKsV8zS2qN1vJ2Dh3Bp4cM8nR6K', 'artist', true, true),
('ana.client@email.com', '$2a$10$rQ/gXzQKvB8K6qQ5wGQq4eX9L5wKsV8zS2qN1vJ2Dh3Bp4cM8nR6K', 'client', true, true),
('juan.cliente@email.com', '$2a$10$rQ/gXzQKvB8K6qQ5wGQq4eX9L5wKsV8zS2qN1vJ2Dh3Bp4cM8nR6K', 'client', true, true),
('test@test.com', '$2a$10$rQ/gXzQKvB8K6qQ5wGQq4eX9L5wKsV8zS2qN1vJ2Dh3Bp4cM8nR6K', 'client', true, true),
('artist@test.com', '$2a$10$rQ/gXzQKvB8K6qQ5wGQq4eX9L5wKsV8zS2qN1vJ2Dh3Bp4cM8nR6K', 'artist', true, true);

-- Insert user profiles
INSERT INTO user_profiles (user_id, first_name, last_name, phone, bio) VALUES
(1, 'Carlos', 'Mendoza', '+56912345678', 'Tatuador profesional con 10 años de experiencia especializado en realismo'),
(2, 'María', 'Fernández', '+56987654321', 'Artista especializada en diseños florales y acuarela'),
(3, 'Diego', 'Silva', '+56911223344', 'Experto en tatuajes japoneses tradicionales y neo-japonés'),
(4, 'Sofía', 'Vargas', '+56955667788', 'Tatuadora especializada en minimalismo y línea fina'),
(5, 'Pablo', 'Rojas', '+56999887766', 'Maestro del blackwork y diseños geométricos'),
(6, 'Ana', 'Martínez', '+56944556677', 'Cliente apasionada por el arte del tatuaje'),
(7, 'Juan', 'Pérez', '+56933445566', 'Busco mi primer tatuaje, algo significativo'),
(8, 'Usuario', 'Prueba', '+56911111111', 'Cuenta de prueba para testing'),
(9, 'Artista', 'Prueba', '+56922222222', 'Cuenta de artista para testing');

-- ==============================================
-- Artists Data
-- ==============================================

-- Insert tattoo artists
INSERT INTO tattoo_artists (user_id, studio_name, comuna_id, address, years_experience, min_price, max_price, instagram_url, is_verified, rating) VALUES
(1, 'Mendoza Ink Studio', 1, 'Av. Providencia 1234', 10, 50000, 500000, '@mendoza_ink', true, 4.8),
(2, 'Floral Tattoo Art', 2, 'Calle Los Leones 567', 7, 40000, 300000, '@maria_floral_tattoo', true, 4.9),
(3, 'Sakura Tattoo House', 3, 'Av. Apoquindo 890', 12, 80000, 800000, '@sakura_tattoo_cl', true, 4.7),
(4, 'Minimal Lines Studio', 6, 'Paseo Ahumada 123', 5, 30000, 200000, '@sofia_minimal', false, 4.6),
(5, 'Black Geometric Art', 17, 'Av. Alemania 456', 8, 60000, 600000, '@pablo_blackwork', true, 4.9),
(9, 'Estudio de Prueba', 1, 'Dirección de prueba 123', 3, 25000, 150000, '@artista_test', false, 4.5);

-- Insert artist styles relationships
INSERT INTO artist_styles (artist_id, style_id, is_primary) VALUES
-- Carlos Mendoza (Realismo, Neo-tradicional, Tradicional)
(1, 1, true), (1, 3, false), (1, 2, false),
-- María Fernández (Acuarela, Ilustrativo, Minimalista)
(2, 4, true), (2, 11, false), (2, 5, false),
-- Diego Silva (Japonés, Neo-tradicional)
(3, 7, true), (3, 3, false),
-- Sofía Vargas (Minimalista, Lettering)
(4, 5, true), (4, 9, false),
-- Pablo Rojas (Blackwork, Geométrico, Dotwork)
(5, 6, true), (5, 8, false), (5, 10, false),
-- Artista de prueba
(6, 1, true), (6, 2, false);

-- ==============================================
-- Clients Data
-- ==============================================

-- Insert clients
INSERT INTO clients (user_id, comuna_id, birth_date) VALUES
(6, 1, '1990-05-15'),
(7, 2, '1985-08-22'),
(8, 1, '1995-03-10');

-- ==============================================
-- Sample Tattoo Offers
-- ==============================================

-- Insert tattoo offers
INSERT INTO tattoo_offers (client_id, title, description, body_part_id, style_id, color_type_id, size_description, budget_min, budget_max, deadline, status) VALUES
(1, 'Test Tattoo Request', 'This is a test tattoo request to validate the system functionality.', 1, 1, 1, 'Medium size', 100000, 300000, '2025-12-31', 'active');

-- ==============================================
-- Sample Proposals
-- ==============================================

-- Insert proposals
INSERT INTO proposals (offer_id, artist_id, message, proposed_price, estimated_duration, status) VALUES
(1, 1, 'Me encantaría trabajar en este proyecto. Tengo experiencia en realismo y puedo lograr el resultado que buscas.', 250000, 180, 'pending');

-- ==============================================
-- Subscription Plans
-- ==============================================

-- Insert subscription plans
INSERT INTO subscription_plans (plan_type, name, description, price, billing_cycle, features, max_portfolio_images, max_active_requests, priority_support, featured_listing) VALUES
('basic', 'Básico', 'Plan ideal para tatuadores que están comenzando', 9990.00, 'monthly', 
 '["Hasta 10 imágenes en portafolio", "Hasta 5 solicitudes activas", "Perfil básico", "Soporte por email"]', 
 10, 5, false, false),

('premium', 'Premium', 'Plan completo para tatuadores profesionales', 19990.00, 'monthly',
 '["Hasta 50 imágenes en portafolio", "Solicitudes ilimitadas", "Perfil destacado", "Soporte prioritario", "Estadísticas avanzadas"]',
 50, -1, true, true),

('pro', 'Pro', 'Plan profesional para estudios y tatuadores establecidos', 39990.00, 'monthly',
 '["Imágenes ilimitadas en portafolio", "Solicitudes ilimitadas", "Perfil premium destacado", "Soporte telefónico 24/7", "Analíticas completas", "Gestión de múltiples artistas", "API de integración"]',
 -1, -1, true, true);

-- ==============================================
-- Sample Sponsored Shops
-- ==============================================

-- Insert sponsored shops
INSERT INTO sponsored_shops (name, description, category, website_url, instagram_url, phone, email, address, comuna_id, is_featured, is_active) VALUES
('TattooSupply Chile', 'Proveedor líder de equipos y suministros para tatuajes en Chile', 'Suministros', 'https://tattoosupply.cl', '@tattoosupply_cl', '+56223334444', 'ventas@tattoosupply.cl', 'Av. Providencia 2000', 2, true, true),
('Ink Master Store', 'Tintas profesionales de las mejores marcas mundiales', 'Tintas', 'https://inkmaster.cl', '@inkmaster_store', '+56211112222', 'info@inkmaster.cl', 'Av. Las Condes 8000', 3, true, true),
('Aftercare Pro', 'Productos especializados para el cuidado posterior del tatuaje', 'Cuidado', 'https://aftercarepro.cl', '@aftercare_pro', '+56244445555', 'contacto@aftercarepro.cl', 'Mall Plaza Vespucio', 5, false, true);

-- ==============================================
-- Create Views for Easy Data Access
-- ==============================================

-- View for artists with complete information
CREATE OR REPLACE VIEW v_artists_complete AS
SELECT 
    ta.*,
    u.email,
    up.first_name,
    up.last_name,
    up.phone,
    up.profile_image,
    up.bio,
    c.name as comuna_name,
    c.region,
    GROUP_CONCAT(ts.name) as styles
FROM tattoo_artists ta
JOIN users u ON ta.user_id = u.id
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN comunas c ON ta.comuna_id = c.id
LEFT JOIN artist_styles ast ON ta.id = ast.artist_id
LEFT JOIN tattoo_styles ts ON ast.style_id = ts.id
WHERE u.is_active = true
GROUP BY ta.id;

-- View for offers with complete information
CREATE OR REPLACE VIEW v_offers_complete AS
SELECT 
    o.*,
    up.first_name as client_first_name,
    up.last_name as client_last_name,
    bp.name as body_part_name,
    ts.name as style_name,
    ct.name as color_type_name,
    c.name as comuna_name,
    c.region,
    (SELECT COUNT(*) FROM proposals p WHERE p.offer_id = o.id) as proposal_count
FROM tattoo_offers o
JOIN clients cl ON o.client_id = cl.id
JOIN users u ON cl.user_id = u.id
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN comunas c ON cl.comuna_id = c.id
JOIN body_parts bp ON o.body_part_id = bp.id
JOIN tattoo_styles ts ON o.style_id = ts.id
JOIN color_types ct ON o.color_type_id = ct.id
WHERE u.is_active = true;

-- ==============================================
-- Sample Stored Procedures
-- ==============================================

DELIMITER //

-- Procedure to get artist statistics
CREATE PROCEDURE GetArtistStats(IN artist_user_id INT)
BEGIN
    DECLARE artist_id_var INT;
    
    -- Get artist ID from user ID
    SELECT id INTO artist_id_var 
    FROM tattoo_artists 
    WHERE user_id = artist_user_id;
    
    -- Return statistics
    SELECT 
        (SELECT COUNT(*) FROM proposals p WHERE p.artist_id = artist_id_var) as total_proposals,
        (SELECT COUNT(*) FROM proposals p WHERE p.artist_id = artist_id_var AND p.status = 'accepted') as accepted_proposals,
        (SELECT COUNT(*) FROM appointments a WHERE a.artist_id = artist_id_var) as total_appointments,
        (SELECT COUNT(*) FROM portfolio_images pi WHERE pi.artist_id = artist_id_var) as portfolio_items,
        (SELECT AVG(rating) FROM reviews r WHERE r.artist_id = artist_id_var) as average_rating;
END //

DELIMITER ;

-- ==============================================
-- Triggers for Automatic Updates
-- ==============================================

DELIMITER //

-- Trigger to update artist rating when a new review is added
CREATE TRIGGER update_artist_rating_after_review
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE tattoo_artists 
    SET rating = (
        SELECT AVG(rating) 
        FROM reviews 
        WHERE artist_id = NEW.artist_id
    ),
    total_reviews = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE artist_id = NEW.artist_id
    )
    WHERE id = NEW.artist_id;
END //

DELIMITER ;