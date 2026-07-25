package com.retailos.backend.product;

public class ProductResponse {
    private String name;
    private String sku;
    private String barcode;

    public ProductResponse(String name, String sku, String barcode) {
        this.name = name;
        this.sku = sku;
        this.barcode = barcode;
    }

    public String getName() {
        return name;
    }

    public String getSku() {
        return sku;
    }

    public String getBarcode() {
        return barcode;
    }
}
