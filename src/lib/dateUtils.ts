/**
 * Utility functions for date formatting in the kiosk system
 */

export const formatBirthdateForPassword = (dateOfBirth: string | null): { 
  placeholder: string; 
  helperText: string; 
  errorExample: string 
} => {
  if (!dateOfBirth) {
    // Fallback to generic placeholder if no date available
    return {
      placeholder: "MMDD (e.g., 0315)",
      helperText: "Example: March 15th = 0315",
      errorExample: "0315 for March 15th"
    };
  }

  try {
    // Parse date string manually to avoid timezone conversion issues
    // dateOfBirth format: "2012-12-12"
    const dateParts = dateOfBirth.split('-');
    if (dateParts.length !== 3) {
      throw new Error('Invalid date format');
    }
    
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const day = parseInt(dateParts[2]);
    
    // Validate the parsed values
    if (isNaN(year) || isNaN(month) || isNaN(day) || 
        month < 1 || month > 12 || day < 1 || day > 31) {
      throw new Error('Invalid date values');
    }

    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const mmdd = `${monthStr}${dayStr}`;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[month - 1]; // month is 1-indexed, array is 0-indexed
    const dayWithSuffix = getDayWithSuffix(day);

    return {
      placeholder: `MMDD (e.g., ${mmdd})`,
      helperText: `Example: ${monthName} ${dayWithSuffix} = ${mmdd}`,
      errorExample: `${mmdd} for ${monthName} ${dayWithSuffix}`
    };
  } catch (error) {
    // Fallback to generic placeholder if date parsing fails
    return {
      placeholder: "MMDD (e.g., 0315)",
      helperText: "Example: March 15th = 0315",
      errorExample: "0315 for March 15th"
    };
  }
};

const getDayWithSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) {
    return `${day}th`;
  }
  switch (day % 10) {
    case 1: return `${day}st`;
    case 2: return `${day}nd`;
    case 3: return `${day}rd`;
    default: return `${day}th`;
  }
};