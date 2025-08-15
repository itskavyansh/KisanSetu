const express = require('express');
const multer = require('multer');
const cropHealthService = require('../services/cropHealthService');
const router = express.Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// POST /api/crop-health/analyze
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { cropType } = req.body;
    const imageBuffer = req.file.buffer;

    // Analyze the crop image
    const analysis = await cropHealthService.analyzeCropImage(imageBuffer, cropType);

    res.json({
      success: true,
      data: analysis,
      message: 'Crop analysis completed successfully'
    });

  } catch (error) {
    console.error('Crop health analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze crop image',
      message: error.message
    });
  }
});

// GET /api/crop-health/history
router.get('/history', async (req, res) => {
  try {
    // TODO: Implement history retrieval from database
    res.json({
      success: true,
      data: [],
      message: 'History retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve history'
    });
  }
});

module.exports = router;