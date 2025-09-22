import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';

import Home from './pages/Home';
import Search from './pages/Search';
import Results from './pages/Results';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import Admin from './pages/Admin';
import Reviews from './pages/Reviews';
import Notifications from './pages/Notifications';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Header />
      <Container maxWidth="lg">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/results" element={<Results />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
