// components/shared/LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
};

export default LoadingSpinner;
