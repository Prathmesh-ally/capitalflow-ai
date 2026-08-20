const express = require('express');
const { getDashboardData, approveAction, simulateCrash } = require('../controllers/dataController');
const router = express.Router();
const { runTreasuryAnalysis } = require('../controllers/aiController');

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});


router.get('/dashboard', getDashboardData);
router.post('/ai/crash', simulateCrash);

router.post('/ai/analyze', runTreasuryAnalysis);
router.post('/ai/approve/:actionId', approveAction);

module.exports = router;