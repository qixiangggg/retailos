package com.retailos.backend.writeoff;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface WriteoffRepository extends JpaRepository<Writeoff, String> {
    @Query("""
            SELECT COALESCE(SUM(w.quantity),0)
            FROM Writeoff w
            WHERE w.expiryRecord.id = :expiryRecordId
            """)
    Long findTotalQuantityByExpiryRecord(String expiryRecordId);
}
