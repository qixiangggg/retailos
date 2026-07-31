package com.retailos.backend.product;

import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductResponse getProductByBarcode(String barcode){
        Product product =  productRepository.findByBarcode(barcode).orElseThrow(() -> new ProductNotFoundException(" with barcode " + barcode));;
        return new ProductResponse(product.getName(), product.getSku(), product.getBarcode());
    }
}
