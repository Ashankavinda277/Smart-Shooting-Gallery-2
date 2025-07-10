/**
 * API Service Module
 * Handles all API requests to the backend
 */

// Use import.meta.env for Vite or fallback for other tools
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Make a request to the API
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} body - Request body
 * @returns {Promise<Object>} Response data
 */
const apiRequest = async (endpoint, method = 'GET', body = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const config = {
      method,
      headers
    };
    
    if (body) {
      config.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    return {
      ok: response.ok,
      ...data
    };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

/**
 * User registration
 * @param {string} username - User's username
 * @param {number} age - User's age
 * @param {string} mode - Game mode
 * @returns {Promise<Object>} Registration result
 */
export const registerUser = async (username, age, mode) => {
  return apiRequest('/users/register', 'POST', { username, age, mode });
};

/**
 * Submit game score
 * @param {Object} scoreData - Score data object
 * @returns {Promise<Object>} Score submission result
 */
export const submitScore = async (scoreData) => {
  return apiRequest('/game/scores', 'POST', scoreData);
};

/**
 * Fetch leaderboard data
 * @param {string} mode - Game mode filter (all, easy, medium, hard)
 * @returns {Promise<Object>} Leaderboard data
 */
export const fetchLeaderboard = async (mode = 'all') => {
  return apiRequest(`/game/scores/leaderboard?mode=${mode}`);
};

/**
 * Fetch player progress data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Player progress data
 */
export const fetchPlayerProgress = async (userId) => {
  return apiRequest(`/game/scores/player/${userId}`);
};

/**
 * Fetch game settings
 * @param {string} mode - Game mode
 * @returns {Promise<Object>} Game settings
 */
export const fetchGameSettings = async (mode) => {
  return apiRequest(`/game/settings/${mode}`);
};

/**
 * Game Control API methods
 */

/**
 * Start a game
 * @param {Object} gameConfig - Game configuration
 * @returns {Promise<Object>} Response data
 */
export const startGame = async (gameConfig) => {
  return apiRequest('/game/control/start', 'POST', gameConfig);
};

/**
 * Stop the current game
 * @returns {Promise<Object>} Response data
 */
export const stopGame = async () => {
  return apiRequest('/game/control/stop', 'POST');
};

/**
 * Reset the game
 * @returns {Promise<Object>} Response data
 */
export const resetGame = async () => {
  return apiRequest('/game/control/reset', 'POST');
};

/**
 * Send custom command to device
 * @param {string} command - Command name
 * @param {Object} data - Command data
 * @returns {Promise<Object>} Response data
 */
export const sendCommand = async (command, data = {}) => {
  return apiRequest('/game/control/command', 'POST', { command, data });
};

/**
 * Test WebSocket connection
 * @returns {Promise<Object>} Response data
 */
export const testConnection = async () => {
  return apiRequest('/game/control/test');
};

/**
 * Get WebSocket connection status
 * @returns {Promise<Object>} Response data
 */
export const getConnectionStatus = async () => {
  return apiRequest('/game/control/status');
};
