const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');
const fs = require('fs').promises;

ffmpeg.setFfmpegPath(ffmpegStatic);

const VideoProcessor = {
  // Process video for portfolio
  processPortfolioVideo: async (inputPath, outputPath, artistId, index = 0) => {
    try {
      const filename = `portfolio-video-${artistId}-${Date.now()}-${index}.mp4`;
      const fullOutputPath = path.join(outputPath, filename);
      
      const thumbnailFilename = `thumb-${filename.replace('.mp4', '.jpg')}`;
      const thumbnailPath = path.join(outputPath, thumbnailFilename);
      
      // Get video info first
      const videoInfo = await VideoProcessor.getVideoInfo(inputPath);
      
      // Validate video
      await VideoProcessor.validateVideo(inputPath);
      
      // Process video
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions([
            '-c:v libx264',
            '-crf 23',
            '-preset medium',
            '-c:a aac',
            '-b:a 128k',
            '-movflags +faststart',
            '-vf scale=\'min(1080,iw):-2\'',
            '-t 30' // Limit to 30 seconds
          ])
          .output(fullOutputPath)
          .on('end', resolve)
          .on('error', reject)
          .run();
      });
      
      // Generate thumbnail
      await new Promise((resolve, reject) => {
        ffmpeg(fullOutputPath)
          .screenshots({
            timestamps: ['50%'],
            filename: thumbnailFilename,
            folder: outputPath,
            size: '400x400'
          })
          .on('end', resolve)
          .on('error', reject);
      });
      
      // Delete original file
      await fs.unlink(inputPath);
      
      return {
        filename,
        thumbnailFilename,
        duration: videoInfo.duration,
        size: videoInfo.size
      };
    } catch (error) {
      // Clean up files on error
      await fs.unlink(inputPath).catch(() => {});
      throw error;
    }
  },

  // Get video information
  getVideoInfo: (inputPath) => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        
        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        
        resolve({
          duration: metadata.format.duration,
          size: metadata.format.size,
          width: videoStream?.width,
          height: videoStream?.height,
          bitRate: metadata.format.bit_rate,
          format: metadata.format.format_name
        });
      });
    });
  },

  // Validate video file
  validateVideo: async (inputPath, options = {}) => {
    const {
      maxDurationSeconds = 30,
      maxSizeMB = 50,
      minWidth = 480,
      minHeight = 480,
      maxWidth = 1920,
      maxHeight = 1920
    } = options;
    
    try {
      const info = await VideoProcessor.getVideoInfo(inputPath);
      const sizeMB = info.size / (1024 * 1024);
      
      if (info.duration > maxDurationSeconds) {
        throw new Error(`Video demasiado largo. Máximo: ${maxDurationSeconds} segundos`);
      }
      
      if (sizeMB > maxSizeMB) {
        throw new Error(`Video demasiado grande. Máximo: ${maxSizeMB}MB`);
      }
      
      if (info.width && info.height) {
        if (info.width < minWidth || info.height < minHeight) {
          throw new Error(`Resolución muy baja. Mínimo: ${minWidth}x${minHeight}px`);
        }
        
        if (info.width > maxWidth || info.height > maxHeight) {
          throw new Error(`Resolución muy alta. Máximo: ${maxWidth}x${maxHeight}px`);
        }
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Generate video thumbnail at specific time
  generateThumbnail: async (videoPath, thumbnailPath, timePercent = 50) => {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [`${timePercent}%`],
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
          size: '400x400'
        })
        .on('end', resolve)
        .on('error', reject);
    });
  },

  // Compress video
  compressVideo: async (inputPath, outputPath, quality = 'medium') => {
    const qualitySettings = {
      low: { crf: 28, preset: 'fast' },
      medium: { crf: 23, preset: 'medium' },
      high: { crf: 18, preset: 'slow' }
    };
    
    const settings = qualitySettings[quality] || qualitySettings.medium;
    
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          `-c:v libx264`,
          `-crf ${settings.crf}`,
          `-preset ${settings.preset}`,
          `-c:a aac`,
          `-b:a 128k`,
          `-movflags +faststart`
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  },

  // Delete video and its thumbnail
  deleteVideo: async (videoPath, thumbnailPath = null) => {
    try {
      await fs.unlink(videoPath);
      if (thumbnailPath) {
        await fs.unlink(thumbnailPath).catch(() => {});
      }
      return true;
    } catch (error) {
      console.log('Video deletion failed or file not found:', videoPath);
      return false;
    }
  }
};

module.exports = VideoProcessor;