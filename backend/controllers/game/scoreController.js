// Game controller for handling game-related requests
const gameService = require('../../services/gameService');
const { successResponse, errorResponse } = require('../../utils/responseUtil');

/**
 * Save a new game score
 * @route POST /api/game/scores
 */
exports.saveScore = async (req, res) => {
  console.log('Score submission received:', req.body);
  const { user, score, accuracy, gameMode, timePlayed } = req.body;
  try {
    // Debug log to verify score save request
    console.log('Attempting to save score:', { user, score, accuracy, gameMode, timePlayed });
    const savedScore = await gameService.saveScore({
      user,
      score,
      accuracy,
      gameMode,
      timePlayed
    });
    console.log('Score saved:', savedScore);
    return successResponse(
      res, 
      201, 
      'Score saved successfully', 
      { score: savedScore }
    );
  } catch (err) {
    console.error('Error saving score:', err);
    return errorResponse(res, 400, err.message);
  }
}

/**
 * Get top scores for a specific game mode
 * @route GET /api/game/scores/top/:gameMode
 */
exports.getTopScores = async (req, res) => {
  const { gameMode } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  
  try {
    const scores = await gameService.getTopScores(gameMode, limit);
    return successResponse(
      res, 
      200, 
      'Top scores retrieved successfully', 
      { scores }
    );
  } catch (err) {
    return errorResponse(res, 400, err.message);
  }
};

/**
 * Get a user's personal best score
 * @route GET /api/game/scores/user/:userId/:gameMode
 */
exports.getUserBestScore = async (req, res) => {
  const { userId, gameMode } = req.params;
  
  try {
    const bestScore = await gameService.getUserBestScore(userId, gameMode);
    
    if (!bestScore) {
      return successResponse(
        res, 
        200, 
        'No scores found for this user and game mode', 
        { bestScore: null }
      );
    }
    
    return successResponse(
      res, 
      200, 
      'Best score retrieved successfully', 
      { bestScore }
    );
  } catch (err) {
    return errorResponse(res, 400, err.message);
  }
};

/**
 * Get leaderboard for all or specific mode
 * @route GET /api/game/scores/leaderboard?mode=all|easy|medium|hard
 */
exports.getLeaderboard = async (req, res) => {
  const mode = req.query.mode || 'all';
  const limit = req.query.limit ? parseInt(req.query.limit) : 10;
  try {
    let scores;
    if (mode === 'all') {
      // Get top scores for all modes
      scores = await require('../../models/game/Score')
        .find({})
        .sort({ score: -1 })
        .limit(limit)
        .populate('user', 'username age');
    } else {
      // Get top scores for a specific mode
      scores = await require('../../models/game/Score')
        .find({ gameMode: mode })
        .sort({ score: -1 })
        .limit(limit)
        .populate('user', 'username age');
    }
        console.log('Leaderboard scores:', scores);
    return successResponse(res, 200, 'Leaderboard retrieved successfully', { scores });
  } catch (err) {
    return errorResponse(res, 400, err.message);
  }
};
