package com.retailos.backend.writeoff;

public record CreateWriteoffResponse(String sku, String productName, int quantity, WriteoffReason reason, Long remainingQuantity) {
}
