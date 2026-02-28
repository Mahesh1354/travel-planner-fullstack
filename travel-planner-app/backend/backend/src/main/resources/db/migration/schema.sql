-- Create database
CREATE DATABASE IF NOT EXISTS travel_planner;
USE travel_planner;

-- Users table
CREATE TABLE IF NOT EXISTS users (
                                     id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                     email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    enabled BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    reset_token VARCHAR(255),
    reset_token_expiry DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_reset_token (reset_token)
    );

-- Insert sample user (password: Test@123)
INSERT INTO users (email, password, first_name, last_name, role, email_verified) VALUES
                                                                                     ('john.doe@example.com', '$2a$10$rThFJ6KxjKJxQxQxQxQxQeQxQxQxQxQxQxQxQxQxQxQxQxQxQxQ', 'John', 'Doe', 'USER', true),
                                                                                     ('admin@travelplanner.com', '$2a$10$rThFJ6KxjKJxQxQxQxQxQeQxQxQxQxQxQxQxQxQxQxQxQxQxQxQ', 'Admin', 'User', 'ADMIN', true);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
                                     id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                     user_id BIGINT NOT NULL,
                                     title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('PLANNING', 'BOOKED', 'COMPLETED', 'CANCELLED') DEFAULT 'PLANNING',
    cover_image VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_dates (start_date, end_date),
    CONSTRAINT check_dates CHECK (end_date >= start_date)
    );

-- Destinations table
CREATE TABLE IF NOT EXISTS destinations (
                                            id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                            trip_id BIGINT NOT NULL,
                                            name VARCHAR(200) NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    arrival_date DATE,
    departure_date DATE,
    accommodation_name VARCHAR(200),
    accommodation_address TEXT,
    accommodation_confirmation VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    INDEX idx_trip_id (trip_id)
    );
-- Add latitude and longitude to destinations table
ALTER TABLE destinations
    ADD COLUMN IF NOT EXISTS latitude DOUBLE,
    ADD COLUMN IF NOT EXISTS longitude DOUBLE;

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
                                          id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                          destination_id BIGINT NOT NULL,
                                          name VARCHAR(200) NOT NULL,
    type ENUM('SIGHTSEEING', 'FOOD', 'SHOPPING', 'ADVENTURE', 'RELAXATION', 'CULTURAL', 'NIGHTLIFE', 'OTHER') DEFAULT 'OTHER',
    date DATE,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    cost DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    booking_reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    INDEX idx_destination_id (destination_id)
    );

-- Trip collaborators table (for sharing)
CREATE TABLE IF NOT EXISTS trip_collaborators (
                                                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                                  trip_id BIGINT NOT NULL,
                                                  user_id BIGINT NOT NULL,
                                                  permission_level ENUM('VIEW', 'EDIT', 'ADMIN') DEFAULT 'VIEW',
    invited_by BIGINT NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'DECLINED') DEFAULT 'PENDING',
    invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id),
    UNIQUE KEY unique_trip_user (trip_id, user_id),
    INDEX idx_user_id (user_id)
    );

-- Sample seed data
INSERT INTO trips (user_id, title, description, start_date, end_date, status) VALUES
                                                                                  (1, 'Summer Vacation in Paris', 'A week-long trip to explore the City of Light', '2024-07-15', '2024-07-22', 'PLANNING'),
                                                                                  (1, 'Business Trip to NYC', 'Client meetings and networking', '2024-03-10', '2024-03-15', 'BOOKED');

INSERT INTO destinations (trip_id, name, country, city, arrival_date, departure_date, accommodation_name) VALUES
                                                                                                              (1, 'Paris', 'France', 'Paris', '2024-07-15', '2024-07-22', 'Hotel de Ville'),
                                                                                                              (2, 'New York', 'USA', 'New York', '2024-03-10', '2024-03-15', 'Marriott Marquis');

INSERT INTO activities (destination_id, name, type, date, location, cost) VALUES
                                                                              (1, 'Eiffel Tower Visit', 'SIGHTSEEING', '2024-07-16', 'Champ de Mars, Paris', 25.00),
                                                                              (1, 'Seine River Cruise', 'SIGHTSEEING', '2024-07-17', 'Seine River', 15.00);

