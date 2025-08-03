const bcrypt = require('bcryptjs');
const db = require('../config/database');

async function resetAdminPassword() {
  try {
    // Nueva contraseña para el admin
    const newPassword = 'admin123'; // CAMBIA ESTO POR LA CONTRASEÑA QUE DESEES
    
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizar en la base de datos
    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'admin@tattooconnect.cl']
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ Contraseña actualizada exitosamente');
      console.log('📧 Email: admin@tattooconnect.cl');
      console.log('🔑 Nueva contraseña:', newPassword);
    } else {
      console.log('❌ No se encontró el usuario admin');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();