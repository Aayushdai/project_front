// components/SearchBar.jsx
import React, { useState } from 'react';

const PLACEHOLDER = "Search places, cities, attractions...";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={PLACEHOLDER}
        aria-label="Search destinations"
      />
      <button type="submit">Search</button>
    </form>
  );
}