-- Bookings table (to store booking references)
CREATE TABLE IF NOT EXISTS bookings (
                                        id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                        booking_reference VARCHAR(255) NOT NULL UNIQUE,
    booking_type ENUM('FLIGHT', 'ACCOMMODATION', 'ACTIVITY') NOT NULL,
    user_id BIGINT NOT NULL,
    trip_id BIGINT,
    destination_id BIGINT,
    activity_id BIGINT,
    provider VARCHAR(100) NOT NULL,
    status ENUM('CONFIRMED', 'CANCELLED', 'PENDING', 'FAILED') DEFAULT 'CONFIRMED',
    booking_details JSON,
    total_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_trip_id (trip_id),
    INDEX idx_booking_reference (booking_reference)
    );

-- Add booking_reference to existing tables for linking
ALTER TABLE activities ADD COLUMN booking_id BIGINT NULL AFTER notes;
ALTER TABLE destinations ADD COLUMN booking_id BIGINT NULL AFTER notes;
ALTER TABLE activities ADD FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;
ALTER TABLE destinations ADD FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;

-- Sample booking data
INSERT INTO bookings (booking_reference, booking_type, user_id, provider, booking_details, total_price, currency) VALUES
                                                                                                                      ('FL123456', 'FLIGHT', 1, 'MockAir', '{"flight": "AA123", "from": "JFK", "to": "CDG"}', 850.00, 'USD'),
                                                                                                                      ('HT789012', 'ACCOMMODATION', 1, 'MockStay', '{"hotel": "Hilton Paris", "room": "Deluxe"}', 1200.00, 'USD');

-- Budgets table (overall trip budget)
CREATE TABLE IF NOT EXISTS budgets (
                                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                       trip_id BIGINT NOT NULL UNIQUE,
                                       total_budget DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    INDEX idx_trip_id (trip_id)
    );

-- Expenses table (individual expenses)
CREATE TABLE IF NOT EXISTS expenses (
                                        id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                        trip_id BIGINT NOT NULL,
                                        category ENUM('FLIGHT', 'ACCOMMODATION', 'FOOD', 'TRANSPORT', 'ACTIVITIES', 'SHOPPING', 'OTHER') NOT NULL,
    description VARCHAR(255) NOT NULL,
    estimated_amount DECIMAL(10,2),
    actual_amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    expense_date DATE,
    paid_by BIGINT,
    booking_id BIGINT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_trip_id (trip_id),
    INDEX idx_category (category),
    INDEX idx_expense_date (expense_date)
    );

-- Sample budget data
INSERT INTO budgets (trip_id, total_budget, currency) VALUES
                                                          (1, 5000.00, 'USD'),
                                                          (2, 2000.00, 'USD');

-- Sample expense data
INSERT INTO expenses (trip_id, category, description, estimated_amount, actual_amount, expense_date) VALUES
                                                                                                         (1, 'FLIGHT', 'Round trip flights to Paris', 850.00, 850.00, '2024-07-15'),
                                                                                                         (1, 'ACCOMMODATION', 'Hotel de Ville - 7 nights', 2100.00, 2100.00, '2024-07-15'),
                                                                                                         (1, 'FOOD', 'Daily meals estimate', 350.00, NULL, NULL),
                                                                                                         (1, 'ACTIVITIES', 'Eiffel Tower tickets', 50.00, 50.00, '2024-07-16'),
                                                                                                         (2, 'ACCOMMODATION', 'Marriott Marquis - 5 nights', 1250.00, 1250.00, '2024-03-10'),
                                                                                                         (2, 'FOOD', 'Meals and entertainment', 400.00, NULL, NULL);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
                                                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                                user_id BIGINT NOT NULL UNIQUE,
                                                preferred_categories JSON, -- Array of preferred activity types (e.g., ["SIGHTSEEING", "FOOD", "ADVENTURE"])
                                                budget_level ENUM('BUDGET', 'MID_RANGE', 'LUXURY') DEFAULT 'MID_RANGE',
    dietary_restrictions JSON, -- Array of dietary restrictions
    interests JSON, -- Array of user interests
    accessibility_needs BOOLEAN DEFAULT FALSE,
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
    );

-- Travel tips table (cached tips by destination)
CREATE TABLE IF NOT EXISTS travel_tips (
                                           id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                           destination_country VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100),
    tip_type ENUM('VISA', 'SAFETY', 'HEALTH', 'CULTURE', 'TRANSPORT', 'WEATHER', 'GENERAL') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    source VARCHAR(100),
    is_government_advice BOOLEAN DEFAULT FALSE,
    last_updated DATE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_destination (destination_country, destination_city),
    INDEX idx_tip_type (tip_type)
    );

