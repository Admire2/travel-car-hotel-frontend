import React, { useEffect, useState } from 'react';
import ReviewForm from '../components/ReviewForm';
import { Paper, Typography, List, ListItem, ListItemText } from '@mui/material';
import axios from 'axios';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const loadReviews = async () => {
    const res = await axios.get('/api/reviews');
    setReviews(res.data);
  };
  useEffect(() => { loadReviews(); }, []);
  return (
    <div>
      <ReviewForm onReview={loadReviews} />
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>All Reviews</Typography>
        <List>
          {reviews.map((r, idx) => (
            <ListItem key={idx} divider>
              <ListItemText primary={`User: ${r.user}, Rating: ${r.rating}`} secondary={r.comment} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </div>
  );
}

export default Reviews;
