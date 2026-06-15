import React from 'react';

const LoadingState = ({ loading, error, isEmpty, emptyMessage, children }) => {
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (isEmpty) {
    return <p>{emptyMessage || 'No data available'}</p>;
  }

  return children;
};

export default LoadingState;
