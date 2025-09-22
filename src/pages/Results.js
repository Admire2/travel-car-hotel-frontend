import React from 'react';
import TravelResults from '../components/TravelResults';

function Results() {
  // This page can be used to display results from search, or redirect from search page
  // For now, just show a placeholder
  return (
    <div>
      <h2>Results Page</h2>
      <TravelResults results={null} />
    </div>
  );
}

export default Results;
