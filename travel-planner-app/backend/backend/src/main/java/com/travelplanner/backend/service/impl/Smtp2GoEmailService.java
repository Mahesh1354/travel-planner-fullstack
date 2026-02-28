package com.travelplanner.backend.service.impl;

import com.travelplanner.backend.config.EmailProperties;
import com.travelplanner.backend.entity.Booking;
import com.travelplanner.backend.entity.Trip;
import com.travelplanner.backend.entity.User;
import com.travelplanner.backend.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class Smtp2GoEmailService implements EmailService {

    private final JavaMailSender mailSender;
    private final EmailProperties emailProperties;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");

    @Override
    public boolean isEnabled() {
        return emailProperties.isEnabled();
    }

    @Override
    public void sendWelcomeEmail(User user) {
        String subject = "Welcome to Travel Planner, " + user.getFirstName() + "!";
        String content = String.format("""
            Hi %s,
            
            Thank you for joining Travel Planner! We're excited to help you plan your next adventure.
            
            Get started by visiting your dashboard:
            %s/dashboard
            
            Happy travels!
            The Travel Planner Team
            """,
                user.getFirstName(),
                emailProperties.getBaseUrl()
        );

        safeSendEmail(user.getEmail(), subject, content);
    }

    @Override
    public void sendPasswordResetEmail(User user, String resetToken) {
        String resetLink = emailProperties.getBaseUrl() + "/reset-password?token=" + resetToken;
        String subject = "Reset Your Travel Planner Password";
        String content = String.format("""
            Hi %s,
            
            Click the link below to reset your password:
            %s
            
            This link expires in 1 hour.
            
            If you didn't request this, please ignore this email.
            
            The Travel Planner Team
            """,
                user.getFirstName(),
                resetLink
        );

        safeSendEmail(user.getEmail(), subject, content);
    }

    @Override
    public void sendBookingConfirmation(User user, Booking booking) {
        String tripLink = emailProperties.getBaseUrl() + "/trips/" +
                (booking.getTrip() != null ? booking.getTrip().getId() : "");
        String subject = "Booking Confirmed: " + booking.getBookingReference();
        String content = String.format("""
            Hi %s,
            
            Your booking has been confirmed. Here are the details:
            
            Booking Reference: %s
            Type: %s
            Provider: %s
            Total: $%.2f %s
            
            View your booking: %s
            
            The Travel Planner Team
            """,
                user.getFirstName(),
                booking.getBookingReference(),
                booking.getBookingType(),
                booking.getProvider(),
                booking.getTotalPrice(),
                booking.getCurrency(),
                tripLink
        );

        safeSendEmail(user.getEmail(), subject, content);
    }

    @Override
    public void sendTripReminder(User user, Trip trip, String destination) {
        String tripLink = emailProperties.getBaseUrl() + "/trips/" + trip.getId();
        String subject = "Upcoming Trip Reminder: " + trip.getTitle();
        String content = String.format("""
            Hi %s,
            
            Just a reminder that your trip to %s is coming up soon!
            
            Trip: %s
            Dates: %s to %s
            
            View your trip: %s
            
            Don't forget to download the trip for offline access!
            
            The Travel Planner Team
            """,
                user.getFirstName(),
                destination,
                trip.getTitle(),
                trip.getStartDate().format(DATE_FORMATTER),
                trip.getEndDate().format(DATE_FORMATTER),
                tripLink
        );

        safeSendEmail(user.getEmail(), subject, content);
    }

    @Override
    public void sendInvitationEmail(User invitedUser, User inviter, Trip trip, String invitationToken) {
        String acceptLink = emailProperties.getBaseUrl() + "/trips/" + trip.getId() +
                "/invitations?token=" + invitationToken + "&accept=true";
        String subject = inviter.getFirstName() + " invited you to collaborate on a trip!";
        String content = String.format("""
            Hi %s,
            
            %s %s has invited you to collaborate on their trip:
            
            Trip: %s
            Dates: %s to %s
            
            Accept: %s
            
            If you don't have an account yet, you'll be able to create one.
            
            The Travel Planner Team
            """,
                invitedUser.getFirstName(),
                inviter.getFirstName(),
                inviter.getLastName(),
                trip.getTitle(),
                trip.getStartDate().format(DATE_FORMATTER),
                trip.getEndDate().format(DATE_FORMATTER),
                acceptLink
        );

        safeSendEmail(invitedUser.getEmail(), subject, content);
    }

    private void safeSendEmail(String to, String subject, String content) {
        if (!emailProperties.isEnabled()) {
            log.info("📧 Email disabled. Would send to: {} - Subject: {}", to, subject);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

            helper.setFrom(emailProperties.getFrom(), emailProperties.getFromName());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content);

            mailSender.send(message);
            log.info("✅ Email sent successfully to: {}", to);

        } catch (Exception e) {
            log.error("❌ Failed to send email to: {} - Error: {}", to, e.getMessage());
        }
    }

    @Override
    public void sendVerificationEmail(User user, String verificationLink) {
        String subject = "Verify Your Email - Travel Planner";
        String content = String.format("""
        Hi %s,
        
        Thank you for registering with Travel Planner!
        
        Please verify your email address by clicking the link below:
        %s
        
        This link expires in 24 hours.
        
        If you didn't create an account, please ignore this email.
        
        Happy travels!
        The Travel Planner Team
        """,
                user.getFirstName(),
                verificationLink
        );

        safeSendEmail(user.getEmail(), subject, content);
    }
}