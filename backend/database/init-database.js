const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  let connection;
  
  try {
    // Connect without database first
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('Connected to MySQL server');

    // Execute schema SQL
    const schemaSQL = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schemaSQL);
    console.log('Database schema created successfully');

    // Execute seed data SQL
    const seedSQL = await fs.readFile(path.join(__dirname, 'seed-data.sql'), 'utf8');
    await connection.query(seedSQL);
    console.log('Seed data inserted successfully');

    console.log('Database initialization completed!');
    
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run if this file is executed directly
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;