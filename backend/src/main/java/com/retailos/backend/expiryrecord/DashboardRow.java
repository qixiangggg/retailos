package com.retailos.backend.expiryrecord;

import java.time.LocalDate;

public record DashboardRow(String id, String productName, LocalDate expiryDate, Long remainingQuantity) {
}
