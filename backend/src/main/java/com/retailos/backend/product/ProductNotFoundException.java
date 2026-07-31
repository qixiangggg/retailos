package com.retailos.backend.product;

public class ProductNotFoundException extends RuntimeException{
    public ProductNotFoundException(String field, String value) {
        super("Product not Found with "+ field + ": " + value);
    }
}
