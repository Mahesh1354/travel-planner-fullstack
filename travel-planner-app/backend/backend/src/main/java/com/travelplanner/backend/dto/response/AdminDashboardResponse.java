package com.travelplanner.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    // User stats
    private Long totalUsers;
    private Long activeUsersToday;
    private Long newUsersToday;
    private Long lockedUsers;

    // Trip stats
    private Long totalTrips;
    private Long activeTrips;
    private Long completedTrips;
    private Long sharedTrips;

    // Booking stats
    private Long totalBookings;
    private Long flightBookings;
    private Long accommodationBookings;
    private Long activityBookings;
    private Double totalBookingValue;

    // Financial stats
    private Double totalRevenue;
    private Double averageBookingValue;
    private Map<String, Double> revenueByPeriod;

    // System health
    private SystemHealthResponse systemHealth;

    // Recent activity
    private List<AdminActionLogResponse> recentActions;
    private List<UserResponse> recentUsers;

    // Charts data
    private Map<String, List<Long>> userGrowth;
    private Map<String, List<Double>> revenueTrend;
}