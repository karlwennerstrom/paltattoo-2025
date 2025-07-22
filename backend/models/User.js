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
      `SELECT u.*, up.*, 
              us.plan_id as subscription_plan_id,
              us.status as subscription_status,
              sp.name as subscription_plan_name,
              sp.price as subscription_plan_price
       FROM users u 
       LEFT JOIN user_profiles up ON u.id = up.user_id 
       LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
       LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
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
      'SELECT id, profile_image FROM user_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (existing.length > 0) {
      // Keep existing profile image if not provided
      const imageToUse = profileImage !== undefined ? profileImage : existing[0].profile_image;
      
      const [result] = await promisePool.execute(
        `UPDATE user_profiles 
         SET first_name = ?, last_name = ?, phone = ?, bio = ?, profile_image = ?
         WHERE user_id = ?`,
        [firstName, lastName, phone, bio, imageToUse, userId]
      );
      return result.affectedRows > 0;
    } else {
      const [result] = await promisePool.execute(
        `INSERT INTO user_profiles (user_id, first_name, last_name, phone, bio, profile_image)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, firstName, lastName, phone, bio, profileImage || null]
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
    
    // Insert into users table with user_type as null (to be set later)
    const [result] = await promisePool.execute(
      `INSERT INTO users (google_id, email, password, user_type, profile_completed) 
       VALUES (?, ?, ?, ?, ?)`,
      [googleId, email, '', null, false]
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

  static async completeGoogleProfile(userId, profileData) {
    const { userType, firstName, lastName, phone, bio } = profileData;
    
    console.log(`Completing profile for user ${userId} with type: ${userType}`);
    
    // Update user type and mark profile as completed
    const [userResult] = await promisePool.execute(
      `UPDATE users SET user_type = ?, profile_completed = ? WHERE id = ?`,
      [userType, 1, userId]
    );
    
    console.log(`Profile completion update result - affected rows: ${userResult.affectedRows}`);
    
    // Update or insert profile data
    const [existing] = await promisePool.execute(
      'SELECT id FROM user_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (existing.length > 0) {
      const [profileResult] = await promisePool.execute(
        `UPDATE user_profiles 
         SET first_name = ?, last_name = ?, phone = ?, bio = ?
         WHERE user_id = ?`,
        [firstName, lastName, phone, bio, userId]
      );
      console.log(`Profile update result - affected rows: ${profileResult.affectedRows}`);
      return profileResult.affectedRows > 0;
    } else {
      const [profileResult] = await promisePool.execute(
        `INSERT INTO user_profiles (user_id, first_name, last_name, phone, bio)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, firstName, lastName, phone, bio]
      );
      console.log(`Profile insert result - insert id: ${profileResult.insertId}`);
      return profileResult.insertId;
    }
  }

  static async isProfileCompleted(userId) {
    console.log(`Checking profile completion for user ${userId}`);
    
    const [rows] = await promisePool.execute(
      'SELECT profile_completed, user_type FROM users WHERE id = ?',
      [userId]
    );
    
    if (!rows[0]) {
      console.log(`User ${userId} not found`);
      return false;
    }
    
    const user = rows[0];
    const isCompleted = Boolean(user.profile_completed) && user.user_type !== null && user.user_type !== '';
    
    console.log(`User ${userId} - profile_completed: ${user.profile_completed}, user_type: ${user.user_type}, isCompleted: ${isCompleted}`);
    
    return isCompleted;
  }

  // Utility method to fix users who have user_type but profile_completed = 0
  static async fixIncompleteProfiles() {
    console.log('Running profile completion fix...');
    
    const [result] = await promisePool.execute(
      'UPDATE users SET profile_completed = 1 WHERE user_type IS NOT NULL AND user_type != ? AND profile_completed = 0',
      ['']
    );
    
    console.log(`Fixed ${result.affectedRows} user profiles`);
    return result.affectedRows;
  }
}

module.exports = User;