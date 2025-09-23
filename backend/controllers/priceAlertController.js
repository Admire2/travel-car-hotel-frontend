// priceAlertController.js - Backend controller for price alert management

const cron = require('node-cron');
const nodemailer = require('nodemailer'); // For email notifications
const twilio = require('twilio'); // For SMS notifications

// Mock database for price alerts (in production, use MongoDB/PostgreSQL)
let priceAlerts = [
  {
    id: 'alert_001',
    userId: 'user_001',
    type: 'flight',
    route: {
      from: 'New York, NY (JFK)',
      to: 'Los Angeles, CA (LAX)',
      departDate: '2024-03-15',
      returnDate: '2024-03-22',
      passengers: 2,
      class: 'economy'
    },
    targetPrice: 350,
    currentPrice: 420,
    email: 'user@example.com',
    phone: '+1234567890',
    notificationPreference: 'email',
    active: true,
    createdAt: new Date('2024-01-15'),
    lastChecked: new Date(),
    lastTriggered: null,
    triggerCount: 0
  },
  {
    id: 'alert_002',
    userId: 'user_001',
    type: 'hotel',
    hotel: {
      destination: 'Miami, FL',
      checkIn: '2024-04-10',
      checkOut: '2024-04-15',
      guests: 2,
      rooms: 1,
      starRating: '4'
    },
    targetPrice: 180,
    currentPrice: 220,
    email: 'user@example.com',
    phone: '+1234567890',
    notificationPreference: 'both',
    active: true,
    createdAt: new Date('2024-01-20'),
    lastChecked: new Date(),
    lastTriggered: null,
    triggerCount: 0
  }
];

// Email configuration (using nodemailer)
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
});

// SMS configuration (using Twilio)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || 'your-twilio-sid',
  process.env.TWILIO_AUTH_TOKEN || 'your-twilio-token'
);

// Get user's price alerts
const getMyAlerts = async (req, res) => {
  try {
    // In production, filter by authenticated user ID
    const userId = req.user?.id || 'user_001'; // Mock user ID
    
    const userAlerts = priceAlerts.filter(alert => alert.userId === userId);
    
    res.json({
      success: true,
      data: userAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });

  } catch (error) {
    console.error('Error fetching user alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price alerts',
      error: error.message
    });
  }
};

