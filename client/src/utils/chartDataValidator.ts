/**
 * Utility functions to validate chart data before rendering
 * This helps prevent Recharts errors like "Cannot read properties of undefined (reading 'scale')"
 */

export interface ChartDataItem {
  [key: string]: any;
}

/**
 * Validates if data array is safe to use with Recharts
 */
export const isValidChartData = (data: any[] | undefined | null): boolean => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return false;
  }
  
  // Check if all items are valid objects
  return data.every(item => 
    item && 
    typeof item === 'object' && 
    !Array.isArray(item) &&
    Object.keys(item).length > 0
  );
};

/**
 * Validates if data array contains valid numeric values for a specific key
 */
export const hasValidNumericData = (data: any[] | undefined | null, dataKey: string): boolean => {
  if (!isValidChartData(data)) {
    return false;
  }
  
  return data.every(item => {
    const value = item[dataKey];
    return value !== undefined && 
           value !== null && 
           typeof value === 'number' && 
           !isNaN(value) && 
           isFinite(value);
  });
};

/**
 * Safely filters data to only include valid numeric values for a specific key
 */
export const filterValidNumericData = (data: any[] | undefined | null, dataKey: string): any[] => {
  if (!isValidChartData(data)) {
    return [];
  }
  
  return data.filter(item => {
    const value = item[dataKey];
    return value !== undefined && 
           value !== null && 
           typeof value === 'number' && 
           !isNaN(value) && 
           isFinite(value);
  });
};

/**
 * Validates if data is safe for Area charts specifically
 */
export const isValidAreaChartData = (data: any[] | undefined | null, dataKey: string): boolean => {
  return hasValidNumericData(data, dataKey) && data!.length >= 2;
};

/**
 * Validates if data is safe for Line charts specifically
 */
export const isValidLineChartData = (data: any[] | undefined | null, dataKey: string): boolean => {
  return hasValidNumericData(data, dataKey) && data!.length >= 2;
};

/**
 * Validates if data is safe for Bar charts specifically
 */
export const isValidBarChartData = (data: any[] | undefined | null, dataKey: string): boolean => {
  return hasValidNumericData(data, dataKey);
};

/**
 * Validates if data is safe for Pie charts specifically
 */
export const isValidPieChartData = (data: any[] | undefined | null, dataKey: string): boolean => {
  return hasValidNumericData(data, dataKey);
};

/**
 * Creates a safe fallback data array when validation fails
 */
export const createSafeFallbackData = (dataKey: string, fallbackValue: number = 0): any[] => {
  return [{ [dataKey]: fallbackValue }];
};

/**
 * Wraps chart rendering with validation and fallback
 */
export const withChartValidation = <T extends ChartDataItem>(
  data: T[] | undefined | null,
  dataKey: string,
  validator: (data: T[] | undefined | null, dataKey: string) => boolean,
  fallbackValue: number = 0
): { isValid: boolean; safeData: T[] } => {
  const isValid = validator(data, dataKey);
  
  if (isValid) {
    return { isValid: true, safeData: data! };
  }
  
  return { 
    isValid: false, 
    safeData: createSafeFallbackData(dataKey, fallbackValue) as T[] 
  };
};
