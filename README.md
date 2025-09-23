# Travel Car & Hotel Reservation App

A full-stack web application for booking car rentals and hotel reservations.

## Features
- Browse available cars and hotels
- Reserve cars for specific dates
- Book hotels for specific check-in/check-out dates
- RESTful API for all reservation operations

## Project Structure
```
├── backend/
│   ├── controllers/
│   ├── models/
│   └── routes/
├── frontend/
│   ├── components/
│   └── pages/
├── config/
├── server.js
└── package.json
```

## API Endpoints
### Cars
- `GET /api/cars` - Get list of available cars
- `POST /api/cars/reserve` - Reserve a car

### Hotels
- `GET /api/hotels` - Get list of available hotels
- `POST /api/hotels/reserve` - Reserve a hotel

## Installation
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm start` to start the server
4. Visit `http://localhost:4001` in your browser

## Development
- Run `npm run dev` for development with auto-restart
