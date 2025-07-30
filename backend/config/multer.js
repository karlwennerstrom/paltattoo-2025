const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createStorage = (folder) => {
  // Use Railway Volume path if available, fallback to local uploads
  const baseUploadPath = process.env.RAILWAY_VOLUME_MOUNT_PATH 
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'uploads')
    : path.join(__dirname, '..', 'uploads');
  
  const uploadPath = path.join(baseUploadPath, folder);
  
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
};

const fileFilter = (allowedTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp']) => {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    const mimeType = file.mimetype.toLowerCase();
    
    // Check if it's an image
    const isImage = allowedTypes.includes(ext) && mimeType.startsWith('image/');
    
    // Check if it's a video (for portfolio uploads)
    const isVideo = ['mp4', 'mov', 'avi'].includes(ext) && mimeType.startsWith('video/');
    
    if (isImage || (allowedTypes.includes('video') && isVideo)) {
      return cb(null, true);
    } else {
      cb(new Error(`Solo se permiten archivos de tipo: ${allowedTypes.join(', ')}`));
    }
  };
};

const uploadProfile = multer({
  storage: createStorage('profiles'),
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter: fileFilter(['jpeg', 'jpg', 'png', 'webp'])
});

const uploadPortfolio = multer({
  storage: createStorage('portfolio'),
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB for videos
    files: 1
  },
  fileFilter: fileFilter(['jpeg', 'jpg', 'png', 'webp', 'video', 'mp4', 'mov'])
});

const uploadReferences = multer({
  storage: createStorage('references'),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  },
  fileFilter: fileFilter(['jpeg', 'jpg', 'png', 'webp'])
});

const uploadMultiplePortfolio = multer({
  storage: createStorage('portfolio'),
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 10
  },
  fileFilter: fileFilter(['jpeg', 'jpg', 'png', 'webp', 'video', 'mp4', 'mov'])
});

module.exports = {
  uploadProfile,
  uploadPortfolio,
  uploadReferences,
  uploadMultiplePortfolio
};