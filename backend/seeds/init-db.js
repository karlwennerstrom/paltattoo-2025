const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  let connection;
  
  try {
    // Connect without database first
    console.log('Connecting to MySQL server...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });
    
    console.log('✓ Connected to MySQL server');
    
    // Read and execute schema
    console.log('\nExecuting database schema...');
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    await connection.query(schema);
    console.log('✓ Database schema created successfully');
    
    // Read and execute seeds
    console.log('\nExecuting seed data...');
    const seedsPath = path.join(__dirname, '../../database/seeds.sql');
    const seeds = await fs.readFile(seedsPath, 'utf8');
    
    // Update the hashed passwords in seeds
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const seedsWithHash = seeds.replace(/\$2a\$10\$YourHashedPasswordHere/g, hashedPassword);
    
    await connection.query(seedsWithHash);
    console.log('✓ Seed data inserted successfully');
    
    // Verify setup
    console.log('\nVerifying database setup...');
    const [tables] = await connection.query('SHOW TABLES FROM tattoo_connect');
    console.log(`✓ Created ${tables.length} tables`);
    
    const [users] = await connection.query('SELECT COUNT(*) as count FROM tattoo_connect.users');
    console.log(`✓ Inserted ${users[0].count} users`);
    
    const [styles] = await connection.query('SELECT COUNT(*) as count FROM tattoo_connect.tattoo_styles');
    console.log(`✓ Inserted ${styles[0].count} tattoo styles`);
    
    const [comunas] = await connection.query('SELECT COUNT(*) as count FROM tattoo_connect.comunas');
    console.log(`✓ Inserted ${comunas[0].count} comunas`);
    
    console.log('\n✅ Database initialization completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error initializing database:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\nMake sure MySQL is running and accessible.');
      console.error('You may need to:');
      console.error('1. Install MySQL: sudo apt-get install mysql-server');
      console.error('2. Start MySQL: sudo service mysql start');
      console.error('3. Set root password: sudo mysql_secure_installation');
      console.error('4. Update .env file with correct credentials');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initializeDatabase();