import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import axios from 'axios';

function ReviewForm({ bookingId, hotelId, carId, flightId, onReview }) {
  const [user, setUser] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/reviews', {
        user,
        booking: bookingId,
        hotel: hotelId,
        car: carId,
        flight: flightId,
        rating,
        comment
      });
      setUser('');
      setRating(5);
      setComment('');
      if (onReview) onReview();
      alert('Review submitted!');
    } catch (err) {
      alert('Failed to submit review: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Leave a Review</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="User ID" value={user} onChange={e => setUser(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Rating" type="number" value={rating} onChange={e => setRating(Number(e.target.value))} fullWidth margin="normal" inputProps={{ min: 1, max: 5 }} required />
        <TextField label="Comment" value={comment} onChange={e => setComment(e.target.value)} fullWidth margin="normal" multiline rows={3} />
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary" disabled={loading || !user}>Submit Review</Button>
        </Box>
      </form>
    </Paper>
  );
}

export default ReviewForm;
