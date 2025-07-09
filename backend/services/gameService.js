// Game service - contains business logic for game operations
const Score = require('../models/game/Score');

/**
 * Save a new game score
 * @param {Object} scoreData - Score data including user, score, accuracy, gameMode and timePlayed
 * @returns {Object} The created score record
 */
const saveScore = async (scoreData) => {
  try {
    const score = new Score(scoreData);
    await score.save();
    return score;
  } catch (error) {
    throw error;
  }
};

/**
 * Get top scores for a specific game mode
 * @param {string} gameMode - Game mode (easy, medium, hard)
 * @param {number} limit - Maximum number of scores to retrieve
 * @returns {Array} List of top scores
 */
const getTopScores = async (gameMode, limit = 10) => {
  try {
    const scores = await Score.find({ gameMode })
      .sort({ score: -1 }) // Descending order
      .limit(limit)
      .populate('user', 'username age');
    return scores;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a user's personal best score
 * @param {string} userId - User ID
 * @param {string} gameMode - Game mode (easy, medium, hard)
 * @returns {Object} User's best score
 */
const getUserBestScore = async (userId, gameMode) => {
  try {
    const bestScore = await Score.findOne({ user: userId, gameMode })
      .sort({ score: -1 })
      .populate('user', 'username age');
    return bestScore;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  saveScore,
  getTopScores,
  getUserBestScore
};
