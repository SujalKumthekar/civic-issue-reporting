import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'civic-issues',
    resource_type: file.mimetype.startsWith('video') ? 'video' : 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov'],
  }),
});

const multerUpload = multer({ storage });

// Wrapper that makes file upload optional — if it fails, continue without files
const upload = {
  array: (fieldName, maxCount) => (req, res, next) => {
    multerUpload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        console.error('Upload error (non-fatal):', err.message);
        req.files = [];
      }
      next();
    });
  },
};

export default upload;
