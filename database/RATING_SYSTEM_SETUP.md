# Rating System Database Setup

## ✅ Production Database (Railway) - COMPLETED
The rating system has been successfully installed on your Railway production database.

**Database**: `railway`
**Status**: ✅ COMPLETE
- ✅ Ratings table created
- ✅ Users table updated with rating columns
- ✅ Triggers created for automatic rating updates

## 🔧 Local Database Setup Required

### For Local Development Database:

1. **Identify your local database name**:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

2. **Edit the setup script**:
   - Open `database/setup_ratings_local.sql`
   - Uncomment and modify the `USE your_local_database_name;` line
   - Replace `your_local_database_name` with your actual database name

3. **Run the setup script**:
   ```bash
   mysql -u root -p your_local_database_name < database/setup_ratings_local.sql
   ```

   Or if you prefer to specify the database in the command:
   ```bash
   mysql -u root -p -e "USE your_database_name; SOURCE database/setup_ratings_local.sql;"
   ```

### Alternative Manual Setup (if script fails):

If the automated script has issues, you can run these commands manually:

```sql
-- Connect to your local database
USE your_local_database_name;

-- Create ratings table
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rater_id INT NOT NULL,
    rated_id INT NOT NULL,
    rater_type ENUM('client', 'artist') NOT NULL,
    rated_type ENUM('client', 'artist') NOT NULL,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    tattoo_request_id INT,
    proposal_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rated_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tattoo_request_id) REFERENCES tattoo_offers(id) ON DELETE SET NULL,
    FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL,
    
    INDEX idx_rater (rater_id),
    INDEX idx_rated (rated_id),
    INDEX idx_tattoo_request (tattoo_request_id),
    INDEX idx_proposal (proposal_id),
    INDEX idx_rating_value (rating),
    
    UNIQUE KEY unique_rating (rater_id, rated_id, tattoo_request_id, proposal_id)
);

-- Add rating columns to users table
ALTER TABLE users ADD COLUMN avg_rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN total_ratings INT DEFAULT 0;
```

## 🎯 Verification

After setup, verify the installation:

### Production (Railway):
```bash
mysql -h metro.proxy.rlwy.net -P 58495 -u root -pzGJNQcdVXrMBYhybFIlWHRBsecadBorH railway -e "DESCRIBE ratings;"
```

### Local:
```bash
mysql -u root -p your_database_name -e "DESCRIBE ratings;"
```

## 🚀 Next Steps

Once both databases are set up:

1. **Restart your backend server**
2. **Test the rating endpoints**:
   - POST `/api/ratings` - Create rating
   - GET `/api/ratings/user/:userId` - Get user ratings
   - GET `/api/ratings/can-rate` - Check rating permissions

3. **Test in the frontend**:
   - Go to artist profiles → Calificaciones tab
   - Accept a proposal → Rate artist button
   - Artist dashboard → Rate client button (⭐)

## 📋 Rating System Features

- ⭐ **Star Ratings**: 1-5 star rating system
- 💬 **Comments**: Optional text reviews
- 🔒 **Permissions**: Only transaction participants can rate
- 🚫 **Duplicate Prevention**: One rating per transaction
- 📊 **Statistics**: Automatic average calculation
- 📱 **UI Integration**: Seamlessly integrated into existing flows

---

**Status Summary:**
- ✅ Production Database: COMPLETE
- 🔧 Local Database: NEEDS SETUP
- ✅ Backend Code: COMPLETE
- ✅ Frontend Components: COMPLETE
- ✅ API Endpoints: COMPLETE