package com.retailos.backend.writeoff;

import com.retailos.backend.expiryrecord.ExpiryRecord;
import com.retailos.backend.user.AppUser;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.Objects;

@Entity
@Table(name = "writeoff")
public class Writeoff {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expiry_record_id")
    private ExpiryRecord expiryRecord;

    @Column(nullable = false)
    private int quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WriteoffReason reason;

    @CreationTimestamp
    @Column(name = "writeoff_at", nullable = false)
    private OffsetDateTime writeoffAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "writeoff_by")
    private AppUser writeoffUser;

    public Writeoff(ExpiryRecord expiryRecord, int quantity, WriteoffReason reason, AppUser writeoffUser) {
        this.expiryRecord = expiryRecord;
        this.quantity = quantity;
        this.reason = reason;
        this.writeoffUser = writeoffUser;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ExpiryRecord getExpiryRecord() {
        return expiryRecord;
    }

    public void setExpiryRecord(ExpiryRecord expiryRecord) {
        this.expiryRecord = expiryRecord;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public WriteoffReason getReason() {
        return reason;
    }

    public void setReason(WriteoffReason reason) {
        this.reason = reason;
    }

    public OffsetDateTime getWriteoffAt() {
        return writeoffAt;
    }

    public void setWriteoffAt(OffsetDateTime writeoffAt) {
        this.writeoffAt = writeoffAt;
    }

    public AppUser getWriteoffUser() {
        return writeoffUser;
    }

    public void setWriteoffUser(AppUser writeoffUser) {
        this.writeoffUser = writeoffUser;
    }

    @Override
    public boolean equals(Object o) {
        if(this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Writeoff writeoff = (Writeoff) o;
        return id != null && id.equals(writeoff.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
