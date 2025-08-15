const express = require('express');
const governmentSchemesService = require('../services/governmentSchemesService');
const router = express.Router();

// GET /api/schemes/search
router.get('/search', async (req, res) => {
  try {
    const { q: query, category, status } = req.query;
    const filters = { category, status };
    
    const results = await governmentSchemesService.searchSchemes(query, filters);
    res.json(results);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/schemes/:schemeId
router.get('/:schemeId', async (req, res) => {
  try {
    const { schemeId } = req.params;
    const scheme = await governmentSchemesService.getSchemeDetails(schemeId);
    res.json(scheme);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/schemes/:schemeId/eligibility
router.post('/:schemeId/eligibility', async (req, res) => {
  try {
    const { schemeId } = req.params;
    const farmerProfile = req.body;
    
    const eligibility = await governmentSchemesService.checkEligibility(schemeId, farmerProfile);
    res.json(eligibility);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/schemes/:schemeId/application-guide
router.get('/:schemeId/application-guide', async (req, res) => {
  try {
    const { schemeId } = req.params;
    const guide = await governmentSchemesService.getApplicationGuide(schemeId);
    res.json(guide);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/schemes/categories
router.get('/categories', async (req, res) => {
  try {
    const categories = ['Irrigation', 'Soil Management', 'Equipment', 'Seeds', 'Insurance'];
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
