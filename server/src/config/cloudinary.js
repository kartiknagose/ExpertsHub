const { v2: cloudinary } = require('cloudinary');
const logger = require('./logger');

const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  logger.info('Cloudinary configured (cloud: %s)', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  logger.warn('Cloudinary env vars missing — file uploads will use local disk storage');
}

/**
 * Upload a buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {object} options - { folder, public_id, resource_type }
 * @returns {Promise<{url: string, publicId: string}>}
 */
function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'ExpertsHub',
        public_id: options.public_id,
        resource_type: options.resource_type || 'image',
        transformation: options.transformation,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Delete a file from Cloudinary by public ID.
 */
async function deleteFromCloudinary(publicId, resourceType = 'image') {
  if (!isConfigured || !publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    logger.warn('Cloudinary delete failed for %s: %s', publicId, err.message);
  }
}

module.exports = { isConfigured, uploadToCloudinary, deleteFromCloudinary };
