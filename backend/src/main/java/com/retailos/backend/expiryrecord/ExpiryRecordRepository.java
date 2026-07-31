package com.retailos.backend.expiryrecord;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpiryRecordRepository extends JpaRepository<ExpiryRecord, String> {
}
