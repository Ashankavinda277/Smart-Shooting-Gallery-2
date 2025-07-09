const express = require('express');
const router = express.Router();
const scoreController = require('../../controllers/game/scoreController');

// Score routes
router.post('/scores', scoreController.saveScore);
router.get('/scores/top/:gameMode', scoreController.getTopScores);
router.get('/scores/user/:userId/:gameMode', scoreController.getUserBestScore);

module.exports = router;
