package com.retailos.backend.writeoff;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateWriteoffRequest(
        @NotNull String expiryRecordId,
        @Positive(message = "Quantity must be positive") int quantity,
        @NotNull(message = "Reason must be provided") WriteoffReason reason

) {
}
