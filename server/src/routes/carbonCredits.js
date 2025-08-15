const express = require('express');
const carbonCreditService = require('../services/carbonCreditService');
const router = express.Router();

// POST /api/carbon-credits/calculate
router.post('/calculate', async (req, res) => {
  try {
    const projectData = req.body;
    const calculation = await carbonCreditService.calculateCarbonCredits(projectData);
    res.json(calculation);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/carbon-credits/market-info
router.get('/market-info', async (req, res) => {
  try {
    const marketInfo = await carbonCreditService.getCarbonMarketInfo();
    res.json(marketInfo);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/carbon-credits/project-templates
router.get('/project-templates', async (req, res) => {
  try {
    const templates = await carbonCreditService.getProjectTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/carbon-credits/verify-project
router.post('/verify-project', async (req, res) => {
  try {
    const { projectId, verificationData } = req.body;
    
    // Mock verification process
    const verification = {
      projectId,
      status: 'Under Review',
      submittedAt: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      requirements: verificationData.requirements || [],
      notes: 'Project submitted for verification. Our team will review and contact you within 7 days.'
    };
    
    res.json({
      success: true,
      data: verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/carbon-credits/verification-status/:projectId
router.get('/verification-status/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Mock verification status
    const status = {
      projectId,
      status: 'Under Review',
      progress: 60,
      lastUpdated: new Date().toISOString(),
      nextMilestone: 'Field Verification Visit',
      estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
    };
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
