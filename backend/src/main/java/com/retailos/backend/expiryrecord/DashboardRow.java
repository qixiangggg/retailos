package com.retailos.backend.expiryrecord;

import java.time.LocalDate;

public record DashboardRow(String productName, LocalDate expiryDate, int remainingQuantity) {
}
