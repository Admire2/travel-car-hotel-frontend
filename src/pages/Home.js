import React from 'react';
import { Typography, Button, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function Home() {
  const { t } = useTranslation();
  return (
    <Box textAlign="center" mt={4}>
      <Typography variant="h3" gutterBottom>{t('Welcome')}</Typography>
      <Typography variant="h5" gutterBottom>{t('Book')}</Typography>
      <Box mt={3}>
        <Button variant="contained" color="primary" component={Link} to="/search" sx={{ mr: 2 }}>Start Search</Button>
        <Button variant="outlined" color="primary" component={Link} to="/results">View Results</Button>
      </Box>
    </Box>
  );
}

export default Home;
