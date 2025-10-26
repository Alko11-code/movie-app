const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Movie name is required'],
    trim: true,
    minlength: [1, 'Movie name must be at least 1 character'],
    maxlength: [200, 'Movie name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Movie description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters']
  },
  year: {
    type: Number,
    required: [true, 'Release year is required'],
    min: [1888, 'Year must be 1888 or later (first movie ever made)'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the distant future']
  },
  genres: {
    type: [String],
    required: [true, 'At least one genre is required'],
    validate: {
      validator: function(value) {
        return value && value.length > 0;
      },
      message: 'At least one genre must be selected'
    }
  },
  rating: {
    type: Number,
    min: [0, 'Rating must be between 0 and 10'],
    max: [10, 'Rating must be between 0 and 10'],
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);