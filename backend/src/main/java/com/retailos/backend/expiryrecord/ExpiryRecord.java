package com.retailos.backend.expiryrecord;

import com.retailos.backend.product.Product;
import com.retailos.backend.user.AppUser;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "expiry_record")
public class ExpiryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(nullable = false)
    private int quantity;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private AppUser createdUser;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private AppUser updatedUser;

    public ExpiryRecord() {
    }

    public ExpiryRecord(Product product, LocalDate expiryDate, int quantity, AppUser createdUser) {
        this.product = product;
        this.expiryDate = expiryDate;
        this.quantity = quantity;
        this.createdUser = createdUser;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public AppUser getUpdatedUser() {
        return updatedUser;
    }

    public void setUpdatedUser(AppUser updatedUser) {
        this.updatedUser = updatedUser;
    }

    public Product getProduct() {
        return product;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public AppUser getCreatedUser() {
        return createdUser;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
