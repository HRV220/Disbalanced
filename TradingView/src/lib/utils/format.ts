/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(
  value: number,
  decimals: number = 2,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a large number with abbreviations (K, M, B)
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

/**
 * Format a crypto price with appropriate decimals
 */
export function formatCryptoPrice(price: number): string {
  if (price >= 1000) {
    return formatNumber(price, 2);
  }
  if (price >= 1) {
    return formatNumber(price, 4);
  }
  if (price >= 0.0001) {
    return formatNumber(price, 6);
  }
  return formatNumber(price, 8);
}

/**
 * Format percentage change
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format a date
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  locale: string = "ru-RU"
): string {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
}

/**
 * Format time
 */
export function formatTime(
  date: Date | string | number,
  locale: string = "ru-RU"
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Format datetime
 */
export function formatDateTime(
  date: Date | string | number,
  locale: string = "ru-RU"
): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "только что";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} мин. назад`;
  }
  if (diffHours < 24) {
    return `${diffHours} ч. назад`;
  }
  if (diffDays < 7) {
    return `${diffDays} дн. назад`;
  }
  return formatDate(target);
}
