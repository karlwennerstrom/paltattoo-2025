// backend/utils/ensureDirectories.js
const fs = require('fs');
const path = require('path');

const ensureDirectories = () => {
  // Determine base uploads path
  const baseUploadsPath = process.env.RAILWAY_VOLUME_MOUNT_PATH 
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'uploads')
    : path.join(__dirname, '..', 'uploads');

  // List of required directories
  const requiredDirs = [
    baseUploadsPath,
    path.join(baseUploadsPath, 'profiles'),
    path.join(baseUploadsPath, 'portfolio'),
    path.join(baseUploadsPath, 'references'),
    path.join(baseUploadsPath, 'shops'),
    path.join(baseUploadsPath, 'shops', 'logos'),
    path.join(baseUploadsPath, 'shops', 'covers')
  ];

  console.log('🗂️  Ensuring upload directories exist...');
  
  requiredDirs.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      } else {
        console.log(`✓ Directory exists: ${dir}`);
      }
    } catch (error) {
      console.error(`❌ Error creating directory ${dir}:`, error);
    }
  });
  
  console.log('🗂️  Directory setup complete');
};

module.exports = ensureDirectories;