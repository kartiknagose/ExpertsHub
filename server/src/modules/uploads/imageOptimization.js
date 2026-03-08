const sharp = require('sharp');

async function optimizeImage(buffer, options = {}) {
  // Resize to max width/height, convert to WebP, compress
  const { width = 800, height = 800, quality = 80 } = options;
  return sharp(buffer)
    .resize(width, height, { fit: 'inside' })
    .webp({ quality })
    .toBuffer();
}

module.exports = { optimizeImage };