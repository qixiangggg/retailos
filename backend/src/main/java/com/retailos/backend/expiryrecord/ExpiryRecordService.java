package com.retailos.backend.expiryrecord;

import com.retailos.backend.product.Product;
import com.retailos.backend.product.ProductRepository;
import com.retailos.backend.user.AppUser;
import com.retailos.backend.user.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

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

    public List<UrgencySection> getDashboard(LocalDate today){
        List<DashboardRow> dashboardRows =  expiryRecordRepository.findActiveRecords();
        Map<Urgency, List<DashboardRow>> grouped =  dashboardRows.stream().collect(Collectors.groupingBy(
                r -> Urgency.findRemainingDays(today,r.expiryDate()),
                () -> new EnumMap<Urgency, List<DashboardRow>>(Urgency.class),
                Collectors.toList()));
        List<UrgencySection> urgencySections =  Arrays.stream(
                Urgency.values()).map(
                        elem -> {
                            var items = grouped.getOrDefault(elem, List.of());
                            return new UrgencySection(elem, items.size(), items);
                        }).toList();
        return urgencySections;
    }
}