-- Sample user preferences
INSERT INTO user_preferences (user_id, preferred_categories, budget_level, interests) VALUES
                                                                                          (1, '["SIGHTSEEING", "FOOD", "CULTURAL"]', 'MID_RANGE', '["history", "art", "local cuisine"]'),
                                                                                          (2, '["ADVENTURE", "NIGHTLIFE"]', 'BUDGET', '["hiking", "parties", "music"]');

-- Sample travel tips
INSERT INTO travel_tips (destination_country, destination_city, tip_type, title, description, is_government_advice) VALUES
                                                                                                                        ('France', 'Paris', 'VISA', 'Schengen Visa Requirements', 'EU citizens do not need a visa. Other nationalities should check with the French embassy. Passport must be valid for at least 3 months beyond your stay.', true),
                                                                                                                        ('France', 'Paris', 'SAFETY', 'Pickpocket Awareness', 'Be vigilant in tourist areas like Eiffel Tower, Louvre, and on public transport. Keep valuables secure.', false),
                                                                                                                        ('France', 'Paris', 'CULTURE', 'Dining Etiquette', 'Tipping is not mandatory as service charge is included. Round up the bill for good service.', false),
                                                                                                                        ('France', 'Paris', 'TRANSPORT', 'Paris Metro Tips', 'Buy carnet of 10 tickets for better value. Keep your ticket until you exit.', false),
                                                                                                                        ('France', NULL, 'HEALTH', 'European Health Insurance Card', 'EU citizens should carry their EHIC card for healthcare coverage.', true),
                                                                                                                        ('USA', 'New York', 'VISA', 'ESTA Requirements', 'Visa waiver program countries need ESTA approval before travel. Apply at least 72 hours before departure.', true),
                                                                                                                        ('USA', 'New York', 'SAFETY', 'Emergency Numbers', 'Dial 911 for police, fire, or medical emergencies.', false);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
                                             id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                             user_id BIGINT NOT NULL,
                                             trip_id BIGINT,
                                             type ENUM('FLIGHT_UPDATE', 'WEATHER_ALERT', 'GROUP_ACTIVITY', 'BOOKING_CONFIRMATION', 'PAYMENT_REMINDER', 'GENERAL') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('HIGH', 'MEDIUM', 'LOW') DEFAULT 'MEDIUM',
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    image_url VARCHAR(500),
    metadata JSON, -- Additional data like flight numbers, weather details, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_trip_id (trip_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
                                                        id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                                        user_id BIGINT NOT NULL UNIQUE,
                                                        flight_updates BOOLEAN DEFAULT TRUE,
                                                        weather_alerts BOOLEAN DEFAULT TRUE,
                                                        group_activities BOOLEAN DEFAULT TRUE,
                                                        booking_confirmations BOOLEAN DEFAULT TRUE,
                                                        payment_reminders BOOLEAN DEFAULT TRUE,
                                                        promotional BOOLEAN DEFAULT FALSE,
                                                        email_enabled BOOLEAN DEFAULT TRUE,
                                                        push_enabled BOOLEAN DEFAULT TRUE,
                                                        sms_enabled BOOLEAN DEFAULT FALSE,
                                                        quiet_hours_start TIME,
                                                        quiet_hours_end TIME,
                                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
    );

-- Sample notification preferences
INSERT INTO notification_preferences (user_id, flight_updates, weather_alerts, group_activities, email_enabled, push_enabled) VALUES
                                                                                                                                  (1, true, true, true, true, true),
                                                                                                                                  (2, true, false, true, true, false);

-- Sample notifications
INSERT INTO notifications (user_id, trip_id, type, title, message, priority, metadata) VALUES
                                                                                           (1, 1, 'FLIGHT_UPDATE', 'Flight AA123 Delayed', 'Your flight to Paris is delayed by 2 hours. New departure time: 15:30', 'HIGH',
                                                                                            '{"flight": "AA123", "airline": "American Airlines", "delay": 120, "new_departure": "15:30"}'),
                                                                                           (1, 1, 'WEATHER_ALERT', 'Rain Expected in Paris', 'Light rain forecasted for July 16-17. Pack an umbrella!', 'MEDIUM',
                                                                                            '{"condition": "rain", "temperature": "18-22°C", "humidity": 80}'),
                                                                                           (2, 2, 'GROUP_ACTIVITY', 'Team Dinner Added', 'John added a team dinner at Katz''s Deli on March 12 at 7:00 PM', 'MEDIUM',
                                                                                            '{"activity": "dinner", "location": "Katz''s Deli", "time": "19:00", "added_by": "John"}'),
                                                                                           (1, 1, 'BOOKING_CONFIRMATION', 'Louvre Tickets Confirmed', 'Your tickets for Louvre Museum on July 17 are confirmed.', 'LOW',
                                                                                            '{"booking_ref": "LV123456", "date": "2024-07-17", "quantity": 2}');

