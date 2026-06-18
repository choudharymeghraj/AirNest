const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/recommend', aiController.getRecommendations);

module.exports = router;
