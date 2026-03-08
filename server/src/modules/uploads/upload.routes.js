const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const auth = require('../../middleware/auth');
const asyncHandler = require('../../common/utils/asyncHandler');
const prisma = require('../../config/prisma');
const { isConfigured: cloudinaryEnabled, uploadToCloudinary } = require('../../config/cloudinary');
const { optimizeImage } = require('./imageOptimization');

const router = Router();

// Ensure upload directory exists
const profilePhotoDir = path.join(__dirname, '../../uploads/profile-photos');
if (!fs.existsSync(profilePhotoDir)) {
  fs.mkdirSync(profilePhotoDir, { recursive: true });
}

const verificationDocDir = path.join(__dirname, '../../uploads/verification-docs');
if (!fs.existsSync(verificationDocDir)) {
  fs.mkdirSync(verificationDocDir, { recursive: true });
}

const bookingPhotoDir = path.join(__dirname, '../../uploads/booking-photos');
if (!fs.existsSync(bookingPhotoDir)) {
  fs.mkdirSync(bookingPhotoDir, { recursive: true });
}

const chatAttachmentDir = path.join(__dirname, '../../uploads/chat-attachments');
if (!fs.existsSync(chatAttachmentDir)) {
  fs.mkdirSync(chatAttachmentDir, { recursive: true });
}

// Multer storage config for profile photos
const profilePhotoStorage = cloudinaryEnabled
  ? multer.memoryStorage()
  : multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, profilePhotoDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `user-${req.user.id}-${Date.now()}${ext}`);
    },
  });

// Multer storage config for verification documents
const verificationDocStorage = cloudinaryEnabled
  ? multer.memoryStorage()
  : multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, verificationDocDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `verif-${req.user.id}-${Date.now()}${ext}`);
    },
  });

// Multer storage config for booking photos
const bookingPhotoStorage = cloudinaryEnabled
  ? multer.memoryStorage()
  : multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, bookingPhotoDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, `booking-${req.user.id}-${Date.now()}${ext}`);
    },
  });

// Multer storage config for chat attachments
const chatAttachmentStorage = cloudinaryEnabled
  ? multer.memoryStorage()
  : multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, chatAttachmentDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `chat-${req.user.id}-${Date.now()}${ext}`);
    },
  });

// ─── SECURITY: Safe image extensions whitelist ───
// SVG files can contain <script> tags and JS event handlers.
// Since uploads are served as static files, a malicious SVG would execute
// JavaScript in any visitor's browser (Stored XSS). We reject SVGs AND
// validate by extension (MIME types can be spoofed by the client).
const SAFE_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff']);

// Only allow safe raster image uploads (NO SVG)
const imageFileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // Check 1: MIME type must be image/* but NOT svg
  if (!file.mimetype || !file.mimetype.startsWith('image/') || file.mimetype.includes('svg')) {
    return cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed. SVG is not permitted.'), false);
  }

  // Check 2: Extension must be in the safe whitelist
  if (!SAFE_IMAGE_EXTENSIONS.has(ext)) {
    return cb(new Error(`File extension "${ext}" is not allowed. Use JPG, PNG, GIF, or WebP.`), false);
  }

  cb(null, true);
};

// Allow safe images and PDF uploads (NO SVG)
const docFileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  // PDFs are allowed for verification documents
  if (file.mimetype === 'application/pdf' && ext === '.pdf') {
    return cb(null, true);
  }

  // Same safe image check as above
  if (!file.mimetype || !file.mimetype.startsWith('image/') || file.mimetype.includes('svg')) {
    return cb(new Error('Only image files (JPG, PNG, GIF, WebP) or PDF are allowed. SVG is not permitted.'), false);
  }

  if (!SAFE_IMAGE_EXTENSIONS.has(ext)) {
    return cb(new Error(`File extension "${ext}" is not allowed. Use JPG, PNG, GIF, WebP, or PDF.`), false);
  }

  cb(null, true);
};

const uploadProfile = multer({
  storage: profilePhotoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadVerification = multer({
  storage: verificationDocStorage,
  fileFilter: docFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadBooking = multer({
  storage: bookingPhotoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadChatAttachment = multer({
  storage: chatAttachmentStorage,
  fileFilter: docFileFilter, // Allows images + PDF
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// POST /api/uploads/profile-photo
router.post(
  '/profile-photo',
  auth,
  uploadProfile.single('photo'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let photoUrl;
    let optimizedBuffer = req.file.buffer;

    // Optimize image before upload
    if (optimizedBuffer) {
      optimizedBuffer = await optimizeImage(optimizedBuffer, { width: 400, height: 400, quality: 80 });
    }

    if (cloudinaryEnabled && optimizedBuffer) {
      const result = await uploadToCloudinary(optimizedBuffer, {
        folder: 'urbanpro/profile-photos',
        public_id: `user-${req.user.id}-${Date.now()}`,
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
      });
      photoUrl = result.url;
    } else {
      photoUrl = `/uploads/profile-photos/${req.file.filename}`;
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePhotoUrl: photoUrl },
    });

    res.status(201).json({ url: photoUrl });
  })
);

// POST /api/uploads/verification-doc
router.post(
  '/verification-doc',
  auth,
  uploadVerification.single('document'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let docUrl;

    if (cloudinaryEnabled && req.file.buffer) {
      const isPdf = req.file.mimetype === 'application/pdf';
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'urbanpro/verification-docs',
        public_id: `verif-${req.user.id}-${Date.now()}`,
        resource_type: isPdf ? 'raw' : 'image',
      });
      docUrl = result.url;
    } else {
      docUrl = `/uploads/verification-docs/${req.file.filename}`;
    }

    res.status(201).json({ url: docUrl });
  })
);

/**
 * POST /api/uploads/booking-photo
 * Upload a photo for a booking (BEFORE or AFTER)
 */
router.post(
  '/booking-photo',
  auth,
  uploadBooking.single('photo'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let photoUrl;

    if (cloudinaryEnabled && req.file.buffer) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'urbanpro/booking-photos',
        public_id: `booking-${req.user.id}-${Date.now()}`,
      });
      photoUrl = result.url;
    } else {
      photoUrl = `/uploads/booking-photos/${req.file.filename}`;
    }

    // Optionally link to booking if details provided
    const { bookingId, type } = req.body;
    if (bookingId && type) {
      await prisma.bookingPhoto.create({
        data: {
          bookingId: parseInt(bookingId),
          url: photoUrl,
          type: type // 'BEFORE' or 'AFTER'
        }
      });
    }

    res.status(201).json({
      url: photoUrl,
      message: 'Photo uploaded successfully'
    });
  })
);

/**
 * POST /api/uploads/chat-attachment
 * Upload a file for chat (image or document)
 */
router.post(
  '/chat-attachment',
  auth,
  uploadChatAttachment.single('attachment'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let fileUrl;

    if (cloudinaryEnabled && req.file.buffer) {
      const isPdf = req.file.mimetype === 'application/pdf';
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'urbanpro/chat-attachments',
        public_id: `chat-${req.user.id}-${Date.now()}`,
        resource_type: isPdf ? 'raw' : 'image',
      });
      fileUrl = result.url;
    } else {
      fileUrl = `/uploads/chat-attachments/${req.file.filename}`;
    }

    res.status(201).json({
      url: fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimetype: req.file.mimetype,
    });
  })
);

module.exports = router;
