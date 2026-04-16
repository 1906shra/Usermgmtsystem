import React from 'react';

const Spinner = ({ size = 'md', text = '' }) => {
  return (
    <div className={`spinner-wrapper spinner-${size}`}>
      <div className="spinner" role="status" aria-label="Loading"></div>
      {text && <span className="spinner-text">{text}</span>}
    </div>
  );
};

export default Spinner;
