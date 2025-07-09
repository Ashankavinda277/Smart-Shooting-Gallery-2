const express = require('express');
const router = express.Router();

// Import all route modules
const userRoutes = require('./userRoutes');
const scoreRoutes = require('./game/scoreRoutes');
const settingsRoutes = require('./game/settingsRoutes');

// Apply routes
router.use('/users', userRoutes);
router.use('/game/scores', scoreRoutes);
router.use('/game/settings', settingsRoutes);

module.exports = router;
