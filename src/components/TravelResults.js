import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Divider, Button } from '@mui/material';
import BookingDialog from './BookingDialog';

function TravelResults({ results }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [dialogItem, setDialogItem] = useState(null);

  const handleBook = (type, item) => {
    setDialogType(type);
    setDialogItem(item);
    setDialogOpen(true);
  };

  if (!results) return null;
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Search Results</Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Flights</Typography>
            {results.flights && results.flights.data ? (
              <ul>
                {results.flights.data.map((f, idx) => (
                  <li key={idx}>
                    {f.itineraries ? f.itineraries[0].segments[0].departure.iataCode : 'Flight'} - {f.price?.total || 'N/A'} {f.price?.currency || ''}
                    <Button size="small" sx={{ ml: 1 }} variant="outlined" onClick={() => handleBook('flight', f)}>Book</Button>
                  </li>
                ))}
              </ul>
            ) : <Typography>No flights found.</Typography>}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Hotels</Typography>
            {results.hotels && results.hotels.result ? (
              <ul>
                {results.hotels.result.map((h, idx) => (
                  <li key={idx}>
                    {h.hotel_name || 'Hotel'} - {h.price_breakdown?.gross_price || 'N/A'} {h.price_breakdown?.currency || ''}
                    <Button size="small" sx={{ ml: 1 }} variant="outlined" onClick={() => handleBook('hotel', h)}>Book</Button>
                  </li>
                ))}
              </ul>
            ) : <Typography>No hotels found.</Typography>}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">Cars</Typography>
            {results.cars && results.cars.data ? (
              <ul>
                {results.cars.data.map((c, idx) => (
                  <li key={idx}>
                    {c.make || 'Car'} {c.model || ''} - {c.pricePerDay?.amount || 'N/A'} {c.pricePerDay?.currency || ''}
                    <Button size="small" sx={{ ml: 1 }} variant="outlined" onClick={() => handleBook('car', c)}>Book</Button>
                  </li>
                ))}
              </ul>
            ) : <Typography>No cars found.</Typography>}
          </Paper>
        </Grid>
      </Grid>
      <BookingDialog open={dialogOpen} onClose={() => setDialogOpen(false)} type={dialogType} item={dialogItem} />
    </Box>
  );
}

export default TravelResults;
