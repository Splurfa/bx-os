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
    const date = new Date(dateOfBirth);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const mmdd = `${month}${day}`;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[date.getMonth()];
    const dayWithSuffix = getDayWithSuffix(date.getDate());

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