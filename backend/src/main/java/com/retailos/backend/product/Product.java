package com.retailos.backend.product;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.Objects;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, insertable = false, updatable = false)
    private OffsetDateTime created_at;

    @Column(name = "sku", nullable = false, unique = true)
    private String SKU;

    @Column(nullable = false, unique = true)
    private String barcode;

    public Product() {
    }

    public Product(String id, String name, OffsetDateTime created_at, String SKU, String barcode) {
        this.id = id;
        this.name = name;
        this.created_at = created_at;
        this.SKU = SKU;
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

    public OffsetDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(OffsetDateTime created_at) {
        this.created_at = created_at;
    }

    public String getSKU() {
        return SKU;
    }

    public void setSKU(String SKU) {
        this.SKU = SKU;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Product product = (Product) o;
        return Objects.equals(id, product.id) && Objects.equals(name, product.name) && Objects.equals(created_at, product.created_at) && Objects.equals(SKU, product.SKU) && Objects.equals(barcode, product.barcode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, created_at, SKU, barcode);
    }
}
