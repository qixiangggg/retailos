package com.retailos.backend.product;

public class ProductNotFoundException extends RuntimeException{
    public ProductNotFoundException(String message) {
        super("Product Not Found" + message);
    }
}
