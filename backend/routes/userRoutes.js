const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User registration
router.post('/register', userController.registerUser);


router.get('/', (req, res) => {
  res.status(200).json({ message: 'User route is working!' })
});

module.exports = router;

