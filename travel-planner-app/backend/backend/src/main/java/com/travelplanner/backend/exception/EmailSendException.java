package com.travelplanner.backend.exception;

import org.springframework.http.HttpStatus;

public class EmailSendException extends ApiException {

    public EmailSendException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, "EMAIL_SEND_FAILED");
    }

    public EmailSendException(String message, Throwable cause) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, "EMAIL_SEND_FAILED", cause);
    }
}