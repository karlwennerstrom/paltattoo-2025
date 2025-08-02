// Script para crear usuario administrador
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function createAdmin() {
  try {
    const adminEmail = 'admin@paltattoo.com';
    const adminPassword = 'Admin123!'; // Cambia esto por una contraseña segura
    
    // Verificar si ya existe un admin
    const [existingAdmin] = await db.execute(
      'SELECT id FROM users WHERE email = ? OR user_type = "admin"',
      [adminEmail]
    );
    
    if (existingAdmin.length > 0) {
      console.log('❌ Ya existe un usuario administrador');
      return;
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Crear usuario administrador
    const [result] = await db.execute(
      `INSERT INTO users (email, password, first_name, last_name, user_type, profile_completed, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [adminEmail, hashedPassword, 'Admin', 'PalTattoo', 'admin', 1, 1]
    );
    
    console.log('✅ Usuario administrador creado exitosamente');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Contraseña:', adminPassword);
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');
    
  } catch (error) {
    console.error('❌ Error creando administrador:', error);
  } finally {
    process.exit();
  }
}

createAdmin();