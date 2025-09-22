import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import axios from 'axios';

function NotificationForm() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/notify', { to, subject, text });
      setTo('');
      setSubject('');
      setText('');
      alert('Notification sent!');
    } catch (err) {
      alert('Failed to send notification: ' + (err.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Send Notification</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Recipient Email" value={to} onChange={e => setTo(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Subject" value={subject} onChange={e => setSubject(e.target.value)} fullWidth margin="normal" required />
        <TextField label="Message" value={text} onChange={e => setText(e.target.value)} fullWidth margin="normal" multiline rows={3} required />
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary" disabled={loading || !to || !subject || !text}>Send</Button>
        </Box>
      </form>
    </Paper>
  );
}

export default NotificationForm;
