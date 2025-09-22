import React, { useState } from 'react';
import { Stepper, Step, StepLabel, Button, Box, Typography, TextField, Paper } from '@mui/material';

const steps = ['Personal Info', 'Payment', 'Confirmation'];

function Booking() {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', card: '' });

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Booking</Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>
      {activeStep === 0 && (
        <Box>
          <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} fullWidth margin="normal" />
          <TextField label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} fullWidth margin="normal" />
          <Box mt={2}><Button variant="contained" onClick={handleNext}>Next</Button></Box>
        </Box>
      )}
      {activeStep === 1 && (
        <Box>
          <TextField label="Card Number" value={form.card} onChange={e => setForm({ ...form, card: e.target.value })} fullWidth margin="normal" />
          <Box mt={2}>
            <Button onClick={handleBack} sx={{ mr: 2 }}>Back</Button>
            <Button variant="contained" onClick={handleNext}>Next</Button>
          </Box>
        </Box>
      )}
      {activeStep === 2 && (
        <Box textAlign="center">
          <Typography variant="h5" gutterBottom>Booking Confirmed!</Typography>
          <Typography>Your booking is complete. Thank you!</Typography>
        </Box>
      )}
    </Paper>
  );
}

export default Booking;
