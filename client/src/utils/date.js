// Normalize SQLite datetime string to proper ISO 8601 for consistent browser parsing
// SQLite stores "2026-03-25 13:20:40" — replace space with T so all browsers parse it correctly
export const parseDate = (str) => new Date(str ? str.replace(' ', 'T') + 'Z' : str);

export const formatDate = (str) => parseDate(str).toLocaleDateString();
export const formatDateTime = (str) => parseDate(str).toLocaleString();
export const formatTime = (str) => parseDate(str).toLocaleTimeString();