// Create new price alert
const createPriceAlert = async (req, res) => {
  try {
    const {
      type,
      route,
      hotel,
      car,
      targetPrice,
      currentPrice,
      email,
      phone,
      notificationPreference,
      active = true
    } = req.body;

    // Validate required fields
    if (!type || !targetPrice || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: type, targetPrice, email'
      });
    }

    // Validate alert type data
    if (type === 'flight' && (!route?.from || !route?.to || !route?.departDate)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required flight information'
      });
    }

    if (type === 'hotel' && (!hotel?.destination || !hotel?.checkIn || !hotel?.checkOut)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required hotel information'
      });
    }

    if (type === 'car' && (!car?.pickupLocation || !car?.pickupDate || !car?.dropoffDate)) {
      return res.status(400).json({
        success: false,
        message: 'Missing required car rental information'
      });
    }

    // Generate alert ID
    const alertId = `alert_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const userId = req.user?.id || 'user_001'; // Mock user ID

    // Create alert object
    const newAlert = {
      id: alertId,
      userId,
      type,
      route: type === 'flight' ? route : undefined,
      hotel: type === 'hotel' ? hotel : undefined,
      car: type === 'car' ? car : undefined,
      targetPrice: parseFloat(targetPrice),
      currentPrice: currentPrice ? parseFloat(currentPrice) : null,
      email,
      phone,
      notificationPreference,
      active,
      createdAt: new Date(),
      lastChecked: new Date(),
      lastTriggered: null,
      triggerCount: 0
    };

    // Save to mock database
    priceAlerts.push(newAlert);

    console.log('Price alert created:', alertId);

    res.json({
      success: true,
      message: 'Price alert created successfully',
      data: {
        alertId,
        alert: newAlert
      }
    });

  } catch (error) {
    console.error('Error creating price alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create price alert',
      error: error.message
    });
  }
};

// Update price alert (toggle active status)
const toggleAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    const userId = req.user?.id || 'user_001';

    const alertIndex = priceAlerts.findIndex(alert => 
      alert.id === id && alert.userId === userId
    );

    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Price alert not found'
      });
    }

    priceAlerts[alertIndex].active = active;
    priceAlerts[alertIndex].lastChecked = new Date();

    res.json({
      success: true,
      message: `Alert ${active ? 'activated' : 'deactivated'} successfully`,
      data: priceAlerts[alertIndex]
    });

  } catch (error) {
    console.error('Error toggling alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert',
      error: error.message
    });
  }
};

// Delete price alert
const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'user_001';

    const alertIndex = priceAlerts.findIndex(alert => 
      alert.id === id && alert.userId === userId
    );

    if (alertIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Price alert not found'
      });
    }

    const deletedAlert = priceAlerts.splice(alertIndex, 1)[0];

    console.log('Price alert deleted:', id);

    res.json({
      success: true,
      message: 'Price alert deleted successfully',
      data: deletedAlert
    });

  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete alert',
      error: error.message
    });
  }
};

// Check current prices for a specific alert
const checkAlertPrices = async (alert) => {
  try {
    let apiEndpoint = '';
    let searchParams = {};

    // Determine API endpoint based on alert type
    if (alert.type === 'flight') {
      apiEndpoint = `${process.env.APP_URL || 'http://localhost:4002'}/api/flights/search`;
      searchParams = {
        from: alert.route.from,
        to: alert.route.to,
        departDate: alert.route.departDate,
        returnDate: alert.route.returnDate,
        passengers: alert.route.passengers,
        class: alert.route.class
      };
    } else if (alert.type === 'hotel') {
      apiEndpoint = `${process.env.APP_URL || 'http://localhost:4002'}/api/hotels/search`;
      searchParams = {
        destination: alert.hotel.destination,
        checkIn: alert.hotel.checkIn,
        checkOut: alert.hotel.checkOut,
        guests: alert.hotel.guests,
        rooms: alert.hotel.rooms
      };
    } else if (alert.type === 'car') {
      apiEndpoint = `${process.env.APP_URL || 'http://localhost:4002'}/api/cars/search`;
      searchParams = {
        pickup: alert.car.pickupLocation,
        dropoff: alert.car.dropoffLocation,
        pickupDate: alert.car.pickupDate,
        dropoffDate: alert.car.dropoffDate
      };
    }

    // Make API call to search for current prices
    const queryString = new URLSearchParams(searchParams).toString();
    const response = await fetch(`${apiEndpoint}?${queryString}`);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      // Find the lowest price from results
      const prices = data.data.map(item => 
        item.price || item.totalPrice || item.pricePerNight || 0
      );
      const lowestPrice = Math.min(...prices);
      
      return {
        success: true,
        currentPrice: lowestPrice,
        resultCount: data.data.length
      };
    }

    return {
      success: false,
      error: 'No results found'
    };

  } catch (error) {
    console.error(`Error checking prices for alert ${alert.id}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Send email notification
