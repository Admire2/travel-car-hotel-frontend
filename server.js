require('dotenv').config();
// Simple Express server for Travel-Car&Hotel-Reservation-App
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/database');

const userRoutes = require('./backend/routes/users');
const carRoutes = require('./backend/routes/cars');
const hotelRoutes = require('./backend/routes/hotels');
const carsRoutes = require('./backend/routes/cars');
const hotelsRoutes = require('./backend/routes/hotels');
const flightsRoutes = require('./backend/routes/flights');
const paymentRoutes = require('./backend/routes/payment');
const searchRoutes = require('./backend/routes/search');
const bookingsRoutes = require('./backend/routes/bookings');
const adminRoutes = require('./backend/routes/admin');
const reviewsRoutes = require('./backend/routes/reviews');
const notifyRoutes = require('./backend/routes/notify');
const vacationRentalRoutes = require('./backend/routes/vacation-rentals');
const priceAlertRoutes = require('./backend/routes/price-alerts');
const bundleDealsRoutes = require('./backend/routes/bundleDeals');
const mapSearchRoutes = require('./backend/routes/mapSearch');
const currencyRoutes = require('./backend/routes/currency');


const app = express();
app.use(express.json());
app.use(express.static('public'));

connectDB();


app.use('/api/users', userRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/flights', flightsRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/notify', notifyRoutes);
app.use('/api/vacation-rentals', vacationRentalRoutes);
app.use('/api/price-alerts', priceAlertRoutes);
app.use('/api/bundle-deals', bundleDealsRoutes);
app.use('/api/map-search', mapSearchRoutes);
app.use('/api/currency', currencyRoutes);

// Booking endpoints for specific components
const hotelController = require('./backend/controllers/hotelController');
const flightController = require('./backend/controllers/flightController');
const carController = require('./backend/controllers/carController');
const vacationRentalController = require('./backend/controllers/vacationRentalController');
const bundleDealsController = require('./backend/controllers/bundleDealsController');

app.post('/api/book/hotel', hotelController.bookHotel);
app.post('/api/book/flight', flightController.bookFlight);
app.post('/api/book/car', carController.bookCar);
app.post('/api/book/rental', vacationRentalController.bookVacationRental);
app.post('/api/book/bundle', bundleDealsController.bookBundle);

app.get('/', (req, res) => {
    res.send(`
        <h1>Welcome to International Travel Car, Hotel & Flight Reservation App</h1>
        <p>Book cars, hotels, and flights worldwide with ease!</p>
        <ul>
            <li><a href="/flights">Find Flights</a></li>
            <li><a href="/tickets">Ticket Deals</a></li>
            <li><a href="/progress">Project Progress</a></li>
        </ul>
    `);
});

// Flights endpoint (mock data)
app.get('/flights', (req, res) => {
    res.json([
        { airline: "Air Global", from: "Lagos", to: "London", price: 450 },
        { airline: "SkyJet", from: "New York", to: "Paris", price: 520 },
        { airline: "FlyWorld", from: "Johannesburg", to: "Dubai", price: 390 }
    ]);
});

// Ticket deals endpoint (mock data)
app.get('/tickets', (req, res) => {
    res.json([
        { type: "Flight", deal: "20% off to Dubai", expires: "2025-09-30" },
        { type: "Hotel", deal: "Free breakfast in Tokyo", expires: "2025-10-15" },
        { type: "Car", deal: "10% off car rentals in Paris", expires: "2025-10-01" }
    ]);
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
