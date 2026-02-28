package com.travelplanner.backend.controller;

import com.travelplanner.backend.dto.request.BudgetRequest;
import com.travelplanner.backend.dto.request.ExpenseRequest;
import com.travelplanner.backend.dto.response.*;
import com.travelplanner.backend.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    // ============== BUDGET ENDPOINTS ==============

    @PostMapping("/trip/{tripId}")
    public ResponseEntity<?> createOrUpdateBudget(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId,
            @Valid @RequestBody BudgetRequest request) {
        try {
            BudgetResponse response = budgetService.createOrUpdateBudget(
                    userDetails.getUsername(), tripId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<?> getBudget(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId) {
        try {
            BudgetResponse response = budgetService.getBudget(tripId, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @DeleteMapping("/trip/{tripId}")
    public ResponseEntity<?> deleteBudget(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId) {
        try {
            budgetService.deleteBudget(tripId, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Budget deleted successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== EXPENSE ENDPOINTS ==============

    @PostMapping("/trip/{tripId}/expenses")
    public ResponseEntity<?> addExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId,
            @Valid @RequestBody ExpenseRequest request) {
        try {
            ExpenseResponse response = budgetService.addExpense(
                    userDetails.getUsername(), tripId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/trip/{tripId}/expenses")
    public ResponseEntity<?> getTripExpenses(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId) {
        try {
            List<ExpenseResponse> expenses = budgetService.getTripExpenses(tripId, userDetails.getUsername());
            return ResponseEntity.ok(expenses);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/expenses/{expenseId}")
    public ResponseEntity<?> getExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long expenseId) {
        try {
            ExpenseResponse response = budgetService.getExpense(expenseId, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @PutMapping("/expenses/{expenseId}")
    public ResponseEntity<?> updateExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long expenseId,
            @Valid @RequestBody ExpenseRequest request) {
        try {
            ExpenseResponse response = budgetService.updateExpense(
                    userDetails.getUsername(), expenseId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    @DeleteMapping("/expenses/{expenseId}")
    public ResponseEntity<?> deleteExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long expenseId) {
        try {
            budgetService.deleteExpense(userDetails.getUsername(), expenseId);
            return ResponseEntity.ok(new MessageResponse("Expense deleted successfully", true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== SUMMARY ENDPOINTS ==============

    @GetMapping("/trip/{tripId}/summary")
    public ResponseEntity<?> getBudgetSummary(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId) {
        try {
            BudgetSummaryResponse response = budgetService.getBudgetSummary(tripId, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }

    // ============== BOOKING TO EXPENSE ENDPOINTS ==============

    @PostMapping("/trip/{tripId}/bookings/{bookingId}/convert")
    public ResponseEntity<?> convertBookingToExpense(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long tripId,
            @PathVariable Long bookingId) {
        try {
            ExpenseResponse response = budgetService.createExpenseFromBooking(
                    userDetails.getUsername(), tripId, bookingId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage(), false));
        }
    }
}