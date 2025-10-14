'use client';

import React from 'react';

interface AuthLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function AuthLoading({ 
  message = "Loading...", 
  fullScreen = true 
}: AuthLoadingProps) {
  const containerClass = fullScreen 
    ? "min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4"
    : "flex items-center justify-center p-4";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

export default AuthLoading;
