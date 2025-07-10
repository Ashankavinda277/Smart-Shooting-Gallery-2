const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

// Import configurations and middleware
const { port } = require('./config/app');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorMiddleware');
const { requestLogger } = require('./middleware/loggingMiddleware');
const { isAuthorized } = require('./middleware/authMiddleware');

// Import routes and websocket server
const routes = require('./routes');
const setupWebSocketServer = require('./websocketServer');

// Initialize express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
setupWebSocketServer(server);

// Apply middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Connect to MongoDB
connectDB();

// Apply routes
app.use('/api', routes);

// Apply error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001; // changed from 5000 to 5001

// Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));