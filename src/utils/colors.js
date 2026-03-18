import { ROLE_COLORS } from '../constants/prompt';

export const getTextColor = (hex) => {
  if (!hex) return '#ffffff';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 160 ? '#1e293b' : '#ffffff';
};

export const getRoleName = (color) => ROLE_COLORS[color] || 'Other';