-- Offline data table (stores downloaded trip data for offline access)
CREATE TABLE IF NOT EXISTS offline_data (
                                            id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                            user_id BIGINT NOT NULL,
                                            trip_id BIGINT NOT NULL,
                                            data_version INT DEFAULT 1,
                                            data JSON NOT NULL, -- Complete trip data as JSON
                                            downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                            last_accessed_at TIMESTAMP NULL,
                                            expires_at TIMESTAMP NULL,
                                            file_size BIGINT, -- Size in bytes
                                            checksum VARCHAR(64), -- For data integrity verification
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_trip (user_id, trip_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_trip_id (trip_id),
    INDEX idx_expires_at (expires_at)
    );

-- Offline sync log table (tracks sync history)
CREATE TABLE IF NOT EXISTS offline_sync_log (
                                                id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                                user_id BIGINT NOT NULL,
                                                trip_id BIGINT NOT NULL,
                                                sync_type ENUM('DOWNLOAD', 'UPDATE', 'DELETE', 'ACCESS') NOT NULL,
    data_version INT,
    status ENUM('SUCCESS', 'FAILED', 'IN_PROGRESS') DEFAULT 'SUCCESS',
    error_message TEXT,
    sync_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sync_completed_at TIMESTAMP NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_trip_id (trip_id),
    INDEX idx_sync_started (sync_started_at)
    );

-- Sample offline data (for testing)
INSERT INTO offline_data (user_id, trip_id, data_version, data, file_size, checksum) VALUES
                                                                                         (1, 1, 1, '{"trip":{"id":1,"title":"Summer Vacation in Paris","startDate":"2024-07-15","endDate":"2024-07-22"},"destinations":[{"id":1,"name":"Paris","activities":[{"id":1,"name":"Eiffel Tower Visit"}]}]}', 1024, 'abc123...'),
                                                                                         (1, 2, 1, '{"trip":{"id":2,"title":"Business Trip to NYC","startDate":"2024-03-10","endDate":"2024-03-15"},"destinations":[{"id":2,"name":"New York","activities":[]}]}', 512, 'def456...');


-- Admin action logs table
CREATE TABLE IF NOT EXISTS admin_action_logs (
                                                 id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                                 admin_id BIGINT NOT NULL,
                                                 action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50), -- USER, TRIP, BOOKING, etc.
    target_id BIGINT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
    );

-- System metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
                                              id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                              metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2),
    metric_type ENUM('GAUGE', 'COUNTER', 'HISTOGRAM') DEFAULT 'GAUGE',
    tags JSON,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric_name (metric_name),
    INDEX idx_recorded_at (recorded_at)
    );

-- User activity summary table (for admin dashboard)
CREATE TABLE IF NOT EXISTS user_activity_summary (
                                                     id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                                     user_id BIGINT NOT NULL,
                                                     last_login TIMESTAMP NULL,
                                                     total_logins INT DEFAULT 0,
                                                     total_trips INT DEFAULT 0,
                                                     total_bookings INT DEFAULT 0,
                                                     total_expenses DECIMAL(15,2) DEFAULT 0,
    last_activity TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user (user_id)
    );

-- Sample admin actions
INSERT INTO admin_action_logs (admin_id, action_type, target_type, target_id, details) VALUES
                                                                                           (2, 'USER_LOCK', 'USER', 1, '{"reason": "Suspicious activity"}'),
                                                                                           (2, 'TRIP_DELETE', 'TRIP', 3, '{"reason": "Inappropriate content"}');

-- Sample system metrics
INSERT INTO system_metrics (metric_name, metric_value, metric_type) VALUES
                                                                        ('active_users', 1250, 'GAUGE'),
                                                                        ('total_trips', 3420, 'COUNTER'),
                                                                        ('total_bookings', 5678, 'COUNTER'),
                                                                        ('api_response_time_avg', 245.5, 'HISTOGRAM'),
                                                                        ('error_rate', 0.02, 'GAUGE');