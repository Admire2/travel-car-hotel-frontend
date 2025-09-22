import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, Box } from '@mui/material';

function Payment() {
  const [card, setCard] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Payment</Typography>
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <TextField label="Name" value={name} onChange={e => setName(e.target.value)} fullWidth margin="normal" required />
          <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} fullWidth margin="normal" required />
          <TextField label="Card Number" value={card} onChange={e => setCard(e.target.value)} fullWidth margin="normal" required />
          <Box mt={2}><Button type="submit" variant="contained">Pay</Button></Box>
        </form>
      ) : (
        <Typography variant="h5" color="success.main">Payment Successful!</Typography>
      )}
    </Paper>
  );
}

export default Payment;
