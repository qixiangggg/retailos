package com.retailos.backend.writeoff;

import com.retailos.backend.expiryrecord.ExpiryRecord;
import com.retailos.backend.expiryrecord.ExpiryRecordNotFoundException;
import com.retailos.backend.expiryrecord.ExpiryRecordRepository;
import com.retailos.backend.user.AppUser;
import com.retailos.backend.user.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class WriteoffService {

    private final WriteoffRepository writeoffRepository;
    private final ExpiryRecordRepository expiryRecordRepository;
    private final UserRepository userRepository;

    public WriteoffService(WriteoffRepository writeoffRepository, ExpiryRecordRepository expiryRecordRepository, UserRepository userRepository) {
        this.writeoffRepository = writeoffRepository;
        this.expiryRecordRepository = expiryRecordRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CreateWriteoffResponse createWriteoff(CreateWriteoffRequest createWriteoffRequest){
        ExpiryRecord expiryRecord = expiryRecordRepository.findById(createWriteoffRequest.expiryRecordId()).orElseThrow(() -> new ExpiryRecordNotFoundException(createWriteoffRequest.expiryRecordId()));
        AppUser user = userRepository.findById("TEST").orElseThrow(() -> new IllegalStateException("Seed user missing"));
        Long totalQuantityByExpiryRecord = writeoffRepository.findTotalQuantityByExpiryRecord(expiryRecord.getId());
        // TODO [hardening]: read-then-insert race — needs pessimistic lock on ExpiryRecord or @Version bump; see notes
        if(totalQuantityByExpiryRecord + createWriteoffRequest.quantity() <= expiryRecord.getQuantity()){
            Writeoff writeoff = new Writeoff(expiryRecord, createWriteoffRequest.quantity(), createWriteoffRequest.reason(), user);
            writeoffRepository.save(writeoff);
            Long remainingQuantity = expiryRecord.getQuantity() - totalQuantityByExpiryRecord - writeoff.getQuantity();
            return new CreateWriteoffResponse(expiryRecord.getProduct().getSku(), expiryRecord.getProduct().getName(), writeoff.getQuantity(), writeoff.getReason(), remainingQuantity);
        }else{
            throw new IllegalArgumentException("The write-off quantity cannot be greater than the expiry record quantity, only " + (expiryRecord.getQuantity() - totalQuantityByExpiryRecord)  + " remaining.");
        }
    }
}
