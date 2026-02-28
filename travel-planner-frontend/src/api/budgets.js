import apiClient from './client';

const budgetsAPI = {
  // Create or update budget for trip
  createBudget: (tripId, budgetData) => 
    apiClient.post(`/budgets/trip/${tripId}`, budgetData),

  updateBudget: (tripId, budgetData) => 
    apiClient.put(`/budgets/trip/${tripId}`, budgetData),

  // Get budget for trip
  getBudget: (tripId) => 
    apiClient.get(`/budgets/trip/${tripId}`),

  // Delete budget
  deleteBudget: (tripId) => 
    apiClient.delete(`/budgets/trip/${tripId}`),

  // Add expense to trip
  addExpense: (tripId, expenseData) => 
    apiClient.post(`/budgets/trip/${tripId}/expenses`, expenseData),

  // Get all expenses for trip
  getExpenses: (tripId) => 
    apiClient.get(`/budgets/trip/${tripId}/expenses`),

  // Get single expense
  getExpense: (expenseId) => 
    apiClient.get(`/budgets/expenses/${expenseId}`),

  // Update expense
  updateExpense: (expenseId, expenseData) => 
    apiClient.put(`/budgets/expenses/${expenseId}`, expenseData),

  // Delete expense
  deleteExpense: (expenseId) => 
    apiClient.delete(`/budgets/expenses/${expenseId}`),

  // Get budget summary
  getBudgetSummary: (tripId) => 
    apiClient.get(`/budgets/trip/${tripId}/summary`),

  // Convert booking to expense
  convertBookingToExpense: (tripId, bookingId) => 
    apiClient.post(`/budgets/trip/${tripId}/bookings/${bookingId}/convert`),
};

export default budgetsAPI;