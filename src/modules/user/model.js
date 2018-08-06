const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: 'Please supply an email address',
  },
  lodge: {
    type: String,
  },
  chapter: {
    type: String,
  },
  unit: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    default: 'guest',
  },
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

module.exports = mongoose.model('User', userSchema);
