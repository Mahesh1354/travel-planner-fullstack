import { format, differenceInDays, addDays, parseISO } from "date-fns";

export const formatDate = (date, formatStr = "MMM dd, yyyy") => {
  if (!date) return "";
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    return "";
  }
};

export const formatDateTime = (date, time) => {
  if (!date || !time) return "";
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const [hours, minutes] = time.split(":");
    dateObj.setHours(parseInt(hours), parseInt(minutes));
    return format(dateObj, "MMM dd, yyyy hh:mm a");
  } catch (error) {
    return "";
  }
};

export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  try {
    const start =
      typeof startDate === "string" ? parseISO(startDate) : startDate;
    const end = typeof endDate === "string" ? parseISO(endDate) : endDate;
    return differenceInDays(end, start) + 1;
  } catch (error) {
    return 0;
  }
};

export const generateDays = (startDate, endDate) => {
  const days = [];
  const duration = calculateDuration(startDate, endDate);

  for (let i = 0; i < duration; i++) {
    const date = addDays(
      typeof startDate === "string" ? parseISO(startDate) : startDate,
      i,
    );
    days.push({
      day: i + 1,
      date,
      dateStr: format(date, "yyyy-MM-dd"),
    });
  }

  return days;
};

export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase();
};

export const formatCurrency = (amount, currency = "USD") => {
  if (!amount && amount !== 0) return "";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

export const calculateTotalBudget = (expenses) => {
  return expenses.reduce((total, expense) => {
    return total + (expense.actualAmount || expense.estimatedAmount || 0);
  }, 0);
};

export const getStatusColor = (status) => {
  const colors = {
    PLANNING: "bg-yellow-100 text-yellow-800",
    UPCOMING: "bg-blue-100 text-blue-800",
    ONGOING: "bg-green-100 text-green-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export const getActivityTypeColor = (type) => {
  const colors = {
    SIGHTSEEING: "bg-blue-100 text-blue-800",
    FOOD: "bg-orange-100 text-orange-800",
    ADVENTURE: "bg-green-100 text-green-800",
    CULTURAL: "bg-purple-100 text-purple-800",
    SHOPPING: "bg-pink-100 text-pink-800",
    RELAXATION: "bg-teal-100 text-teal-800",
    TRANSPORT: "bg-gray-100 text-gray-800",
    NIGHTLIFE: "bg-indigo-100 text-indigo-800",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
};

// Add to your existing helpers.js
export const calculateNights = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;

  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

// Add to your existing helpers.js
export const calculateProgress = (completed, total) => {
  if (!total || total === 0) return 0;
  return Math.min(Math.round((completed / total) * 100), 100);
};

export const getTimeRemaining = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) {
    const daysUntil = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    return { type: 'upcoming', value: daysUntil, text: `${daysUntil} days until trip` };
  } else if (now > end) {
    const daysAgo = Math.ceil((now - end) / (1000 * 60 * 60 * 24));
    return { type: 'past', value: daysAgo, text: `${daysAgo} days ago` };
  } else {
    return { type: 'ongoing', text: 'Currently traveling' };
  }
};