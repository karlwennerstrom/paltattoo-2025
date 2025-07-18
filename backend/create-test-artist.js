const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTestArtist() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tattoo_connect'
  });

  try {
    // Check if artist profile already exists
    const [existing] = await connection.execute(
      'SELECT * FROM tattoo_artists WHERE user_id = ?',
      [15]
    );

    if (existing.length > 0) {
      console.log('Artist profile already exists:', existing[0]);
      return;
    }

    // Create artist profile
    const [result] = await connection.execute(
      `INSERT INTO tattoo_artists 
       (user_id, studio_name, years_experience, min_price, max_price, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [15, 'Test Studio', 5, 100, 500]
    );

    console.log('Artist profile created:', result.insertId);

    // Verify creation
    const [newArtist] = await connection.execute(
      'SELECT * FROM tattoo_artists WHERE id = ?',
      [result.insertId]
    );

    console.log('New artist profile:', newArtist[0]);

  } catch (error) {
    console.error('Error creating artist profile:', error);
  } finally {
    await connection.end();
  }
}

createTestArtist();