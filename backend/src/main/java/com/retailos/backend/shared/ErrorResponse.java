package com.retailos.backend.shared;

import java.time.OffsetDateTime;

public record ErrorResponse(
        OffsetDateTime timestamp,
        int status,
        String errorCode,
        String message,
        String path
) {
}
