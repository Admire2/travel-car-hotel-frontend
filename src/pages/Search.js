import React, { useState } from 'react';
import TravelSearchForm from '../components/TravelSearchForm';
import TravelResults from '../components/TravelResults';

function Search() {
  const [results, setResults] = useState(null);
  return (
    <div>
      <TravelSearchForm onResults={setResults} />
      <TravelResults results={results} />
    </div>
  );
}

export default Search;
