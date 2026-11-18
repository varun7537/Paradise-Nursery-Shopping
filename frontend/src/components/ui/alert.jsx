// src/components/ui/alert.js

import React from 'react';

export const Alert = ({ children, variant, className }) => {
  const variants = {
    destructive: 'bg-red-500 text-white',
    success: 'bg-green-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div className={`${variants[variant] || 'bg-gray-200'} ${className} p-4 rounded-md`}>
      {children}
    </div>
  );
};

export const AlertDescription = ({ children }) => (
  <p className="text-sm">{children}</p>
);
