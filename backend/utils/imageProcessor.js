const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const ImageProcessor = {
  // Profile image processing
  processProfileImage: async (inputPath, outputPath, userId) => {
    try {
      const filename = `profile-${userId}-${Date.now()}.jpg`;
      const fullOutputPath = path.join(outputPath, filename);
      
      await sharp(inputPath)
        .resize(400, 400, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ 
          quality: 85,
          progressive: true
        })
        .toFile(fullOutputPath);
      
      await fs.unlink(inputPath);
      
      return filename;
    } catch (error) {
      await fs.unlink(inputPath).catch(() => {});
      throw error;
    }
  },

  // Portfolio image processing
  processPortfolioImage: async (inputPath, outputPath, artistId, index = 0) => {
    try {
      // Ensure output directory exists
      try {
        await fs.mkdir(outputPath, { recursive: true });
      } catch (err) {
        if (err.code !== 'EEXIST') {
          throw err;
        }
      }

      const filename = `portfolio-${artistId}-${Date.now()}-${index}.jpg`;
      const fullOutputPath = path.join(outputPath, filename);
      
      const thumbnailFilename = `thumb-${filename}`;
      const thumbnailPath = path.join(outputPath, thumbnailFilename);
      
      await Promise.all([
        // Full size image
        sharp(inputPath)
          .resize(1200, 1200, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ 
            quality: 90,
            progressive: true
          })
          .toFile(fullOutputPath),
        
        // Thumbnail
        sharp(inputPath)
          .resize(300, 300, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ 
            quality: 80,
            progressive: true
          })
          .toFile(thumbnailPath)
      ]);
      
      await fs.unlink(inputPath);
      
      return {
        filename,
        thumbnailFilename
      };
    } catch (error) {
      await fs.unlink(inputPath).catch(() => {});
      throw error;
    }
  },

  // Reference image processing
  processReferenceImage: async (inputPath, outputPath, offerId, index = 0) => {
    try {
      const filename = `reference-${offerId}-${Date.now()}-${index}.jpg`;
      const fullOutputPath = path.join(outputPath, filename);
      
      await sharp(inputPath)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ 
          quality: 85,
          progressive: true
        })
        .toFile(fullOutputPath);
      
      await fs.unlink(inputPath);
      
      return filename;
    } catch (error) {
      await fs.unlink(inputPath).catch(() => {});
      throw error;
    }
  },

  // Process multiple images
  processMultipleImages: async (files, processor, ...args) => {
    const results = [];
    const errors = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await processor(files[i].path, ...args, i);
        results.push({
          original: files[i].originalname,
          processed: result,
          success: true
        });
      } catch (error) {
        errors.push({
          original: files[i].originalname,
          error: error.message,
          success: false
        });
      }
    }
    
    return { results, errors };
  },

  // Delete image with error handling
  deleteImage: async (imagePath) => {
    try {
      await fs.unlink(imagePath);
      return true;
    } catch (error) {
      console.log('Image deletion failed or file not found:', imagePath);
      return false;
    }
  },

  // Get image metadata
  getImageInfo: async (imagePath) => {
    try {
      const metadata = await sharp(imagePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        hasAlpha: metadata.hasAlpha
      };
    } catch (error) {
      throw new Error('Invalid image file');
    }
  },

  // Validate image dimensions and size
  validateImage: async (imagePath, options = {}) => {
    const {
      maxWidth = 4000,
      maxHeight = 4000,
      minWidth = 100,
      minHeight = 100,
      maxSizeKB = 10240 // 10MB
    } = options;
    
    try {
      const info = await ImageProcessor.getImageInfo(imagePath);
      const sizeKB = info.size / 1024;
      
      if (info.width > maxWidth || info.height > maxHeight) {
        throw new Error(`Image dimensions too large. Max: ${maxWidth}x${maxHeight}px`);
      }
      
      if (info.width < minWidth || info.height < minHeight) {
        throw new Error(`Image dimensions too small. Min: ${minWidth}x${minHeight}px`);
      }
      
      if (sizeKB > maxSizeKB) {
        throw new Error(`Image file too large. Max: ${maxSizeKB}KB`);
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = ImageProcessor;