export const ACTIVITY_TYPES = [
  { value: 'SIGHTSEEING', label: 'Sightseeing', icon: '🏛️', color: 'blue' },
  { value: 'FOOD', label: 'Food & Dining', icon: '🍽️', color: 'orange' },
  { value: 'ADVENTURE', label: 'Adventure', icon: '🏔️', color: 'green' },
  { value: 'CULTURAL', label: 'Cultural', icon: '🎭', color: 'purple' },
  { value: 'SHOPPING', label: 'Shopping', icon: '🛍️', color: 'pink' },
  { value: 'RELAXATION', label: 'Relaxation', icon: '🏖️', color: 'teal' },
  { value: 'TRANSPORT', label: 'Transport', icon: '🚗', color: 'gray' },
  { value: 'NIGHTLIFE', label: 'Nightlife', icon: '🌃', color: 'indigo' },
];

export const BOOKING_TYPES = {
  FLIGHT: 'FLIGHT',
  ACCOMMODATION: 'ACCOMMODATION',
  ACTIVITY: 'ACTIVITY',
  TRANSPORT: 'TRANSPORT',
};

export const PERMISSION_LEVELS = {
  VIEW: 'VIEW',
  EDIT: 'EDIT',
  ADMIN: 'ADMIN',
};

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

export const NOTIFICATION_TYPES = {
  TRIP_INVITE: 'TRIP_INVITE',
  BOOKING_CONFIRMATION: 'BOOKING_CONFIRMATION',
  PAYMENT_REMINDER: 'PAYMENT_REMINDER',
  WEATHER_ALERT: 'WEATHER_ALERT',
  GROUP_ACTIVITY: 'GROUP_ACTIVITY',
};

export const BUDGET_CATEGORIES = [
  { value: 'FLIGHT', label: 'Flights', icon: '✈️' },
  { value: 'ACCOMMODATION', label: 'Accommodation', icon: '🏨' },
  { value: 'FOOD', label: 'Food & Dining', icon: '🍽️' },
  { value: 'TRANSPORT', label: 'Transportation', icon: '🚗' },
  { value: 'ACTIVITIES', label: 'Activities', icon: '🎯' },
  { value: 'SHOPPING', label: 'Shopping', icon: '🛍️' },
  { value: 'OTHER', label: 'Other', icon: '📦' },
];