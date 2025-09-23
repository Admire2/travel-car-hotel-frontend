const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');

router.post('/', async (req, res) => {
  const { to, subject, text } = req.body;
  const success = await notificationService.sendNotification(to, subject, text);
  if (success) {
    res.json({ message: 'Notification sent' });
  } else {
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

module.exports = router;
