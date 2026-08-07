package com.retailos.backend.expiryrecord;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ExpiryRecordRepository extends JpaRepository<ExpiryRecord, String> {

    @Query("""
            SELECT new com.retailos.backend.expiryrecord.DashboardRow(
            e.product.name,
            e.expiryDate,
            e.quantity - COALESCE((SELECT SUM(w.quantity) FROM Writeoff w WHERE w.expiryRecord = e),0)
            ) 
            FROM ExpiryRecord e
            WHERE e.quantity - COALESCE((SELECT SUM(w.quantity) FROM Writeoff w WHERE w.expiryRecord = e),0) > 0
            ORDER BY e.expiryDate ASC
            """)
    List<DashboardRow> findActiveRecords();
}
