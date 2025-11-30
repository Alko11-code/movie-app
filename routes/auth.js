const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// ========================================
// GET - Show registration form
// ========================================
router.get('/register', (req, res) => {
  res.render('auth/register', {
    title: 'Register',
    errors: {},
    oldInput: {}
  });
});

// ========================================
// POST - Register new user
// ========================================
router.post('/register', validateRegistration, async (req, res) => {
  const errors = validationResult(req);
  
  // Check for validation errors
  if (!errors.isEmpty()) {
    const errorMap = errors.mapped();
    return res.render('auth/register', {
      title: 'Register',
      errors: errorMap,
      oldInput: req.body
    });
  }

  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    
    if (existingUser) {
      const errors = {};
      if (existingUser.email === email) {
        errors.email = { msg: 'Email already registered' };
      }
      if (existingUser.username === username) {
        errors.username = { msg: 'Username already taken' };
      }
      
      return res.render('auth/register', {
        title: 'Register',
        errors,
        oldInput: req.body
      });
    }

    // Create new user (password will be hashed automatically by User model)
    const user = new User({ username, email, password });
    await user.save();

    // Create session with personalized welcome message
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.success = `Registration successful! Welcome, ${user.username}! 
                       ⚠️ Please save your login credentials safely.`;
    
    res.redirect('/movies');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', {
      title: 'Register',
      errors: {
        general: { msg: 'An error occurred. Please try again.' }
      },
      oldInput: req.body
    });
  }
});

// ========================================
// GET - Show login form
// ========================================
router.get('/login', (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    errors: {},
    oldInput: {}
  });
});

// ========================================
// POST - Login user
// ========================================
router.post('/login', validateLogin, async (req, res) => {
  const errors = validationResult(req);
  
  // Check for validation errors (empty fields)
  if (!errors.isEmpty()) {
    const errorMap = errors.mapped();
    return res.render('auth/login', {
      title: 'Login',
      errors: errorMap,
      oldInput: req.body
    });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      // Email not found - show specific error
      return res.render('auth/login', {
        title: 'Login',
        errors: {
          email: { msg: 'No user found with this email' }
        },
        oldInput: req.body
      });
    }

    // Check password using comparePassword method from User model
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      // Password incorrect - show specific error
      return res.render('auth/login', {
        title: 'Login',
        errors: {
          password: { msg: 'Password is incorrect' }
        },
        oldInput: req.body
      });
    }

    // Success - create session with personalized welcome message
    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.success = `Login successful! Welcome back, ${user.username}!`;
    
    res.redirect('/movies');
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', {
      title: 'Login',
      errors: {
        general: { msg: 'An error occurred. Please try again.' }
      },
      oldInput: req.body
    });
  }
});

// ========================================
// GET - Logout user
// ========================================
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/movies');
    }
    res.redirect('/login');
  });
});

// ========================================
// Export router
// ========================================
module.exports = router;