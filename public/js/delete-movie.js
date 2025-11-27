// Delete Movie Confirmation Script
// This script adds a confirmation dialog before deleting a movie

document.addEventListener('DOMContentLoaded', function() {
  // Find all delete forms
  const deleteForms = document.querySelectorAll('.delete-form');
  
  // Add submit event listener to each form
  deleteForms.forEach(form => {
    form.addEventListener('submit', function(e) {
      // Show confirmation dialog
      const confirmed = confirm('Are you sure you want to delete this movie? This action cannot be undone.');
      
      // If user clicks Cancel, prevent form submission
      if (!confirmed) {
        e.preventDefault();
      }
      // If user clicks OK, form submits normally
    });
  });
});
