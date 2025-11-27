const express = require('express');
const router = express.Router();

// Home route - redirect to movies
router.get('/', (req, res) => {
  res.redirect('/movies');
});

module.exports = router;