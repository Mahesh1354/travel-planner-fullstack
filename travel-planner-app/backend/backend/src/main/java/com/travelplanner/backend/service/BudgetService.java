package com.travelplanner.backend.service;

import com.travelplanner.backend.dto.request.BudgetRequest;
import com.travelplanner.backend.dto.request.ExpenseRequest;
import com.travelplanner.backend.dto.response.BudgetResponse;
import com.travelplanner.backend.dto.response.BudgetSummaryResponse;
import com.travelplanner.backend.dto.response.ExpenseResponse;
import com.travelplanner.backend.entity.Expense;
import java.util.List;

public interface BudgetService {

    // Budget operations
    BudgetResponse createOrUpdateBudget(String userEmail, Long tripId, BudgetRequest request);

    BudgetResponse getBudget(Long tripId, String userEmail);

    void deleteBudget(Long tripId, String userEmail);

    // Expense operations
    ExpenseResponse addExpense(String userEmail, Long tripId, ExpenseRequest request);

    ExpenseResponse updateExpense(String userEmail, Long expenseId, ExpenseRequest request);

    void deleteExpense(String userEmail, Long expenseId);

    List<ExpenseResponse> getTripExpenses(Long tripId, String userEmail);

    ExpenseResponse getExpense(Long expenseId, String userEmail);

    // Summary operations
    BudgetSummaryResponse getBudgetSummary(Long tripId, String userEmail);

    // Auto-create expense from booking
    ExpenseResponse createExpenseFromBooking(String userEmail, Long tripId, Long bookingId);
}