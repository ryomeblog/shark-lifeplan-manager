const format = {
  formatCurrency: (amount, showUnit = true) => {
    const formatted = Math.round(amount).toLocaleString('ja-JP');
    return showUnit ? `${formatted}円` : formatted;
  },

  formatPercentage: (value, decimals = 1) => {
    const percentage = (value * 100).toFixed(decimals);
    return `${percentage}%`;
  },

  formatDate: (date, format = 'medium') => {
    const d = new Date(date);
    switch (format) {
      case 'short':
        return d.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      case 'long':
        return d.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        });
      case 'medium':
      default:
        return d.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
    }
  },

  calculateAge: (birthDate, baseDate = new Date()) => {
    const birth = new Date(birthDate);
    const base = new Date(baseDate);
    let age = base.getFullYear() - birth.getFullYear();
    const monthDiff = base.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && base.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  },

  calculateYearsBetween: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return diffTime / (1000 * 60 * 60 * 24 * 365.25);
  },

  truncateText: (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + '...';
  },

  adjustColorBrightness: (color, amount) => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    let r = (num >> 16) + amount * 255;
    let g = ((num >> 8) & 0x00ff) + amount * 255;
    let b = (num & 0x0000ff) + amount * 255;
    r = Math.min(255, Math.max(0, Math.round(r)));
    g = Math.min(255, Math.max(0, Math.round(g)));
    b = Math.min(255, Math.max(0, Math.round(b)));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  },

  clamp: (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  },
};

export const { formatCurrency, formatPercentage, formatDate } = format;
export default format;
