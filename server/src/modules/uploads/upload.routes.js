const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const auth = require('../../middleware/auth');
const asyncHandler = require('../../common/utils/asyncHandler');
const prisma = require('../../config/prisma');

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/profile-photos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ext || '.jpg';
    cb(null, `user-${req.user.id}-${Date.now()}${safeExt}`);
  },
});

// Only allow image uploads (accept any image/* mime type)
const fileFilter = (_req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }

  cb(new Error('Only image files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/uploads/profile-photo
// Upload profile photo and update user record
router.post(
  '/profile-photo',
  auth,
  upload.single('photo'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const relativeUrl = `/uploads/profile-photos/${req.file.filename}`;
    const publicUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;

    await prisma.user.update({
      where: { id: req.user.id },
      data: { profilePhotoUrl: relativeUrl },
    });

    res.status(201).json({ url: relativeUrl, publicUrl });
  })
);

module.exports = router;
