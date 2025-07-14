-- Seed data for catalogs
USE tattoo_connect;

-- Insert color types
INSERT INTO color_types (name) VALUES 
('Blanco y Negro'),
('Color'),
('Mixto');

-- Insert tattoo styles
INSERT INTO tattoo_styles (name, description) VALUES 
('Realismo', 'Tatuajes que buscan reproducir imágenes de manera fotográfica'),
('Traditional', 'Estilo clásico americano con líneas gruesas y colores sólidos'),
('Neo Traditional', 'Evolución del traditional con más detalle y paleta de colores ampliada'),
('Japonés', 'Estilo tradicional japonés con motivos orientales'),
('Blackwork', 'Trabajo exclusivamente en negro con patrones geométricos o abstractos'),
('Dotwork', 'Técnica de puntillismo para crear imágenes y sombreados'),
('Geométrico', 'Diseños basados en formas geométricas y patrones matemáticos'),
('Acuarela', 'Estilo que imita las pinturas de acuarela'),
('Minimalista', 'Diseños simples y limpios con elementos mínimos'),
('Biomecánico', 'Fusión de elementos orgánicos y mecánicos'),
('Tribal', 'Diseños inspirados en tatuajes tribales tradicionales'),
('Lettering', 'Especialización en letras y caligrafía'),
('Ilustrativo', 'Estilo que parece una ilustración dibujada'),
('Sketch', 'Estilo que imita bocetos a lápiz'),
('Surealismo', 'Diseños oníricos y surrealistas'),
('Anime/Manga', 'Estilo inspirado en el arte japonés de anime y manga'),
('Portrait', 'Retratos realistas de personas'),
('Cover Up', 'Especialización en cubrir tatuajes antiguos'),
('Ornamental', 'Diseños decorativos y ornamentales'),
('Fine Line', 'Trabajo con líneas muy finas y delicadas');

-- Insert body parts
INSERT INTO body_parts (name, description) VALUES 
('Brazo', 'Parte superior del brazo'),
('Antebrazo', 'Parte inferior del brazo'),
('Hombro', 'Área del hombro'),
('Pecho', 'Área del pecho'),
('Espalda', 'Espalda completa o parcial'),
('Costillas', 'Área de las costillas'),
('Pierna', 'Parte superior de la pierna'),
('Pantorrilla', 'Parte inferior de la pierna'),
('Pie', 'Área del pie'),
('Mano', 'Área de la mano'),
('Cuello', 'Área del cuello'),
('Cabeza', 'Área de la cabeza'),
('Dedo', 'Dedos de manos o pies'),
('Muñeca', 'Área de la muñeca'),
('Tobillo', 'Área del tobillo'),
('Cadera', 'Área de la cadera'),
('Abdomen', 'Área abdominal'),
('Glúteo', 'Área del glúteo'),
('Manga Completa', 'Brazo completo'),
('Media Manga', 'Medio brazo');

-- Insert comunas (principales de Santiago)
INSERT INTO comunas (name, region) VALUES 
('Santiago', 'Región Metropolitana'),
('Providencia', 'Región Metropolitana'),
('Las Condes', 'Región Metropolitana'),
('Vitacura', 'Región Metropolitana'),
('Lo Barnechea', 'Región Metropolitana'),
('La Reina', 'Región Metropolitana'),
('Ñuñoa', 'Región Metropolitana'),
('Macul', 'Región Metropolitana'),
('Peñalolén', 'Región Metropolitana'),
('La Florida', 'Región Metropolitana'),
('San Miguel', 'Región Metropolitana'),
('San Joaquín', 'Región Metropolitana'),
('La Granja', 'Región Metropolitana'),
('La Pintana', 'Región Metropolitana'),
('San Ramón', 'Región Metropolitana'),
('La Cisterna', 'Región Metropolitana'),
('El Bosque', 'Región Metropolitana'),
('Pedro Aguirre Cerda', 'Región Metropolitana'),
('Lo Espejo', 'Región Metropolitana'),
('Estación Central', 'Región Metropolitana'),
('Cerrillos', 'Región Metropolitana'),
('Maipú', 'Región Metropolitana'),
('Quinta Normal', 'Región Metropolitana'),
('Lo Prado', 'Región Metropolitana'),
('Pudahuel', 'Región Metropolitana'),
('Cerro Navia', 'Región Metropolitana'),
('Renca', 'Región Metropolitana'),
('Quilicura', 'Región Metropolitana'),
('Colina', 'Región Metropolitana'),
('Lampa', 'Región Metropolitana'),
('Huechuraba', 'Región Metropolitana'),
('Recoleta', 'Región Metropolitana'),
('Independencia', 'Región Metropolitana'),
('Conchalí', 'Región Metropolitana'),
('San Bernardo', 'Región Metropolitana'),
('Puente Alto', 'Región Metropolitana'),
('San José de Maipo', 'Región Metropolitana'),
('Pirque', 'Región Metropolitana'),
('Buin', 'Región Metropolitana'),
('Paine', 'Región Metropolitana'),
('Melipilla', 'Región Metropolitana'),
('Talagante', 'Región Metropolitana'),
('Peñaflor', 'Región Metropolitana'),
('Isla de Maipo', 'Región Metropolitana'),
('El Monte', 'Región Metropolitana'),
('Padre Hurtado', 'Región Metropolitana');

-- Create test users (optional)
-- Password is 'password123' hashed with bcrypt
INSERT INTO users (email, password, user_type) VALUES 
('cliente@test.com', '$2a$10$YQqoUT3LkQhS.vYQXZPmFOBdJGxrFbG.zKqJqE9NtaRhRqMKcxeKG', 'client'),
('artista@test.com', '$2a$10$YQqoUT3LkQhS.vYQXZPmFOBdJGxrFbG.zKqJqE9NtaRhRqMKcxeKG', 'artist'),
('admin@test.com', '$2a$10$YQqoUT3LkQhS.vYQXZPmFOBdJGxrFbG.zKqJqE9NtaRhRqMKcxeKG', 'admin');

-- Create profiles for test users
INSERT INTO user_profiles (user_id, first_name, last_name, phone) VALUES 
(1, 'Juan', 'Pérez', '+56912345678'),
(2, 'María', 'González', '+56987654321'),
(3, 'Admin', 'Sistema', '+56911111111');

-- Create client profile
INSERT INTO clients (user_id, comuna_id) VALUES 
(1, 7); -- Ñuñoa

-- Create artist profile
INSERT INTO tattoo_artists (user_id, bio, studio_name, instagram, comuna_id, years_experience) VALUES 
(2, 'Tatuadora profesional con 5 años de experiencia', 'Ink Studio', '@mariatattoos', 2, 5); -- Providencia

-- Add artist specialties
INSERT INTO artist_styles (artist_id, style_id) VALUES 
(1, 1), -- Realismo
(1, 3), -- Neo Traditional
(1, 9); -- Minimalista