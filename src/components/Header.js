import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Travel Car & Hotel Reservation
        </Typography>
        <Button color="inherit" component={Link} to="/">Home</Button>
        <Button color="inherit" component={Link} to="/search">Search</Button>
        <Button color="inherit" component={Link} to="/results">Results</Button>
        <Button color="inherit" component={Link} to="/booking">Booking</Button>
        <Button color="inherit" component={Link} to="/payment">Payment</Button>
        <Button color="inherit" component={Link} to="/confirmation">Confirmation</Button>
        <Button color="inherit" component={Link} to="/reviews">Reviews</Button>
        <Button color="inherit" component={Link} to="/notifications">Notifications</Button>
        <Button color="inherit" component={Link} to="/admin">Admin</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
