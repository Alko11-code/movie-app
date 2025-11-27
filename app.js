// Load environment variables
require('dotenv').config();

// Import packages
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');

// Import database connection
const connectDB = require('./config/database');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// View engine setup (Pug)
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware - Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware - Method override (for DELETE requests)
app.use(methodOverride('_method'));

// Middleware - Static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware - Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// Middleware - Flash messages and user data to all views
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? {
    userId: req.session.userId,
    username: req.session.username
  } : null;
  
  res.locals.successMessage = req.session.success;
  res.locals.errorMessage = req.session.error;
  delete req.session.success;
  delete req.session.error;
  
  next();
});

// Routes
app.get('/', (req, res) => {
  res.redirect('/movies');
});

// Import route files
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');

// Use routes
app.use('/', indexRoutes); 
app.use('/', authRoutes);
app.use('/movies', movieRoutes);

// 404 Error handler
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('500 - Something went wrong!');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV}`);
});