const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const { isAuthenticated, isMovieOwner } = require('../middleware/auth');
const { validateMovie } = require('../middleware/validation');
const { validationResult } = require('express-validator');

// GET /movies - List all movies
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    res.render('index', {
      title: 'All Movies',
      movies: movies
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    req.session.error = 'Error loading movies';
    res.render('index', {
      title: 'All Movies',
      movies: []
    });
  }
});

// GET /movies/add - Show add movie form
router.get('/add', isAuthenticated, (req, res) => {
  res.render('movies/add', {
    title: 'Add Movie',
    errors: {},
    oldInput: {}
  });
});

// POST /movies/add - Create new movie
router.post('/add', isAuthenticated, validateMovie, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('movies/add', {
      title: 'Add Movie',
      errors: errors.mapped(),
      oldInput: req.body
    });
  }

  try {
    const { name, description, year, genres, rating } = req.body;

    const movie = new Movie({
      name,
      description,
      year,
      genres: Array.isArray(genres) ? genres : [genres],
      rating: rating || null,
      createdBy: req.session.userId
    });

    await movie.save();
    req.session.success = 'Movie added successfully!';
    res.redirect('/movies');
  } catch (error) {
    console.error('Error adding movie:', error);
    res.render('movies/add', {
      title: 'Add Movie',
      errors: { general: { msg: 'Error adding movie. Please try again.' } },
      oldInput: req.body
    });
  }
});

// GET /movies/:id - View single movie details
router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!movie) {
      req.session.error = 'Movie not found';
      return res.redirect('/movies');
    }

    res.render('movies/details', {
      title: movie.name,
      movie: movie
    });
  } catch (error) {
    console.error('Error fetching movie:', error);
    req.session.error = 'Error loading movie';
    res.redirect('/movies');
  }
});

// GET /movies/:id/edit - Show edit form
router.get('/:id/edit', isAuthenticated, isMovieOwner, (req, res) => {
  res.render('movies/edit', {
    title: 'Edit Movie',
    movie: req.movie,
    errors: {},
    oldInput: req.movie
  });
});

// POST /movies/:id/edit - Update movie
router.post('/:id/edit', isAuthenticated, isMovieOwner, validateMovie, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('movies/edit', {
      title: 'Edit Movie',
      movie: req.movie,
      errors: errors.mapped(),
      oldInput: req.body
    });
  }

  try {
    const { name, description, year, genres, rating } = req.body;

    req.movie.name = name;
    req.movie.description = description;
    req.movie.year = year;
    req.movie.genres = Array.isArray(genres) ? genres : [genres];
    req.movie.rating = rating || null;

    await req.movie.save();
    req.session.success = 'Movie updated successfully!';
    res.redirect(`/movies/${req.movie._id}`);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.render('movies/edit', {
      title: 'Edit Movie',
      movie: req.movie,
      errors: { general: { msg: 'Error updating movie. Please try again.' } },
      oldInput: req.body
    });
  }
});

// POST /movies/:id/delete - Delete movie
router.post('/:id/delete', isAuthenticated, isMovieOwner, async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.params.id);
    req.session.success = 'Movie deleted successfully!';
    res.redirect('/movies');
  } catch (error) {
    console.error('Error deleting movie:', error);
    req.session.error = 'Error deleting movie';
    res.redirect('/movies');
  }
});

module.exports = router;