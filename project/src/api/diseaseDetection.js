const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Disease detection endpoint
router.post('/detect-disease', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { location, cultivar, growthStage, fieldHistory } = req.body;

    if (!location || !cultivar || !growthStage) {
      return res.status(400).json({ error: 'Missing required information' });
    }

    // TODO: Integrate with your AI model here
    // For now, returning context-aware mock data based on the provided information
    let mockAnalysis = {
      disease: null,
      confidence: 0,
      recommendations: []
    };

    // Example logic based on growth stage
    switch (growthStage) {
      case 'seedling':
        mockAnalysis = {
          disease: 'Seedling Blight',
          confidence: 0.92,
          recommendations: [
            'Apply appropriate fungicide treatment',
            'Ensure proper drainage in the field',
            'Monitor soil temperature and moisture',
            'Consider seed treatment for future plantings'
          ]
        };
        break;
      case 'tillering':
        mockAnalysis = {
          disease: 'Powdery Mildew',
          confidence: 0.88,
          recommendations: [
            'Apply systemic fungicide',
            'Improve air circulation between plants',
            'Monitor humidity levels',
            'Consider resistant varieties for future seasons'
          ]
        };
        break;
      case 'booting':
      case 'heading':
        mockAnalysis = {
          disease: 'Leaf Rust',
          confidence: 0.95,
          recommendations: [
            'Apply rust-specific fungicide immediately',
            'Monitor other plants for signs of spread',
            'Plan for resistant varieties next season',
            'Document the outbreak for future reference'
          ]
        };
        break;
      case 'flowering':
      case 'ripening':
        mockAnalysis = {
          disease: 'Head Blight',
          confidence: 0.87,
          recommendations: [
            'Consider early harvest if infection is severe',
            'Monitor grain quality closely',
            'Plan post-harvest storage carefully',
            'Implement crop rotation for next season'
          ]
        };
        break;
      default:
        mockAnalysis = {
          disease: 'Leaf Blight',
          confidence: 0.89,
          recommendations: [
            'Apply copper-based fungicide',
            'Improve air circulation around plants',
            'Remove and destroy infected leaves',
            'Water at the base of plants to avoid wetting leaves'
          ]
        };
    }

    // Add location-specific recommendations
    mockAnalysis.recommendations.push(
      `Consider local weather patterns in ${location} for treatment timing`,
      `Consult local agricultural extension for ${cultivar}-specific treatments`
    );

    if (fieldHistory) {
      mockAnalysis.recommendations.push(
        'Review field history for pattern of diseases',
        'Adjust crop rotation plan based on historical disease pressure'
      );
    }

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting file:', err);
    });

    res.json(mockAnalysis);
  } catch (error) {
    console.error('Error in disease detection:', error);
    
    // Clean up uploaded file in case of error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

module.exports = router; 