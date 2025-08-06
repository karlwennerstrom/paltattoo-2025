const mysql = require('../backend/node_modules/mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

// Configuración de BD de producción (Railway)
const PROD_CONFIG = {
  host: 'metro.proxy.rlwy.net',
  port: 58495,
  user: 'root',
  password: 'zGJNQcdVXrMBYhybFIlWHRBsecadBorH',
  database: 'railway'
};

// Configuración de BD local
const LOCAL_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'tattoo_connect'
};

async function syncDatabase() {
  let prodConnection = null;
  let localConnection = null;

  try {
    console.log('🚀 Iniciando sincronización de base de datos...');
    console.log('⚠️  ADVERTENCIA: Esto eliminará TODOS los datos de tu BD local');
    
    // Conectar a producción
    console.log('🔗 Conectando a base de datos de producción...');
    prodConnection = await mysql.createConnection(PROD_CONFIG);
    
    // Conectar a local
    console.log('🔗 Conectando a base de datos local...');
    localConnection = await mysql.createConnection({
      host: LOCAL_CONFIG.host,
      port: LOCAL_CONFIG.port,
      user: LOCAL_CONFIG.user,
      password: LOCAL_CONFIG.password
    });

    // Recrear base de datos local
    console.log('🗑️  Limpiando base de datos local...');
    await localConnection.execute(`DROP DATABASE IF EXISTS ${LOCAL_CONFIG.database}`);
    await localConnection.execute(`CREATE DATABASE ${LOCAL_CONFIG.database}`);
    await localConnection.execute(`USE ${LOCAL_CONFIG.database}`);

    // Obtener lista de tablas de producción
    console.log('📋 Obteniendo estructura de tablas...');
    const [tables] = await prodConnection.execute('SHOW TABLES');
    
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      console.log(`📦 Copiando tabla: ${tableName}`);
      
      // Obtener estructura de tabla
      const [createTable] = await prodConnection.execute(`SHOW CREATE TABLE ${tableName}`);
      const createStatement = createTable[0]['Create Table'];
      
      // Crear tabla en local
      await localConnection.execute(createStatement);
      
      // Copiar datos
      const [rows] = await prodConnection.execute(`SELECT * FROM ${tableName}`);
      
      if (rows.length > 0) {
        // Obtener columnas
        const [columns] = await prodConnection.execute(`SHOW COLUMNS FROM ${tableName}`);
        const columnNames = columns.map(col => col.Field);
        
        // Construir INSERT
        const placeholders = columnNames.map(() => '?').join(',');
        const insertSQL = `INSERT INTO ${tableName} (${columnNames.join(',')}) VALUES (${placeholders})`;
        
        // Insertar datos en lotes
        for (const row of rows) {
          const values = columnNames.map(col => row[col]);
          await localConnection.execute(insertSQL, values);
        }
      }
      
      console.log(`✅ ${tableName}: ${rows.length} registros copiados`);
    }

    console.log('🎉 ¡Sincronización completada exitosamente!');
    
    // Verificación
    console.log('🔍 Verificación rápida:');
    const [userCount] = await localConnection.execute('SELECT COUNT(*) as count FROM users');
    const [offerCount] = await localConnection.execute('SELECT COUNT(*) as count FROM tattoo_offers');
    const [artistCount] = await localConnection.execute('SELECT COUNT(*) as count FROM tattoo_artists');
    
    console.log(`👥 Usuarios: ${userCount[0].count}`);
    console.log(`🎨 Ofertas: ${offerCount[0].count}`);
    console.log(`✨ Artistas: ${artistCount[0].count}`);

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error.message);
    process.exit(1);
  } finally {
    if (prodConnection) await prodConnection.end();
    if (localConnection) await localConnection.end();
  }
}

// Ejecutar
syncDatabase();