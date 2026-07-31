package com.retailos.backend.expiryrecord;

import java.time.LocalDate;

public record CreateExpiryRecordResponse(String productName, LocalDate expiryDate, int quantity) {
}
