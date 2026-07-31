package com.retailos.backend.expiryrecord;

import com.retailos.backend.product.Product;
import com.retailos.backend.product.ProductRepository;
import com.retailos.backend.user.AppUser;
import com.retailos.backend.user.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ExpiryRecordService{

    private final ExpiryRecordRepository expiryRecordRepository;

    private final ProductRepository productRepository;

    private final UserRepository userRepository;

    public ExpiryRecordService(ExpiryRecordRepository expiryRecordRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.expiryRecordRepository = expiryRecordRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CreateExpiryRecordResponse createExpiryRecord(CreateExpiryRecordRequest expiryRecordRequest){
        Optional<Product> product = productRepository.findByBarcode(expiryRecordRequest.barcode());
        AppUser user = userRepository.findById("TEST").orElseThrow(() -> new IllegalStateException("Seed user missing"));
        if(product.isPresent()){
            ExpiryRecord expiryRecord = new ExpiryRecord(product.get(), expiryRecordRequest.expiryDate(), expiryRecordRequest.quantity(), user);
            expiryRecordRepository.save(expiryRecord);
            return new CreateExpiryRecordResponse(product.get().getName(), expiryRecord.getExpiryDate(), expiryRecord.getQuantity());
        }
        else{
            // TODO: catch DataIntegrityViolation, re-fetch by barcode, retry
            if(expiryRecordRequest.productName() == null || expiryRecordRequest.productName().isBlank()){
                throw new IllegalArgumentException("Must give product name");
            }
            Product creatingProduct = new Product(expiryRecordRequest.productName(), expiryRecordRequest.barcode());
            productRepository.save(creatingProduct);
            ExpiryRecord expiryRecord = new ExpiryRecord(creatingProduct, expiryRecordRequest.expiryDate(), expiryRecordRequest.quantity(), user);
            expiryRecordRepository.save(expiryRecord);
            return new CreateExpiryRecordResponse(expiryRecordRequest.productName(), expiryRecord.getExpiryDate(), expiryRecord.getQuantity());
        }
    }
}
