// components/Destination.jsx
import React from 'react';

// Constants
const DESCRIPTION_LENGTH = 90;
const PLACEHOLDER_IMAGE = '/placeholder-destination.jpg';

// Helper to truncate description
const truncateDescription = (description) => {
  const isLonger = description?.length > DESCRIPTION_LENGTH;
  return `${description?.substring(0, DESCRIPTION_LENGTH)}${isLonger ? '...' : ''}`;
};

export default function Destination({ place }) {
  const { name, image, description, rating = 0 } = place;

  return (
    <div className="destination-card">
      <img src={image || PLACEHOLDER_IMAGE} alt={name} />
      <div className="destination-info">
        <h4>{name}</h4>
        {rating > 0 && <div className="rating">★ {rating.toFixed(1)}</div>}
        <p>{truncateDescription(description)}</p>
      </div>
    </div>
  );
}