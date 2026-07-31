package com.retailos.backend.product;

import com.retailos.backend.expiryrecord.ExpiryRecord;
import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, insertable = false, updatable = false, name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "sku", unique = true)
    private String sku;

    @Column(nullable = false, unique = true)
    private String barcode;

    @OneToMany(mappedBy = "product")
    private List<ExpiryRecord> expiryRecords = new ArrayList<>();

    public Product() {
    }

    public Product(String name, String barcode) {
        this.name = name;
        this.barcode = barcode;
    }

    public Product(String name, String sku, String barcode) {
        this.name = name;
        this.sku = sku;
        this.barcode = barcode;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getSku() {
        return sku;
    }

    public void setSku(String sku) {
        this.sku = sku;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Product product = (Product) o;
        return id != null && id.equals(product.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