const sendEmailNotification = async (alert, currentPrice, oldPrice) => {
  try {
    const priceDifference = oldPrice - currentPrice;
    const percentageDiscount = ((priceDifference / oldPrice) * 100).toFixed(1);

    const emailSubject = `🎯 Price Alert: ${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} price dropped!`;
    
    let emailBody = `
      <h2>Great news! Your price alert was triggered!</h2>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>${alert.type === 'flight' ? `✈️ Flight: ${alert.route.from} → ${alert.route.to}` : 
              alert.type === 'hotel' ? `🏨 Hotel in ${alert.hotel.destination}` :
              `🚗 Car rental in ${alert.car.pickupLocation}`}</h3>
        
        <p><strong>Target Price:</strong> $${alert.targetPrice}</p>
        <p><strong>New Price:</strong> <span style="color: #28a745; font-size: 1.2em;">$${currentPrice}</span></p>
        <p><strong>You Save:</strong> <span style="color: #28a745;">$${priceDifference.toFixed(2)} (${percentageDiscount}% off)</span></p>
      </div>

      ${alert.type === 'flight' ? `
        <p><strong>Flight Details:</strong></p>
        <ul>
          <li>Departure: ${alert.route.departDate}</li>
          <li>Return: ${alert.route.returnDate || 'One way'}</li>
          <li>Passengers: ${alert.route.passengers}</li>
          <li>Class: ${alert.route.class}</li>
        </ul>
      ` : ''}

      ${alert.type === 'hotel' ? `
        <p><strong>Hotel Details:</strong></p>
        <ul>
          <li>Check-in: ${alert.hotel.checkIn}</li>
          <li>Check-out: ${alert.hotel.checkOut}</li>
          <li>Guests: ${alert.hotel.guests}</li>
          <li>Rooms: ${alert.hotel.rooms}</li>
        </ul>
      ` : ''}

      ${alert.type === 'car' ? `
        <p><strong>Car Rental Details:</strong></p>
        <ul>
          <li>Pickup: ${alert.car.pickupDate}</li>
          <li>Drop-off: ${alert.car.dropoffDate}</li>
          <li>Drop-off location: ${alert.car.dropoffLocation}</li>
        </ul>
      ` : ''}

      <div style="margin-top: 30px;">
        <a href="${process.env.APP_URL || 'http://localhost:3000'}" 
           style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Book Now
        </a>
      </div>

      <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
        This alert was triggered on ${new Date().toLocaleString()}.<br>
        To manage your price alerts, visit your account dashboard.
      </p>
    `;

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@travelapp.com',
      to: alert.email,
      subject: emailSubject,
      html: emailBody
    });

    console.log(`Email notification sent to ${alert.email} for alert ${alert.id}`);
    return true;

  } catch (error) {
    console.error(`Error sending email for alert ${alert.id}:`, error);
    return false;
  }
};

// Send SMS notification
const sendSMSNotification = async (alert, currentPrice, oldPrice) => {
  try {
    if (!alert.phone) {
      console.log(`No phone number for alert ${alert.id}`);
      return false;
    }

    const priceDifference = oldPrice - currentPrice;
    const percentageDiscount = ((priceDifference / oldPrice) * 100).toFixed(1);

    let messageBody = `🎯 Price Alert: Your ${alert.type} price dropped to $${currentPrice}! `;
    messageBody += `You save $${priceDifference.toFixed(2)} (${percentageDiscount}% off). `;
    
    if (alert.type === 'flight') {
      messageBody += `${alert.route.from} → ${alert.route.to} on ${alert.route.departDate}. `;
    } else if (alert.type === 'hotel') {
      messageBody += `Hotel in ${alert.hotel.destination} from ${alert.hotel.checkIn}. `;
    } else if (alert.type === 'car') {
      messageBody += `Car rental in ${alert.car.pickupLocation} from ${alert.car.pickupDate}. `;
    }
    
    messageBody += `Book now: ${process.env.APP_URL || 'http://localhost:3000'}`;

    await twilioClient.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE || '+1234567890',
      to: alert.phone
    });

    console.log(`SMS notification sent to ${alert.phone} for alert ${alert.id}`);
    return true;

  } catch (error) {
    console.error(`Error sending SMS for alert ${alert.id}:`, error);
    return false;
  }
};

