// Check if user is authenticated (logged in)
exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next(); // User is logged in, continue
  }
  
  // User not logged in, redirect to login
  req.session.error = 'Please login to access this page';
  res.redirect('/login');
};

// Check if user owns the movie (for edit/delete)
exports.isMovieOwner = async (req, res, next) => {
  try {
    const Movie = require('../models/Movie');
    const movie = await Movie.findById(req.params.id);
    
    if (!movie) {
      req.session.error = 'Movie not found';
      return res.redirect('/movies');
    }
    
    // Check if current user created this movie
    if (movie.createdBy.toString() !== req.session.userId) {
      req.session.error = 'You do not have permission to modify this movie';
      return res.redirect('/movies');
    }
    
    // User owns the movie, continue
    req.movie = movie; // Attach movie to request
    next();
  } catch (error) {
    console.error(error);
    req.session.error = 'Something went wrong';
    res.redirect('/movies');
  }
};