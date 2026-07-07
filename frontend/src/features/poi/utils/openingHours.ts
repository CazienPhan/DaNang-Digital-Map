export const translateDay = (day: string): string => {
  const dayLower = day.toLowerCase();
  switch (dayLower) {
    case 'monday': return 'Thứ hai';
    case 'tuesday': return 'Thứ ba';
    case 'wednesday': return 'Thứ tư';
    case 'thursday': return 'Thứ năm';
    case 'friday': return 'Thứ sáu';
    case 'saturday': return 'Thứ bảy';
    case 'sunday': return 'Chủ nhật';
    default: return day.charAt(0).toUpperCase() + day.slice(1);
  }
};

export const translateTimeValue = (value: string): string => {
  if (!value) return '';
  const valLower = value.toLowerCase().trim();
  if (valLower === 'open' || valLower === 'open hours' || valLower === 'đang mở cửa') return 'Đang mở cửa';
  if (valLower === 'closed' || valLower === 'đã đóng cửa') return 'Đã đóng cửa';
  if (valLower === '24/7' || valLower === 'open 24 hours' || valLower === 'open 24/7' || valLower === 'mở cửa 24/7') return 'Mở cửa 24/7';
  return value;
};

export const getOpenClosedStatus = (hours: Record<string, string> | null): { isOpen: boolean; label: string; color: string } | null => {
  if (!hours || typeof hours !== 'object' || Array.isArray(hours) || Object.keys(hours).length === 0) return null;

  // 1. Check if it is open 24/7
  const values = Object.values(hours);
  const is247 = values.length > 0 && values.every(val => {
    const v = val.toLowerCase().trim();
    return v === '24/7' || v === 'open 24 hours' || v === 'open 24/7' || v === 'mở cửa 24/7';
  });

  if (is247) {
    return { isOpen: true, label: '● Mở cửa 24/7', color: '#10b981' };
  }

  // 2. Get current day and time
  const now = new Date();
  const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = daysMap[now.getDay()];
  
  // Find key in hours (case-insensitive)
  const hourKey = Object.keys(hours).find(k => k.toLowerCase() === currentDay);
  if (!hourKey) {
    return { isOpen: false, label: '● Đã đóng cửa', color: '#ef4444' };
  }

  const timeRange = hours[hourKey].trim();
  const timeRangeLower = timeRange.toLowerCase();

  if (timeRangeLower === 'closed' || timeRangeLower === 'đã đóng cửa') {
    return { isOpen: false, label: '● Đã đóng cửa', color: '#ef4444' };
  }

  if (timeRangeLower === '24/7' || timeRangeLower === 'open 24 hours' || timeRangeLower === 'open 24/7' || timeRangeLower === 'mở cửa 24/7') {
    return { isOpen: true, label: '● Đang mở cửa', color: '#10b981' };
  }

  // Parse time range: e.g. "08:00 - 22:00" or "08:00 AM - 10:00 PM"
  const parseTimeToMinutes = (timeStr: string): number | null => {
    const cleaned = timeStr.trim().toUpperCase();
    
    // Check for AM/PM formats
    const isPM = cleaned.endsWith('PM');
    const isAM = cleaned.endsWith('AM');
    
    let timePart = cleaned;
    if (isPM || isAM) {
      timePart = cleaned.slice(0, -2).trim();
    }
    
    const parts = timePart.split(':');
    if (parts.length < 2) return null;
    
    let hr = parseInt(parts[0], 10);
    const min = parseInt(parts[1], 10);
    
    if (isNaN(hr) || isNaN(min)) return null;
    
    if (isPM && hr < 12) {
      hr += 12;
    } else if (isAM && hr === 12) {
      hr = 0;
    }
    
    return hr * 60 + min;
  };

  // Split range by '-' or 'to'
  const separators = ['-', 'to', '–'];
  let separator = '';
  for (const sep of separators) {
    if (timeRange.includes(sep)) {
      separator = sep;
      break;
    }
  }

  if (!separator) {
    return { isOpen: true, label: '● Đang mở cửa', color: '#10b981' };
  }

  const parts = timeRange.split(separator);
  if (parts.length < 2) {
    return { isOpen: true, label: '● Đang mở cửa', color: '#10b981' };
  }

  const startMinutes = parseTimeToMinutes(parts[0]);
  const endMinutes = parseTimeToMinutes(parts[1]);

  if (startMinutes === null || endMinutes === null) {
    return { isOpen: true, label: '● Đang mở cửa', color: '#10b981' };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let isOpen = false;
  if (startMinutes <= endMinutes) {
    isOpen = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    isOpen = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }

  return {
    isOpen,
    label: isOpen ? '● Đang mở cửa' : '● Đã đóng cửa',
    color: isOpen ? '#10b981' : '#ef4444',
  };
};
