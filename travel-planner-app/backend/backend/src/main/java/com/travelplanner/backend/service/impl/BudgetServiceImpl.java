package com.travelplanner.backend.service.impl;

import com.travelplanner.backend.dto.request.BudgetRequest;
import com.travelplanner.backend.dto.request.ExpenseRequest;
import com.travelplanner.backend.dto.response.*;
import com.travelplanner.backend.entity.*;
import com.travelplanner.backend.repository.*;
import com.travelplanner.backend.service.BudgetService;
import com.travelplanner.backend.service.TripService;
import com.travelplanner.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final TripService tripService;
    private final UserService userService;
    private final BookingRepository bookingRepository;
    private final TripCollaboratorRepository collaboratorRepository;


    @Override
    @Transactional
    public BudgetResponse createOrUpdateBudget(String userEmail, Long tripId, BudgetRequest request) {
        Trip trip = tripService.getTripEntity(tripId, userEmail);

        // Check if user has edit permission
        if (!hasEditPermission(trip, userEmail)) {
            throw new RuntimeException("You don't have permission to manage budget for this trip");
        }

        Budget budget = budgetRepository.findByTrip(trip)
                .orElse(new Budget());

        budget.setTrip(trip);
        budget.setTotalBudget(request.getTotalBudget());
        budget.setCurrency(request.getCurrency());
        budget.setNotes(request.getNotes());

        Budget savedBudget = budgetRepository.save(budget);
        return mapToBudgetResponse(savedBudget);
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetResponse getBudget(Long tripId, String userEmail) {
        Trip trip = tripService.getTripEntity(tripId, userEmail);

        Budget budget = budgetRepository.findByTrip(trip)
                .orElseThrow(() -> new RuntimeException("Budget not found for this trip"));

        return mapToBudgetResponse(budget);
    }

    @Override
    @Transactional
    public void deleteBudget(Long tripId, String userEmail) {
        Trip trip = tripService.getTripEntity(tripId, userEmail);

        // Only owner can delete budget
        if (!trip.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Only the trip owner can delete the budget");
        }

        budgetRepository.deleteByTripId(tripId);
    }

    @Override
    @Transactional
    public ExpenseResponse addExpense(String userEmail, Long tripId, ExpenseRequest request) {
        Trip trip = tripService.getTripEntity(tripId, userEmail);

        if (!hasEditPermission(trip, userEmail)) {
            throw new RuntimeException("You don't have permission to add expenses to this trip");
        }

        Expense expense = new Expense();
        expense.setTrip(trip);
        expense.setCategory(Expense.ExpenseCategory.valueOf(request.getCategory()));
        expense.setDescription(request.getDescription());
        expense.setEstimatedAmount(request.getEstimatedAmount());
        expense.setActualAmount(request.getActualAmount());
        expense.setCurrency(request.getCurrency());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setNotes(request.getNotes());

        // Set paid by user if provided
        if (request.getPaidByUserId() != null) {
            User paidBy = userService.getUserByEmail(userEmail); // For now, assume current user
            // In real implementation, you'd fetch by ID and verify they're a collaborator
            expense.setPaidBy(paidBy);
        }

        // Link to booking if provided
        if (request.getBookingId() != null) {
            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            expense.setBooking(booking);
        }

        Expense savedExpense = expenseRepository.save(expense);
        return mapToExpenseResponse(savedExpense);
    }

    @Override
    @Transactional
    public ExpenseResponse updateExpense(String userEmail, Long expenseId, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!hasEditPermission(expense.getTrip(), userEmail)) {
            throw new RuntimeException("You don't have permission to update this expense");
        }

        expense.setCategory(Expense.ExpenseCategory.valueOf(request.getCategory()));
        expense.setDescription(request.getDescription());
        expense.setEstimatedAmount(request.getEstimatedAmount());
        expense.setActualAmount(request.getActualAmount());
        expense.setCurrency(request.getCurrency());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setNotes(request.getNotes());

        Expense updatedExpense = expenseRepository.save(expense);
        return mapToExpenseResponse(updatedExpense);
    }

    @Override
    @Transactional
    public void deleteExpense(String userEmail, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!hasEditPermission(expense.getTrip(), userEmail)) {
            throw new RuntimeException("You don't have permission to delete this expense");
        }

        expenseRepository.delete(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getTripExpenses(Long tripId, String userEmail) {
        Trip trip = tripService.getTripEntity(tripId, userEmail);

        return expenseRepository.findByTripOrderByExpenseDateDesc(trip)
                .stream()
                .map(this::mapToExpenseResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseResponse getExpense(Long expenseId, String userEmail) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        // Verify access to trip
        tripService.getTripEntity(expense.getTrip().getId(), userEmail);

        return mapToExpenseResponse(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetSummaryResponse getBudgetSummary(Long tripId, String userEmail) {
        Trip trip = tripService.getTripEntity(tripId, userEmail);

        BudgetSummaryResponse summary = new BudgetSummaryResponse();
        summary.setTripId(tripId);
        summary.setTripTitle(trip.getTitle());

        // Get budget if exists
        Budget budget = budgetRepository.findByTrip(trip).orElse(null);
        if (budget != null) {
            summary.setTotalBudget(budget.getTotalBudget());
        } else {
            summary.setTotalBudget(BigDecimal.ZERO);
        }

        // Calculate totals
        BigDecimal totalEstimated = expenseRepository.sumEstimatedByTripId(tripId);
        BigDecimal totalActual = expenseRepository.sumActualByTripId(tripId);

        summary.setTotalEstimated(totalEstimated != null ? totalEstimated : BigDecimal.ZERO);
        summary.setTotalActual(totalActual != null ? totalActual : BigDecimal.ZERO);

        // Calculate remaining budget
        BigDecimal remaining = summary.getTotalBudget().subtract(summary.getTotalActual());
        summary.setRemainingBudget(remaining);

        // Calculate percentage used
        if (summary.getTotalBudget().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal percentage = summary.getTotalActual()
                    .divide(summary.getTotalBudget(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            summary.setPercentageUsed(percentage);
        } else {
            summary.setPercentageUsed(BigDecimal.ZERO);
        }

        // Get category breakdown
        List<Object[]> categoryData = expenseRepository.getCategorySummary(tripId);
        Map<String, BudgetSummaryResponse.CategorySummary> breakdown = new HashMap<>();

        for (Object[] row : categoryData) {
            Expense.ExpenseCategory category = (Expense.ExpenseCategory) row[0];
            BigDecimal estimated = (BigDecimal) row[1];
            BigDecimal actual = (BigDecimal) row[2];
            Long count = (Long) row[3];

            BudgetSummaryResponse.CategorySummary catSummary =
                    new BudgetSummaryResponse.CategorySummary(
                            category.name(),
                            estimated != null ? estimated : BigDecimal.ZERO,
                            actual != null ? actual : BigDecimal.ZERO,
                            (actual != null ? actual : BigDecimal.ZERO)
                                    .subtract(estimated != null ? estimated : BigDecimal.ZERO),
                            count.intValue()
                    );
            breakdown.put(category.name(), catSummary);
        }

        summary.setCategoryBreakdown(breakdown);

        return summary;
    }

    @Override
    @Transactional
    public ExpenseResponse createExpenseFromBooking(String userEmail, Long tripId, Long bookingId) {
        Trip trip = tripService.getTripEntity(tripId, userEmail);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!hasEditPermission(trip, userEmail)) {
            throw new RuntimeException("You don't have permission to add expenses to this trip");
        }

        Expense expense = new Expense();
        expense.setTrip(trip);

        // Map booking type to expense category
        switch (booking.getBookingType()) {
            case FLIGHT:
                expense.setCategory(Expense.ExpenseCategory.FLIGHT);
                break;
            case ACCOMMODATION:
                expense.setCategory(Expense.ExpenseCategory.ACCOMMODATION);
                break;
            case ACTIVITY:
                expense.setCategory(Expense.ExpenseCategory.ACTIVITIES);
                break;
            default:
                expense.setCategory(Expense.ExpenseCategory.OTHER);
        }

        expense.setDescription(booking.getBookingType() + " booking - " + booking.getBookingReference());
        expense.setActualAmount(booking.getTotalPrice());
        expense.setCurrency(booking.getCurrency());
        expense.setBooking(booking);

        if (booking.getBookedAt() != null) {
            expense.setExpenseDate(booking.getBookedAt().toLocalDate());
        }

        Expense savedExpense = expenseRepository.save(expense);
        return mapToExpenseResponse(savedExpense);
    }

    // Helper methods
    private boolean hasEditPermission(Trip trip, String userEmail) {
        // Owner has full access
        if (trip.getUser().getEmail().equals(userEmail)) {
            return true;
        }

        // Check collaborator permissions
        return collaboratorRepository.findByTripAndUser(trip, userService.getUserByEmail(userEmail))
                .map(c -> c.getPermissionLevel() == TripCollaborator.PermissionLevel.EDIT ||
                        c.getPermissionLevel() == TripCollaborator.PermissionLevel.ADMIN)
                .orElse(false);
    }

    private BudgetResponse mapToBudgetResponse(Budget budget) {
        BudgetResponse response = new BudgetResponse();
        response.setId(budget.getId());
        response.setTripId(budget.getTrip().getId());
        response.setTripTitle(budget.getTrip().getTitle());
        response.setTotalBudget(budget.getTotalBudget());
        response.setCurrency(budget.getCurrency());
        response.setNotes(budget.getNotes());
        response.setCreatedAt(budget.getCreatedAt());
        response.setUpdatedAt(budget.getUpdatedAt());
        return response;
    }

    private ExpenseResponse mapToExpenseResponse(Expense expense) {
        ExpenseResponse response = new ExpenseResponse();
        response.setId(expense.getId());
        response.setTripId(expense.getTrip().getId());
        response.setCategory(expense.getCategory().name());
        response.setDescription(expense.getDescription());
        response.setEstimatedAmount(expense.getEstimatedAmount());
        response.setActualAmount(expense.getActualAmount());
        response.setCurrency(expense.getCurrency());
        response.setExpenseDate(expense.getExpenseDate());
        response.setNotes(expense.getNotes());
        response.setCreatedAt(expense.getCreatedAt());
        response.setUpdatedAt(expense.getUpdatedAt());

        if (expense.getPaidBy() != null) {
            response.setPaidBy(mapToUserResponse(expense.getPaidBy()));
        }

        if (expense.getBooking() != null) {
            response.setBookingReference(expense.getBooking().getBookingReference());
        }

        return response;
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name(),
                user.getEmailVerified()
        );
    }
}