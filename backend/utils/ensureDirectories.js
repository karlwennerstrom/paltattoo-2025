// backend/utils/ensureDirectories.js
const fs = require('fs');
const path = require('path');
const { getRailwayUploadPath } = require('./railwayStorage');

const ensureDirectories = () => {
  // Get the base uploads path (handles Railway volumes)
  const baseUploadsPath = getRailwayUploadPath();

  // List of required subdirectories
  const requiredSubdirs = [
    'profiles',
    'portfolio',
    'references',
    'shops',
    'shops/logos',
    'shops/covers'
  ];

  console.log('🗂️  Ensuring upload directories exist...');
  console.log(`📁 Base upload path: ${baseUploadsPath}`);
  
  requiredSubdirs.forEach(subdir => {
    const dir = path.join(baseUploadsPath, subdir);
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
      } else {
        console.log(`✓ Directory exists: ${dir}`);
      }
    } catch (error) {
      console.error(`❌ Error creating directory ${dir}:`, error.message);
    }
  });
  
  console.log('🗂️  Directory setup complete');
};

module.exports = ensureDirectories;