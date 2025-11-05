import express, { Request, Response } from 'express';
import { uploadSingle, uploadMultiple, handleUploadError } from '../middleware/cloudinary-upload.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * @route   POST /api/upload/single
 * @desc    Upload single image
 * @access  Public
 */
router.post('/single', uploadSingle, handleUploadError, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.file as any;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: file.path,
        publicId: file.filename,
        width: file.width,
        height: file.height,
        format: file.format,
        size: file.size,
        thumbnail: cloudinary.url(file.filename, {
          width: 300,
          height: 200,
          crop: 'fill',
          quality: 'auto',
          fetch_format: 'auto'
        })
      }
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple images
 * @access  Public
 */
router.post('/multiple', uploadMultiple, handleUploadError, async (req: Request, res: Response) => {
  try {
    if (!req.files || (req.files as any[]).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const files = req.files as any[];
    const uploadedImages = files.map(file => ({
      url: file.path,
      publicId: file.filename,
      width: file.width,
      height: file.height,
      format: file.format,
      size: file.size,
      thumbnail: cloudinary.url(file.filename, {
        width: 300,
        height: 200,
        crop: 'fill',
        quality: 'auto',
        fetch_format: 'auto'
      })
    }));

    res.json({
      success: true,
      message: `${files.length} images uploaded successfully`,
      data: uploadedImages
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/upload/:publicId
 * @desc    Delete image from Cloudinary
 * @access  Public
 */
router.delete('/:publicId(*)', async (req, res) => {
  try {
    const publicId = req.params.publicId;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        error: 'Image not found',
        message: 'The image may have already been deleted'
      });
    }
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({
      error: 'Delete failed',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/upload/transform/:publicId
 * @desc    Get transformed image URL
 * @access  Public
 */
router.get('/transform/:publicId(*)', async (req, res) => {
  try {
    const publicId = req.params.publicId;
    const { width, height, crop, quality, format } = req.query;

    const transformation: any = {
      quality: quality || 'auto',
      fetch_format: format || 'auto'
    };

    if (width) transformation.width = parseInt(width as string);
    if (height) transformation.height = parseInt(height as string);
    if (crop) transformation.crop = crop;

    const url = cloudinary.url(publicId, transformation);

    res.json({
      success: true,
      url: url,
      transformation: transformation
    });
  } catch (error: any) {
    console.error('Transform error:', error);
    res.status(500).json({
      error: 'Transform failed',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/upload/details/:publicId
 * @desc    Get image details
 * @access  Public
 */
router.get('/details/:publicId(*)', async (req, res) => {
  try {
    const publicId = req.params.publicId;

    const result = await cloudinary.api.resource(publicId);

    res.json({
      success: true,
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        createdAt: result.created_at,
        versions: result.versions || []
      }
    });
  } catch (error: any) {
    console.error('Get details error:', error);
    res.status(404).json({
      error: 'Image not found',
      message: error.message
    });
  }
});

export default router;
