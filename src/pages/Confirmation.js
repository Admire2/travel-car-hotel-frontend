import React from 'react';
import { Typography, Paper } from '@mui/material';

function Confirmation() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Booking Confirmed!</Typography>
      <Typography variant="body1">Your booking was successful. A confirmation email has been sent.</Typography>
    </Paper>
  );
}

export default Confirmation;
