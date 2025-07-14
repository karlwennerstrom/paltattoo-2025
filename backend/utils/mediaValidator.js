const ImageProcessor = require('./imageProcessor');
const VideoProcessor = require('./videoProcessor');
const path = require('path');

const MediaValidator = {
  // File size limits
  limits: {
    image: {
      maxSizeMB: 10,
      maxWidth: 4000,
      maxHeight: 4000,
      minWidth: 300,
      minHeight: 300
    },
    video: {
      maxSizeMB: 50,
      maxDurationSeconds: 30,
      maxWidth: 1920,
      maxHeight: 1920,
      minWidth: 480,
      minHeight: 480
    }
  },

  // Supported formats
  supportedFormats: {
    image: ['jpg', 'jpeg', 'png', 'webp'],
    video: ['mp4', 'mov', 'avi']
  },

  // Validate file type
  validateFileType: (file) => {
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    const mimeType = file.mimetype.toLowerCase();
    
    const isImage = MediaValidator.supportedFormats.image.includes(ext) && 
                   mimeType.startsWith('image/');
    const isVideo = MediaValidator.supportedFormats.video.includes(ext) && 
                   mimeType.startsWith('video/');
    
    if (!isImage && !isVideo) {
      throw new Error(`Formato no soportado. Formatos permitidos: ${[
        ...MediaValidator.supportedFormats.image,
        ...MediaValidator.supportedFormats.video
      ].join(', ')}`);
    }
    
    return isVideo ? 'video' : 'image';
  },

  // Validate file size
  validateFileSize: (file, mediaType) => {
    const limits = MediaValidator.limits[mediaType];
    const sizeMB = file.size / (1024 * 1024);
    
    if (sizeMB > limits.maxSizeMB) {
      throw new Error(`Archivo demasiado grande. Máximo: ${limits.maxSizeMB}MB`);
    }
    
    return true;
  },

  // Validate image
  validateImage: async (filePath) => {
    try {
      await ImageProcessor.validateImage(filePath, MediaValidator.limits.image);
      return true;
    } catch (error) {
      throw new Error(`Imagen inválida: ${error.message}`);
    }
  },

  // Validate video
  validateVideo: async (filePath) => {
    try {
      await VideoProcessor.validateVideo(filePath, MediaValidator.limits.video);
      return true;
    } catch (error) {
      throw new Error(`Video inválido: ${error.message}`);
    }
  },

  // Complete validation pipeline
  validateMedia: async (file) => {
    try {
      // 1. Validate file type
      const mediaType = MediaValidator.validateFileType(file);
      
      // 2. Validate file size
      MediaValidator.validateFileSize(file, mediaType);
      
      // 3. Validate content (after upload)
      if (mediaType === 'image') {
        await MediaValidator.validateImage(file.path);
      } else {
        await MediaValidator.validateVideo(file.path);
      }
      
      return {
        isValid: true,
        mediaType,
        message: 'Archivo válido'
      };
    } catch (error) {
      return {
        isValid: false,
        mediaType: null,
        message: error.message
      };
    }
  },

  // Get file info
  getFileInfo: async (filePath, mediaType) => {
    try {
      if (mediaType === 'image') {
        return await ImageProcessor.getImageInfo(filePath);
      } else {
        return await VideoProcessor.getVideoInfo(filePath);
      }
    } catch (error) {
      throw new Error(`Error obteniendo información del archivo: ${error.message}`);
    }
  },

  // Check portfolio limits
  checkPortfolioLimits: (currentCount, maxItems = 50) => {
    if (currentCount >= maxItems) {
      throw new Error(`Has alcanzado el límite máximo de ${maxItems} items en tu portafolio`);
    }
    return true;
  },

  // Check category limits
  checkCategoryLimits: (categoryItems, maxPerCategory = 20) => {
    if (categoryItems >= maxPerCategory) {
      throw new Error(`Has alcanzado el límite máximo de ${maxPerCategory} items por categoría`);
    }
    return true;
  },

  // Sanitize filename
  sanitizeFilename: (filename) => {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  },

  // Generate unique filename
  generateFilename: (originalName, userId, prefix = 'portfolio') => {
    const ext = path.extname(originalName);
    const sanitized = MediaValidator.sanitizeFilename(
      path.basename(originalName, ext)
    );
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1000);
    
    return `${prefix}-${userId}-${timestamp}-${random}${ext}`;
  }
};

module.exports = MediaValidator;