import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request } from 'express';

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads/photos';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `photo-${uniqueSuffix}${extension}`);
  }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
    files: 5 // Maximum 5 files per request
  },
  fileFilter: fileFilter
});

// Middleware for single file upload
export const uploadSingle = upload.single('photo');

// Middleware for multiple file uploads
export const uploadMultiple = upload.array('photos', 5);

// Utility function to delete uploaded files
export const deleteUploadedFiles = (filenames: string[]): void => {
  filenames.forEach(filename => {
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
};

// Utility function to get file URL
export const getFileUrl = (filename: string): string => {
  return `/api/uploads/photos/${filename}`;
};

// Middleware to serve uploaded files
export const serveUploadedFile = (req: Request, res: any, next: any) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }
  
  // Set appropriate headers
  const extension = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  
  switch (extension) {
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.webp':
      contentType = 'image/webp';
      break;
  }
  
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
  
  // Send file
  res.sendFile(path.resolve(filePath));
};

// Image processing utilities
export const validateImageFile = (file: Express.Multer.File): { isValid: boolean; error?: string } => {
  // Check file size (additional check)
  if (file.size > 10485760) { // 10MB
    return { isValid: false, error: 'File size exceeds 10MB limit' };
  }
  
  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const extension = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(extension)) {
    return { isValid: false, error: 'Invalid file extension' };
  }
  
  return { isValid: true };
};

// Clean up old files (utility for cleanup jobs)
export const cleanupOldFiles = (daysOld: number = 30): void => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Error reading upload directory:', err);
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }
        
        if (stats.mtime < cutoffDate) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting old file:', err);
            } else {
              console.log('Deleted old file:', file);
            }
          });
        }
      });
    });
  });
};