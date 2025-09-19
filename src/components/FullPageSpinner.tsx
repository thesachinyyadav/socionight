import React from 'react';
import './FullPageSpinner.css';

interface FullPageSpinnerProps {
  message?: string;
}

const FullPageSpinner: React.FC<FullPageSpinnerProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="full-page-spinner-overlay">
      <div className="full-page-spinner-content">
        <div className="spinner-large"></div>
        <p className="spinner-message">{message}</p>
      </div>
    </div>
  );
};

export default FullPageSpinner;