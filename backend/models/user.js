const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: false }, // Made optional for temporary users
  age: { type: Number, required: false }, // Made optional
  mode: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' }
}, {
  timestamps: true // Add timestamps for when records are created/updated
});

// Export the model safely to avoid OverwriteModelError
module.exports = mongoose.models.User || mongoose.model('User', userSchema);