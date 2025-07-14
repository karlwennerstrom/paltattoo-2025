const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('Testing MySQL connection...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✓ Connected successfully!');
    
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✓ Query executed:', rows);
    
    await connection.end();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nTroubleshooting steps:');
    console.error('1. Make sure MySQL is running: sudo service mysql status');
    console.error('2. Create user if needed: sudo mysql < seeds/create-user.sql');
    console.error('3. Check credentials in .env file');
  }
}

testConnection();