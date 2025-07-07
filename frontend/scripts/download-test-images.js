const https = require('https');
const fs = require('fs');
const path = require('path');

// Ensure public directory exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Function to download image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(publicDir, filename);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete incomplete file
      reject(err);
    });
  });
}

async function downloadTestImages() {
  console.log('Downloading test images from Lorem Picsum...\n');

  try {
    // Download avatar placeholder (square for profile pictures)
    console.log('Downloading avatar placeholder...');
    await downloadImage('https://picsum.photos/400/400?random=avatar', 'placeholder-avatar.jpg');

    // Download general tattoo placeholder
    console.log('\nDownloading general tattoo placeholder...');
    await downloadImage('https://picsum.photos/800/800?random=tattoo', 'placeholder-tattoo.jpg');

    // Download portfolio placeholders (12 different images)
    console.log('\nDownloading portfolio placeholders...');
    for (let i = 1; i <= 12; i++) {
      await downloadImage(`https://picsum.photos/600/600?random=${i}`, `placeholder-tattoo-${i}.jpg`);
    }

    console.log('\n✅ All images downloaded successfully!');
  } catch (error) {
    console.error('❌ Error downloading images:', error);
  }
}

// Run the download
downloadTestImages();