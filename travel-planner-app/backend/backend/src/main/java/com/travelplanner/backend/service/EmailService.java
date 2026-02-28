package com.travelplanner.backend.service;

import com.travelplanner.backend.entity.User;
import com.travelplanner.backend.entity.Booking;
import com.travelplanner.backend.entity.Trip;
import jakarta.mail.MessagingException;

public interface EmailService {

    void sendWelcomeEmail(User user) throws MessagingException;

    void sendPasswordResetEmail(User user, String resetToken) throws MessagingException;

    void sendBookingConfirmation(User user, Booking booking) throws MessagingException;

    void sendTripReminder(User user, Trip trip, String destination) throws MessagingException;

    void sendInvitationEmail(User invitedUser, User inviter, Trip trip, String invitationToken) throws MessagingException;

    boolean isEnabled();

    void sendVerificationEmail(User user, String verificationLink) throws MessagingException;
}