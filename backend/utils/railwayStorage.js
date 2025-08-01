const fs = require('fs');
const path = require('path');

/**
 * Get the correct upload path for Railway deployment
 * Railway volumes are mounted at /app/data by default
 */
const getRailwayUploadPath = () => {
  // Check common Railway volume mount paths
  const possiblePaths = [
    process.env.RAILWAY_VOLUME_MOUNT_PATH,
    '/app/data',
    '/data',
    path.join(process.cwd(), 'data')
  ];

  // Find the first writable path
  for (const basePath of possiblePaths) {
    if (basePath) {
      try {
        const testPath = path.join(basePath, 'uploads');
        // Try to create the directory
        fs.mkdirSync(testPath, { recursive: true });
        // Test if we can write to it
        const testFile = path.join(testPath, '.write-test');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log(`✅ Using upload path: ${testPath}`);
        return testPath;
      } catch (error) {
        console.log(`❌ Cannot write to ${basePath}: ${error.message}`);
      }
    }
  }

  // Fallback to local uploads directory
  const fallbackPath = path.join(__dirname, '..', 'uploads');
  console.log(`⚠️  Using fallback upload path: ${fallbackPath}`);
  return fallbackPath;
};

/**
 * Ensure a specific upload subdirectory exists
 */
const ensureUploadDirectory = (subdir) => {
  const uploadPath = getRailwayUploadPath();
  const fullPath = path.join(uploadPath, subdir);
  
  try {
    fs.mkdirSync(fullPath, { recursive: true });
    return fullPath;
  } catch (error) {
    console.error(`Failed to create directory ${fullPath}:`, error);
    throw error;
  }
};

module.exports = {
  getRailwayUploadPath,
  ensureUploadDirectory
};