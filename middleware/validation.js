const { body } = require('express-validator');

// Validation rules for user registration
exports.validateRegistration = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

// Validation rules for login
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Validation rules for movie
exports.validateMovie = [
  body('name')
    .trim()
    .notEmpty().withMessage('Movie name is required')
    .isLength({ min: 1, max: 200 }).withMessage('Name must be 1-200 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  
  body('year')
    .notEmpty().withMessage('Year is required')
    .isInt({ min: 1888, max: new Date().getFullYear() + 1 })
    .withMessage(`Year must be between 1888 and ${new Date().getFullYear() + 1}`),
  
  body('genres')
    .custom((value, { req }) => {
      // Handle both array and single value
      if (!value || (Array.isArray(value) && value.length === 0)) {
        throw new Error('At least one genre is required');
      }
      return true;
    }),
  
  body('rating')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 10 }).withMessage('Rating must be between 0 and 10')
];