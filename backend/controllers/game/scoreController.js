// Game controller for handling game-related requests
const gameService = require('../../services/gameService');
const { successResponse, errorResponse } = require('../../utils/responseUtil');

/**
 * Save a new game score
 * @route POST /api/game/scores
 */
exports.saveScore = async (req, res) => {
  const { user, score, accuracy, gameMode, timePlayed } = req.body;
  
  try {
    const savedScore = await gameService.saveScore({
      user,
      score,
      accuracy,
      gameMode,
      timePlayed
    });
    
    return successResponse(
      res, 
      201, 
      'Score saved successfully', 
      { score: savedScore }
    );
  } catch (err) {
    return errorResponse(res, 400, err.message);
  }
};

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
