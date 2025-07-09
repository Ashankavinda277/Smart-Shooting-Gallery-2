const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  age: { type: Number, required: true },
  mode: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' }
}, {
  timestamps: true // Add timestamps for when records are created/updated
});

module.exports = mongoose.model('User', userSchema);