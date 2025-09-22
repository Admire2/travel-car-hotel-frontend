import React from 'react';
import { Typography, Paper } from '@mui/material';

function Admin() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Typography variant="body1">Manage users, bookings, reviews, and listings here.</Typography>
      {/* Add tables and management UI here */}
    </Paper>
  );
}

export default Admin;
