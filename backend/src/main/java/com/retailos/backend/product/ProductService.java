package com.retailos.backend.product;

import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductResponse getProductByBarcode(String barcode){
        Product product =  productRepository.findByBarcode(barcode).orElseThrow(() -> new RuntimeException("Product not found with barcode: " + barcode));;
        return new ProductResponse(product.getName(), product.getSku(), product.getBarcode());
    }
}