// Process price alert notifications
const processAlertNotifications = async (alert, currentPrice) => {
  try {
    const oldPrice = alert.currentPrice;
    
    // Update alert with new price and last checked time
    const alertIndex = priceAlerts.findIndex(a => a.id === alert.id);
    if (alertIndex !== -1) {
      priceAlerts[alertIndex].currentPrice = currentPrice;
      priceAlerts[alertIndex].lastChecked = new Date();
      priceAlerts[alertIndex].lastTriggered = new Date();
      priceAlerts[alertIndex].triggerCount += 1;
    }

    // Send notifications based on user preference
    const notifications = [];

    if (alert.notificationPreference === 'email' || alert.notificationPreference === 'both') {
      notifications.push(sendEmailNotification(alert, currentPrice, oldPrice));
    }

    if (alert.notificationPreference === 'sms' || alert.notificationPreference === 'both') {
      notifications.push(sendSMSNotification(alert, currentPrice, oldPrice));
    }

    const results = await Promise.all(notifications);
    const successCount = results.filter(result => result === true).length;

    console.log(`Alert ${alert.id}: ${successCount}/${notifications.length} notifications sent successfully`);

  } catch (error) {
    console.error(`Error processing notifications for alert ${alert.id}:`, error);
  }
};

// Manual price check for all active alerts
const checkAllActivePrices = async (req, res) => {
  try {
    const activeAlerts = priceAlerts.filter(alert => alert.active);
    console.log(`Checking prices for ${activeAlerts.length} active alerts...`);

    const results = [];

    for (const alert of activeAlerts) {
      const priceCheck = await checkAlertPrices(alert);
      
      if (priceCheck.success) {
        const currentPrice = priceCheck.currentPrice;
        const shouldTrigger = currentPrice <= alert.targetPrice;

        if (shouldTrigger) {
          await processAlertNotifications(alert, currentPrice);
          results.push({
            alertId: alert.id,
            triggered: true,
            currentPrice,
            targetPrice: alert.targetPrice
          });
        } else {
          // Update price without triggering notification
          const alertIndex = priceAlerts.findIndex(a => a.id === alert.id);
          if (alertIndex !== -1) {
            priceAlerts[alertIndex].currentPrice = currentPrice;
            priceAlerts[alertIndex].lastChecked = new Date();
          }
          
          results.push({
            alertId: alert.id,
            triggered: false,
            currentPrice,
            targetPrice: alert.targetPrice
          });
        }
      } else {
        results.push({
          alertId: alert.id,
          error: priceCheck.error
        });
      }

      // Add delay between API calls to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    res.json({
      success: true,
      message: `Checked ${activeAlerts.length} alerts`,
      data: results
    });

  } catch (error) {
    console.error('Error checking all prices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check prices',
      error: error.message
    });
  }
};

// Setup automated price checking cron job
const setupPriceCheckingCron = () => {
  // Run price checks daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Starting automated price check at', new Date().toISOString());
    
    try {
      const activeAlerts = priceAlerts.filter(alert => alert.active);
      console.log(`Checking prices for ${activeAlerts.length} active alerts...`);

      for (const alert of activeAlerts) {
        const priceCheck = await checkAlertPrices(alert);
        
        if (priceCheck.success) {
          const currentPrice = priceCheck.currentPrice;
          const shouldTrigger = currentPrice <= alert.targetPrice;

          if (shouldTrigger) {
            await processAlertNotifications(alert, currentPrice);
            console.log(`Alert ${alert.id} triggered: $${currentPrice} <= $${alert.targetPrice}`);
          } else {
            // Update price without triggering notification
            const alertIndex = priceAlerts.findIndex(a => a.id === alert.id);
            if (alertIndex !== -1) {
              priceAlerts[alertIndex].currentPrice = currentPrice;
              priceAlerts[alertIndex].lastChecked = new Date();
            }
          }
        }

        // Add delay between API calls to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      console.log('Automated price check completed at', new Date().toISOString());

    } catch (error) {
      console.error('Error in automated price check:', error);
    }
  });

  console.log('Price checking cron job scheduled for daily 9:00 AM');
};

// Initialize cron job when server starts
setupPriceCheckingCron();

module.exports = {
  getMyAlerts,
  createPriceAlert,
  toggleAlert,
  deleteAlert,
  checkAllActivePrices,
  setupPriceCheckingCron
};