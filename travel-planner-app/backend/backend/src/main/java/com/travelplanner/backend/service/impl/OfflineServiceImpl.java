package com.travelplanner.backend.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.backend.dto.request.OfflineSyncRequest;
import com.travelplanner.backend.dto.response.*;
import com.travelplanner.backend.entity.*;
import com.travelplanner.backend.repository.*;
import com.travelplanner.backend.service.OfflineService;
import com.travelplanner.backend.service.TripService;
import com.travelplanner.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OfflineServiceImpl implements OfflineService {

    private final OfflineDataRepository offlineDataRepository;
    private final OfflineSyncLogRepository syncLogRepository;
    private final TripService tripService;
    private final UserService userService;
    private final ObjectMapper objectMapper;

    private static final long MAX_OFFLINE_STORAGE_PER_USER = 50 * 1024 * 1024; // 50 MB
    private static final int DEFAULT_EXPIRY_DAYS = 30;

    @Override
    @Transactional
    public OfflineSyncResponse downloadTripsForOffline(String userEmail, OfflineSyncRequest request) {
        User user = userService.getUserByEmail(userEmail);

        String syncId = UUID.randomUUID().toString();
        LocalDateTime startedAt = LocalDateTime.now();

        OfflineSyncResponse response = new OfflineSyncResponse();
        response.setSyncId(syncId);
        response.setSyncStartedAt(startedAt);
        response.setTotalTrips(request.getTripIds().size());

        List<Long> successfulDownloads = new ArrayList<>();
        Map<Long, String> errors = new HashMap<>();
        long totalDataSize = 0;

        for (Long tripId : request.getTripIds()) {
            try {
                OfflineDataResponse dataResponse = downloadSingleTrip(userEmail, tripId, false);
                successfulDownloads.add(tripId);
                totalDataSize += dataResponse.getFileSize();

                // Log successful download
                logSync(user, tripService.getTripEntity(tripId, userEmail),
                        OfflineSyncLog.SyncType.DOWNLOAD, OfflineSyncLog.SyncStatus.SUCCESS, null);

            } catch (Exception e) {
                log.error("Failed to download trip {} for offline: {}", tripId, e.getMessage());
                errors.put(tripId, e.getMessage());

                // Log failed download
                try {
                    Trip trip = tripService.getTripEntity(tripId, userEmail);
                    logSync(user, trip, OfflineSyncLog.SyncType.DOWNLOAD,
                            OfflineSyncLog.SyncStatus.FAILED, e.getMessage());
                } catch (Exception ex) {
                    log.error("Could not log sync failure", ex);
                }
            }
        }

        response.setSuccessfulDownloads(successfulDownloads.size());
        response.setFailedDownloads(errors.size());
        response.setDownloadedTripIds(successfulDownloads);
        response.setErrors(errors);
        response.setTotalDataSize(totalDataSize);
        response.setSyncCompletedAt(LocalDateTime.now());
        response.setStatus(errors.isEmpty() ? "SUCCESS" : "PARTIAL_SUCCESS");

        return response;
    }

    @Override
    @Transactional
    public OfflineDataResponse downloadSingleTrip(String userEmail, Long tripId, Boolean forceRefresh) {
        User user = userService.getUserByEmail(userEmail);
        Trip trip = tripService.getTripEntity(tripId, userEmail);

        // Check if already exists
        Optional<OfflineData> existingData = offlineDataRepository.findByUserAndTrip(user, trip);

        if (existingData.isPresent() && !forceRefresh) {
            OfflineData data = existingData.get();
            if (data.getExpiresAt().isAfter(LocalDateTime.now())) {
                // Data is still valid, just update last accessed
                data.setLastAccessedAt(LocalDateTime.now());
                offlineDataRepository.save(data);
                return mapToOfflineDataResponse(data);
            }
        }

        // Check storage limit
        Long currentStorage = offlineDataRepository.sumFileSizeByUser(user);
        long estimatedSize = estimateTripDataSize(trip);

        if (currentStorage != null && currentStorage + estimatedSize > MAX_OFFLINE_STORAGE_PER_USER) {
            throw new RuntimeException("Storage limit exceeded. Please remove some offline data first.");
        }

        // Convert trip to JSON
        String tripJson = convertTripToJson(trip);
        String checksum = generateChecksum(tripJson);

        OfflineData offlineData = existingData.orElse(new OfflineData());
        offlineData.setUser(user);
        offlineData.setTrip(trip);
        offlineData.setDataVersion(trip.getUpdatedAt() != null ?
                trip.getUpdatedAt().hashCode() : 1);
        offlineData.setData(tripJson);
        offlineData.setDownloadedAt(LocalDateTime.now());
        offlineData.setLastAccessedAt(LocalDateTime.now());
        offlineData.setExpiresAt(LocalDateTime.now().plusDays(DEFAULT_EXPIRY_DAYS));
        offlineData.setFileSize((long) tripJson.getBytes(StandardCharsets.UTF_8).length);
        offlineData.setChecksum(checksum);

        OfflineData savedData = offlineDataRepository.save(offlineData);

        // Log download
        logSync(user, trip, OfflineSyncLog.SyncType.DOWNLOAD,
                OfflineSyncLog.SyncStatus.SUCCESS, null);

        return mapToOfflineDataResponse(savedData);
    }

    @Override
    @Transactional(readOnly = true)
    public OfflineDataResponse getOfflineTripData(String userEmail, Long tripId) {
        User user = userService.getUserByEmail(userEmail);

        OfflineData offlineData = offlineDataRepository.findByUserIdAndTripId(user.getId(), tripId)
                .orElseThrow(() -> new RuntimeException("Offline data not found for trip: " + tripId));

        // Update last accessed
        offlineData.setLastAccessedAt(LocalDateTime.now());
        offlineDataRepository.save(offlineData);

        // Log access
        Trip trip = tripService.getTripEntity(tripId, userEmail);
        logSync(user, trip, OfflineSyncLog.SyncType.ACCESS,
                OfflineSyncLog.SyncStatus.SUCCESS, null);

        return mapToOfflineDataResponse(offlineData);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OfflineDataResponse> getAllOfflineTrips(String userEmail) {
        User user = userService.getUserByEmail(userEmail);

        return offlineDataRepository.findByUser(user)
                .stream()
                .map(this::mapToOfflineDataResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OfflineStatusResponse getOfflineStatus(String userEmail) {
        User user = userService.getUserByEmail(userEmail);

        List<OfflineData> offlineDataList = offlineDataRepository.findByUser(user);
        Long totalStorage = offlineDataRepository.sumFileSizeByUser(user);

        OfflineStatusResponse response = new OfflineStatusResponse();
        response.setUserId(user.getId());
        response.setTotalOfflineTrips(offlineDataList.size());
        response.setTotalStorageUsed(totalStorage != null ? totalStorage : 0L);
        response.setAvailableStorage(MAX_OFFLINE_STORAGE_PER_USER - (totalStorage != null ? totalStorage : 0L));

        List<OfflineStatusResponse.OfflineTripSummary> summaries = new ArrayList<>();
        for (OfflineData data : offlineDataList) {
            OfflineStatusResponse.OfflineTripSummary summary =
                    new OfflineStatusResponse.OfflineTripSummary();
            summary.setTripId(data.getTrip().getId());
            summary.setTripTitle(data.getTrip().getTitle());
            summary.setDownloadedAt(data.getDownloadedAt());
            summary.setExpiresAt(data.getExpiresAt());
            summary.setFileSize(data.getFileSize());
            summary.setLastAccessed(data.getLastAccessedAt());

            // Check if needs update
            boolean needsUpdate = data.getDataVersion() !=
                    (data.getTrip().getUpdatedAt() != null ? data.getTrip().getUpdatedAt().hashCode() : 1);
            summary.setNeedsUpdate(needsUpdate);

            summaries.add(summary);
        }

        response.setTrips(summaries);

        Map<String, Integer> stats = new HashMap<>();
        stats.put("expiringSoon", (int) offlineDataList.stream()
                .filter(d -> d.getExpiresAt().isBefore(LocalDateTime.now().plusDays(7)))
                .count());
        stats.put("needsUpdate", (int) offlineDataList.stream()
                .filter(d -> d.getDataVersion() !=
                        (d.getTrip().getUpdatedAt() != null ? d.getTrip().getUpdatedAt().hashCode() : 1))
                .count());

        response.setStats(stats);

        return response;
    }

    @Override
    @Transactional
    public OfflineDataResponse refreshOfflineData(String userEmail, Long tripId) {
        return downloadSingleTrip(userEmail, tripId, true);
    }

    @Override
    @Transactional
    public OfflineSyncResponse refreshAllOfflineData(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        List<OfflineData> offlineDataList = offlineDataRepository.findByUser(user);

        List<Long> tripIds = offlineDataList.stream()
                .map(d -> d.getTrip().getId())
                .collect(Collectors.toList());

        OfflineSyncRequest request = new OfflineSyncRequest();
        request.setTripIds(tripIds);
        request.setIncludeExpired(true);

        return downloadTripsForOffline(userEmail, request);
    }

    @Override
    @Transactional
    public void deleteOfflineData(String userEmail, Long tripId) {
        User user = userService.getUserByEmail(userEmail);

        OfflineData offlineData = offlineDataRepository.findByUserIdAndTripId(user.getId(), tripId)
                .orElseThrow(() -> new RuntimeException("Offline data not found"));

        Trip trip = offlineData.getTrip();

        offlineDataRepository.delete(offlineData);

        // Log deletion
        logSync(user, trip, OfflineSyncLog.SyncType.DELETE,
                OfflineSyncLog.SyncStatus.SUCCESS, null);
    }

    @Override
    @Transactional
    public void deleteAllOfflineData(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        List<OfflineData> offlineDataList = offlineDataRepository.findByUser(user);

        for (OfflineData data : offlineDataList) {
            logSync(user, data.getTrip(), OfflineSyncLog.SyncType.DELETE,
                    OfflineSyncLog.SyncStatus.SUCCESS, null);
        }

        offlineDataRepository.deleteAll(offlineDataList);
    }

    @Override
    @Transactional
    public void deleteExpiredOfflineData(String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        List<OfflineData> expiredData = offlineDataRepository.findExpiredByUser(user, LocalDateTime.now());

        for (OfflineData data : expiredData) {
            logSync(user, data.getTrip(), OfflineSyncLog.SyncType.DELETE,
                    OfflineSyncLog.SyncStatus.SUCCESS, "Expired data auto-deleted");
        }

        offlineDataRepository.deleteAll(expiredData);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isOfflineDataValid(String userEmail, Long tripId) {
        try {
            User user = userService.getUserByEmail(userEmail);
            Optional<OfflineData> offlineData = offlineDataRepository.findByUserIdAndTripId(user.getId(), tripId);

            return offlineData.isPresent() &&
                    offlineData.get().getExpiresAt().isAfter(LocalDateTime.now());
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean needsUpdate(String userEmail, Long tripId, Integer currentVersion) {
        try {
            User user = userService.getUserByEmail(userEmail);
            Optional<OfflineData> offlineData = offlineDataRepository.findByUserIdAndTripId(user.getId(), tripId);

            return offlineData.map(data -> !data.getDataVersion().equals(currentVersion)).orElse(true);
        } catch (Exception e) {
            return true;
        }
    }

    @Override
    @Transactional
    @Scheduled(cron = "0 0 3 * * ?") // Run at 3 AM daily
    public void cleanupExpiredData() {
        log.info("Running cleanup of expired offline data");
        int deletedCount = offlineDataRepository.deleteAllExpired(LocalDateTime.now());
        log.info("Deleted {} expired offline data entries", deletedCount);
    }

    // Helper methods
    private void logSync(User user, Trip trip, OfflineSyncLog.SyncType type,
                         OfflineSyncLog.SyncStatus status, String errorMessage) {
        OfflineSyncLog log = new OfflineSyncLog();
        log.setUser(user);
        log.setTrip(trip);
        log.setSyncType(type);
        log.setStatus(status);
        log.setErrorMessage(errorMessage);
        log.setDataVersion(trip.getUpdatedAt() != null ? trip.getUpdatedAt().hashCode() : 1);
        log.setSyncStartedAt(LocalDateTime.now());
        log.setSyncCompletedAt(LocalDateTime.now());

        syncLogRepository.save(log);
    }

    private String convertTripToJson(Trip trip) {
        try {
            Map<String, Object> tripMap = new HashMap<>();
            tripMap.put("id", trip.getId());
            tripMap.put("title", trip.getTitle());
            tripMap.put("description", trip.getDescription());
            tripMap.put("startDate", trip.getStartDate());
            tripMap.put("endDate", trip.getEndDate());
            tripMap.put("status", trip.getStatus());
            tripMap.put("isPublic", trip.getIsPublic());

            // Add destinations
            List<Map<String, Object>> destinations = new ArrayList<>();
            for (Destination dest : trip.getDestinations()) {
                Map<String, Object> destMap = new HashMap<>();
                destMap.put("id", dest.getId());
                destMap.put("name", dest.getName());
                destMap.put("country", dest.getCountry());
                destMap.put("city", dest.getCity());
                destMap.put("arrivalDate", dest.getArrivalDate());
                destMap.put("departureDate", dest.getDepartureDate());
                destMap.put("accommodationName", dest.getAccommodationName());
                destMap.put("accommodationAddress", dest.getAccommodationAddress());
                destMap.put("notes", dest.getNotes());

                // Add activities
                List<Map<String, Object>> activities = new ArrayList<>();
                for (Activity act : dest.getActivities()) {
                    Map<String, Object> actMap = new HashMap<>();
                    actMap.put("id", act.getId());
                    actMap.put("name", act.getName());
                    actMap.put("type", act.getType());
                    actMap.put("date", act.getDate());
                    actMap.put("startTime", act.getStartTime());
                    actMap.put("endTime", act.getEndTime());
                    actMap.put("location", act.getLocation());
                    actMap.put("cost", act.getCost());
                    actMap.put("currency", act.getCurrency());
                    actMap.put("bookingReference", act.getBookingReference());
                    actMap.put("notes", act.getNotes());
                    activities.add(actMap);
                }
                destMap.put("activities", activities);
                destinations.add(destMap);
            }
            tripMap.put("destinations", destinations);

            return objectMapper.writeValueAsString(tripMap);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert trip to JSON", e);
            throw new RuntimeException("Failed to process trip data for offline storage");
        }
    }

    private long estimateTripDataSize(Trip trip) {
        // Rough estimate - in production, you'd calculate actual size
        return 1024 + (trip.getDestinations().size() * 512) +
                (trip.getDestinations().stream().mapToInt(d -> d.getActivities().size()).sum() * 256);
    }

    private String generateChecksum(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            log.error("Failed to generate checksum", e);
            return UUID.randomUUID().toString();
        }
    }

    private OfflineDataResponse mapToOfflineDataResponse(OfflineData data) {
        OfflineDataResponse response = new OfflineDataResponse();
        response.setId(data.getId());
        response.setTripId(data.getTrip().getId());
        response.setTripTitle(data.getTrip().getTitle());
        response.setDataVersion(data.getDataVersion());
        response.setData(data.getData());
        response.setDownloadedAt(data.getDownloadedAt());
        response.setLastAccessedAt(data.getLastAccessedAt());
        response.setExpiresAt(data.getExpiresAt());
        response.setFileSize(data.getFileSize());
        response.setChecksum(data.getChecksum());

        // Check if data is still valid
        boolean isValid = data.getExpiresAt().isAfter(LocalDateTime.now());
        response.setIsValid(isValid);

        // Calculate remaining days
        if (isValid) {
            long remainingDays = ChronoUnit.DAYS.between(LocalDateTime.now(), data.getExpiresAt());
            response.setRemainingDays(remainingDays);
        } else {
            response.setRemainingDays(0L);
        }

        return response;
    }
}