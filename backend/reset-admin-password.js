// Script para resetear la contraseña del administrador
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/database');

async function resetAdminPassword() {
  try {
    const adminEmail = 'admin@tattooconnect.cl';
    const newPassword = 'Admin123!'; // Contraseña temporal
    
    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar la contraseña en la base de datos
    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE email = ? AND user_type = "admin"',
      [hashedPassword, adminEmail]
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Contraseña del administrador actualizada exitosamente');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Nueva contraseña:', newPassword);
      console.log('🔗 URL de acceso: http://localhost:3000/admin');
      console.log('');
      console.log('⚠️  IMPORTANTE: Cambia esta contraseña después del primer login');
    } else {
      console.log('❌ No se encontró el usuario administrador');
    }
    
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
  } finally {
    process.exit();
  }
}

resetAdminPassword();