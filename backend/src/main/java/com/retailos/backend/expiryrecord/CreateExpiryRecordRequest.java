package com.retailos.backend.expiryrecord;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record CreateExpiryRecordRequest(
        @NotNull(message = "barcode is required") String barcode,
        String productName, @NotNull(message = "Expiry date is required") LocalDate expiryDate,
        @Positive(message = "Quantity must be positive") int quantity) {
}
