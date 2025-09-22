import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';

function BookingDialog({ open, onClose, type, item }) {
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      let payload = { userId };
      if (type === 'flight') {
        endpoint = '/api/flights/book';
        payload.flightId = item._id || item.id;
        payload.passengers = [{ firstName: 'John', lastName: 'Doe' }];
      } else if (type === 'hotel') {
        endpoint = '/api/hotels/book';
        payload.hotelId = item._id || item.id;
        payload.checkInDate = item.checkInDate || '';
        payload.checkOutDate = item.checkOutDate || '';
        payload.guests = [{ firstName: 'John', lastName: 'Doe' }];
      } else if (type === 'car') {
        endpoint = '/api/cars/book';
        payload.carId = item._id || item.id;
        payload.pickupDate = item.pickupDate || '';
        payload.returnDate = item.returnDate || '';
        payload.passengers = [{ firstName: 'John', lastName: 'Doe' }];
      }
      await axios.post(endpoint, payload);
      alert('Booking successful!');
      onClose();
    } catch (err) {
      alert('Booking failed: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Book {type && type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
      <DialogContent>
        <Typography gutterBottom>Enter your User ID to book:</Typography>
        <TextField label="User ID" value={userId} onChange={e => setUserId(e.target.value)} fullWidth margin="normal" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleBook} variant="contained" color="primary" disabled={loading || !userId}>Book</Button>
      </DialogActions>
    </Dialog>
  );
}

export default BookingDialog;
