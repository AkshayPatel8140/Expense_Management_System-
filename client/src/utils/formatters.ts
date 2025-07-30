// Currency formatting
export const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback if currency is not supported
    return `$${amount.toFixed(2)}`;
  }
};

// Compact currency formatting for large numbers
export const formatCompactCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string => {
  try {
    if (Math.abs(amount) >= 1000000) {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        notation: 'compact',
        maximumFractionDigits: 1,
      }).format(amount);
    }
    return formatCurrency(amount, currency, locale);
  } catch (error) {
    // Fallback for large numbers
    if (Math.abs(amount) >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (Math.abs(amount) >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(2)}`;
  }
};

// Number formatting
export const formatNumber = (value: number, decimals = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Percentage formatting
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Date formatting
export const formatDate = (date: string | Date, format = 'MMM dd, yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      case 'medium':
        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      case 'long':
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'relative':
        return formatRelativeDate(dateObj);
      default:
        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
    }
  } catch (error) {
    return 'Invalid Date';
  }
};

// Relative date formatting (e.g., "2 days ago", "in 3 weeks")
export const formatRelativeDate = (date: Date): string => {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours === 0) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      if (diffInMinutes === 0) {
        return 'just now';
      }
      return diffInMinutes > 0 ? `in ${diffInMinutes} minutes` : `${Math.abs(diffInMinutes)} minutes ago`;
    }
    return diffInHours > 0 ? `in ${diffInHours} hours` : `${Math.abs(diffInHours)} hours ago`;
  }
  
  if (Math.abs(diffInDays) === 1) {
    return diffInDays > 0 ? 'tomorrow' : 'yesterday';
  }
  
  if (Math.abs(diffInDays) < 7) {
    return diffInDays > 0 ? `in ${diffInDays} days` : `${Math.abs(diffInDays)} days ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (Math.abs(diffInWeeks) < 4) {
    return diffInWeeks > 0 ? `in ${diffInWeeks} weeks` : `${Math.abs(diffInWeeks)} weeks ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (Math.abs(diffInMonths) < 12) {
    return diffInMonths > 0 ? `in ${diffInMonths} months` : `${Math.abs(diffInMonths)} months ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return diffInYears > 0 ? `in ${diffInYears} years` : `${Math.abs(diffInYears)} years ago`;
};

// Time formatting
export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Duration formatting (e.g., "2h 30m", "1d 5h")
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Account number formatting (mask sensitive information)
export const formatAccountNumber = (accountNumber: string, maskLength = 4): string => {
  if (accountNumber.length <= maskLength) {
    return accountNumber;
  }
  
  const masked = '*'.repeat(accountNumber.length - maskLength);
  const visible = accountNumber.slice(-maskLength);
  
  return masked + visible;
};

// Phone number formatting
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phoneNumber; // Return original if format is not recognized
};

// Social Security Number formatting
export const formatSSN = (ssn: string, mask = true): string => {
  const cleaned = ssn.replace(/\D/g, '');
  
  if (cleaned.length !== 9) {
    return ssn; // Return original if not valid length
  }
  
  if (mask) {
    return `***-**-${cleaned.slice(5)}`;
  }
  
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
};

// Credit card number formatting
export const formatCreditCard = (cardNumber: string, mask = true): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (mask && cleaned.length >= 4) {
    const masked = '*'.repeat(cleaned.length - 4);
    const visible = cleaned.slice(-4);
    return `${masked.replace(/(.{4})/g, '$1 ').trim()} ${visible}`;
  }
  
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

// Transaction status formatting
export const formatTransactionStatus = (status: string): { label: string; color: string } => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'cleared':
      return { label: 'Completed', color: 'success' };
    case 'pending':
      return { label: 'Pending', color: 'warning' };
    case 'failed':
    case 'cancelled':
      return { label: 'Failed', color: 'error' };
    case 'processing':
      return { label: 'Processing', color: 'info' };
    default:
      return { label: status, color: 'default' };
  }
};

// Budget status formatting
export const formatBudgetStatus = (percentage: number): { label: string; color: string } => {
  if (percentage <= 50) {
    return { label: 'On Track', color: 'success' };
  } else if (percentage <= 80) {
    return { label: 'Caution', color: 'warning' };
  } else if (percentage <= 100) {
    return { label: 'Near Limit', color: 'error' };
  } else {
    return { label: 'Over Budget', color: 'error' };
  }
};

// Goal progress formatting
export const formatGoalProgress = (current: number, target: number): { percentage: number; label: string; color: string } => {
  const percentage = (current / target) * 100;
  
  if (percentage >= 100) {
    return { percentage: 100, label: 'Completed', color: 'success' };
  } else if (percentage >= 75) {
    return { percentage, label: 'Almost There', color: 'info' };
  } else if (percentage >= 50) {
    return { percentage, label: 'In Progress', color: 'warning' };
  } else if (percentage >= 25) {
    return { percentage, label: 'Getting Started', color: 'primary' };
  } else {
    return { percentage, label: 'Just Started', color: 'default' };
  }
};

// Investment return formatting
export const formatReturn = (value: number, isPercentage = true): { value: string; color: string; trend: 'up' | 'down' | 'neutral' } => {
  const formattedValue = isPercentage ? formatPercentage(value) : formatCurrency(value);
  
  if (value > 0) {
    return { value: `+${formattedValue}`, color: 'success', trend: 'up' };
  } else if (value < 0) {
    return { value: formattedValue, color: 'error', trend: 'down' };
  } else {
    return { value: formattedValue, color: 'text.secondary', trend: 'neutral' };
  }
};

// Capitalize first letter of each word
export const capitalizeWords = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export default {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatRelativeDate,
  formatTime,
  formatDuration,
  formatFileSize,
  formatAccountNumber,
  formatPhoneNumber,
  formatSSN,
  formatCreditCard,
  formatTransactionStatus,
  formatBudgetStatus,
  formatGoalProgress,
  formatReturn,
  capitalizeWords,
  truncateText,
};