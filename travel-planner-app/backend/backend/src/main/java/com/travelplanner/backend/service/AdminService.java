package com.travelplanner.backend.service;

import com.travelplanner.backend.dto.request.AdminUserUpdateRequest;
import com.travelplanner.backend.dto.response.AdminDashboardResponse;
import com.travelplanner.backend.dto.response.AdminUserResponse;
import com.travelplanner.backend.dto.response.AdminActionLogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface AdminService {

    // User management
    Page<AdminUserResponse> getAllUsers(Pageable pageable);

    AdminUserResponse getUserDetails(Long userId);

    AdminUserResponse updateUser(String adminEmail, Long userId, AdminUserUpdateRequest request);

    void lockUser(String adminEmail, Long userId, String reason);

    void unlockUser(String adminEmail, Long userId);

    void deleteUser(String adminEmail, Long userId);

    // Dashboard
    AdminDashboardResponse getDashboardStats(String adminEmail);

    List<AdminActionLogResponse> getRecentAdminActions(String adminEmail, int limit);

    // Trip management
    void deleteAnyTrip(String adminEmail, Long tripId, String reason);

    // Booking management
    void cancelAnyBooking(String adminEmail, String bookingReference, String reason);

    // Audit logs
    Page<AdminActionLogResponse> getAuditLogs(Pageable pageable, String actionType, Long adminId);
}