package com.retailos.backend.expiryrecord;

public class ExpiryRecordNotFoundException extends RuntimeException {
    public ExpiryRecordNotFoundException(String id) {
        super("Expiry Record not Found with id: " + id);
    }
}
