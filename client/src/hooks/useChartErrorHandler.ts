import React, { useCallback } from 'react';

/**
 * Custom hook to handle chart rendering errors
 * This helps prevent the entire app from crashing due to chart issues
 */
export const useChartErrorHandler = () => {
  const handleChartError = useCallback((error: Error, errorInfo?: any) => {
    console.error('Chart Error:', error);
    console.error('Error Info:', errorInfo);
    
    // Log to analytics or monitoring service if available
    if (process.env.NODE_ENV === 'production') {
      // In production, you might want to send this to an error tracking service
      // like Sentry, LogRocket, etc.
      console.warn('Chart error occurred in production environment');
    }
  }, []);

  const validateChartData = useCallback((data: any[] | undefined | null): boolean => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return false;
    }
    
    // Check if all items are valid objects with at least one numeric property
    return data.every(item => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return false;
      }
      
      // Check if item has at least one numeric property
      return Object.values(item).some(value => 
        typeof value === 'number' && !isNaN(value) && isFinite(value)
      );
    });
  }, []);

  const safeChartRender = useCallback((renderFn: () => React.ReactNode, fallback?: React.ReactNode) => {
    try {
      return renderFn();
    } catch (error) {
      handleChartError(error as Error);
      return (
        fallback ||
        React.createElement(
          'div',
          { className: 'flex items-center justify-center bg-gray-50 rounded-lg p-4' },
          React.createElement(
            'p',
            { className: 'text-gray-500' },
            'Chart could not be displayed'
          )
        )
      );
    }
  }, [handleChartError]);

  return {
    handleChartError,
    validateChartData,
    safeChartRender
  };
};
