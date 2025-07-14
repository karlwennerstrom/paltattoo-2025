const promisePool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { email, password, userType } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await promisePool.execute(
      'INSERT INTO users (email, password, user_type) VALUES (?, ?, ?)',
      [email, hashedPassword, userType]
    );
    
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const [result] = await promisePool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    
    return result.affectedRows > 0;
  }

  static async updateStatus(userId, isActive) {
    const [result] = await promisePool.execute(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [isActive, userId]
    );
    
    return result.affectedRows > 0;
  }

  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async getProfile(userId) {
    const [rows] = await promisePool.execute(
      `SELECT u.*, up.* 
       FROM users u 
       LEFT JOIN user_profiles up ON u.id = up.user_id 
       WHERE u.id = ?`,
      [userId]
    );
    
    if (rows[0]) {
      delete rows[0].password;
    }
    
    return rows[0];
  }

  static async updateProfile(userId, profileData) {
    const { firstName, lastName, phone, bio, profileImage } = profileData;
    
    const [existing] = await promisePool.execute(
      'SELECT id FROM user_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (existing.length > 0) {
      const [result] = await promisePool.execute(
        `UPDATE user_profiles 
         SET first_name = ?, last_name = ?, phone = ?, bio = ?, profile_image = ?
         WHERE user_id = ?`,
        [firstName, lastName, phone, bio, profileImage, userId]
      );
      return result.affectedRows > 0;
    } else {
      const [result] = await promisePool.execute(
        `INSERT INTO user_profiles (user_id, first_name, last_name, phone, bio, profile_image)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, firstName, lastName, phone, bio, profileImage]
      );
      return result.insertId;
    }
  }

  static async findByGoogleId(googleId) {
    const [rows] = await promisePool.execute(
      'SELECT * FROM users WHERE google_id = ?',
      [googleId]
    );
    return rows[0];
  }

  static async createGoogleUser(googleData) {
    const { googleId, email, name, firstName, lastName, profilePicture } = googleData;
    
    // Insert into users table with minimal required fields
    const [result] = await promisePool.execute(
      `INSERT INTO users (google_id, email, password, user_type) 
       VALUES (?, ?, ?, ?)`,
      [googleId, email, '', 'client']
    );
    
    const userId = result.insertId;
    
    // Create user profile with the additional data
    if (firstName || lastName || name || profilePicture) {
      await promisePool.execute(
        `INSERT INTO user_profiles (user_id, first_name, last_name, profile_image)
         VALUES (?, ?, ?, ?)`,
        [userId, firstName || '', lastName || '', profilePicture || null]
      );
    }
    
    return userId;
  }

  static async updateGoogleInfo(userId, googleData) {
    const { googleId, profilePicture } = googleData;
    
    // Update users table with google_id
    const [result] = await promisePool.execute(
      `UPDATE users SET google_id = ? WHERE id = ?`,
      [googleId, userId]
    );
    
    // Update profile image if provided
    if (profilePicture) {
      await promisePool.execute(
        `UPDATE user_profiles SET profile_image = ? WHERE user_id = ?`,
        [profilePicture, userId]
      );
    }
    
    return result.affectedRows > 0;
  }
}

module.exports = User;