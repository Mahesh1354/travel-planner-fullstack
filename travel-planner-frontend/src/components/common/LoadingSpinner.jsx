import React from 'react';

export const LoadingSpinner = ({ 
  size = 'md', 
  fullScreen = false, 
  text = '', 
  variant = 'primary',
  overlay = false 
}) => {
  const sizes = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const variants = {
    primary: {
      border: 'border-primary-200',
      top: 'border-t-primary-600',
    },
    white: {
      border: 'border-white/30',
      top: 'border-t-white',
    },
    gray: {
      border: 'border-gray-200',
      top: 'border-t-gray-600',
    },
    success: {
      border: 'border-green-200',
      top: 'border-t-green-600',
    },
    error: {
      border: 'border-red-200',
      top: 'border-t-red-600',
    },
  };

  const spinnerSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      {/* Spinner with pulse animation */}
      <div className="relative">
        <div
          className={`${sizes[size]} animate-spin rounded-full border-4 ${variants[variant].border} ${variants[variant].top}`}
          role="status"
          aria-label={text || "Loading"}
        />
        {/* Optional inner dot for larger spinners */}
        {size === 'xl' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 bg-primary-600 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
      
      {/* Text with animation */}
      {text && (
        <div className={`mt-3 ${spinnerSizes[size]} text-gray-600 dark:text-gray-400 animate-pulse`}>
          {text}
          <span className="inline-flex ml-1">
            <span className="animate-bounce delay-0">.</span>
            <span className="animate-bounce delay-150">.</span>
            <span className="animate-bounce delay-300">.</span>
          </span>
        </div>
      )}
    </div>
  );

  // Overlay mode (semi-transparent background)
  if (overlay) {
    return (
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-40">
        {spinner}
      </div>
    );
  }

  // Full screen mode
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 bg-opacity-90 dark:bg-opacity-90 backdrop-blur-md flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Pre-configured spinners for common use cases
LoadingSpinner.Page = () => <LoadingSpinner fullScreen text="Loading page" />;
LoadingSpinner.Section = () => <LoadingSpinner overlay text="Loading content" />;
LoadingSpinner.Button = () => <LoadingSpinner size="sm" variant="white" />;

export default LoadingSpinner;