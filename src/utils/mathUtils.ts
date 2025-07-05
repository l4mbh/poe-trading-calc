/**
 * Utility functions for precise mathematical calculations
 * Handles floating point precision issues
 */

/**
 * Rounds a number to specified decimal places with better precision
 * @param num - The number to round
 * @param decimals - Number of decimal places (default: 6)
 * @returns Rounded number
 */
export const preciseRound = (num: number, decimals: number = 6): number => {
  if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
    return 0;
  }
  
  // Use Number.parseFloat to handle string conversion issues
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

/**
 * Safely parses a string to number with precision handling
 * @param value - String value to parse
 * @param decimals - Number of decimal places to round to
 * @returns Parsed and rounded number
 */
export const safeParseFloat = (value: string, decimals: number = 6): number => {
  if (!value || value.trim() === '') {
    return 0;
  }
  
  // Replace comma with dot for European number format
  const cleanValue = value.replace(',', '.');
  const parsed = parseFloat(cleanValue);
  
  if (isNaN(parsed) || !isFinite(parsed)) {
    return 0;
  }
  
  return preciseRound(parsed, decimals);
};

/**
 * Evaluates a mathematical expression safely
 * @param expression - Mathematical expression as string
 * @param decimals - Number of decimal places to round to
 * @returns Evaluated result or 0 if invalid
 */
export const safeEvaluate = (expression: string, decimals: number = 6): number => {
  if (!expression || expression.trim() === '') {
    return 0;
  }
  
  try {
    // Clean the expression
    const cleanExpression = expression
      .replace(/,/g, '.')
      .replace(/÷/g, '/')
      .replace(/×/g, '*')
      .trim();
    
    // Check if it's a simple number
    if (!/[+\-*/()]/.test(cleanExpression)) {
      return safeParseFloat(cleanExpression, decimals);
    }
    
    // Evaluate the expression
    const result = new Function('return ' + cleanExpression)();
    
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return preciseRound(result, decimals);
    }
    
    return 0;
  } catch (error) {
    console.warn('Error evaluating expression:', expression, error);
    return 0;
  }
};

/**
 * Multiplies two numbers with precision handling
 * @param a - First number
 * @param b - Second number
 * @param decimals - Number of decimal places to round to
 * @returns Product with precise rounding
 */
export const preciseMultiply = (a: number, b: number, decimals: number = 6): number => {
  if (typeof a !== 'number' || typeof b !== 'number' || isNaN(a) || isNaN(b)) {
    return 0;
  }
  
  return preciseRound(a * b, decimals);
};

/**
 * Divides two numbers with precision handling
 * @param a - Dividend
 * @param b - Divisor
 * @param decimals - Number of decimal places to round to
 * @returns Quotient with precise rounding
 */
export const preciseDivide = (a: number, b: number, decimals: number = 6): number => {
  if (typeof a !== 'number' || typeof b !== 'number' || isNaN(a) || isNaN(b) || b === 0) {
    return 0;
  }
  
  return preciseRound(a / b, decimals);
}; 