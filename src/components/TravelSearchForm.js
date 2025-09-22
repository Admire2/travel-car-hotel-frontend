import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Grid, Paper } from '@mui/material';
import axios from 'axios';

function TravelSearchForm({ onResults }) {
  const [flightParams, setFlightParams] = useState({ origin: '', destination: '', departureDate: '' });
  const [hotelParams, setHotelParams] = useState({ location: '', checkinDate: '', checkoutDate: '' });
  const [carParams, setCarParams] = useState({ location: '', pickupDate: '', returnDate: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (setter) => (e) => {
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/search/travel', {
        flightParams,
        hotelParams,
        carParams
      });
      onResults(res.data);
    } catch (err) {
      alert('Search failed: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>Unified Travel Search</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1">Flight Search</Typography>
            <TextField label="Origin" name="origin" value={flightParams.origin} onChange={handleChange(setFlightParams)} fullWidth margin="normal" />
            <TextField label="Destination" name="destination" value={flightParams.destination} onChange={handleChange(setFlightParams)} fullWidth margin="normal" />
            <TextField label="Departure Date" name="departureDate" type="date" value={flightParams.departureDate} onChange={handleChange(setFlightParams)} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1">Hotel Search</Typography>
            <TextField label="Location" name="location" value={hotelParams.location} onChange={handleChange(setHotelParams)} fullWidth margin="normal" />
            <TextField label="Check-in Date" name="checkinDate" type="date" value={hotelParams.checkinDate} onChange={handleChange(setHotelParams)} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
            <TextField label="Check-out Date" name="checkoutDate" type="date" value={hotelParams.checkoutDate} onChange={handleChange(setHotelParams)} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1">Car Search</Typography>
            <TextField label="Location" name="location" value={carParams.location} onChange={handleChange(setCarParams)} fullWidth margin="normal" />
            <TextField label="Pickup Date" name="pickupDate" type="date" value={carParams.pickupDate} onChange={handleChange(setCarParams)} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
            <TextField label="Return Date" name="returnDate" type="date" value={carParams.returnDate} onChange={handleChange(setCarParams)} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
          </Grid>
        </Grid>
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>Search</Button>
        </Box>
      </form>
    </Paper>
  );
}

export default TravelSearchForm;
