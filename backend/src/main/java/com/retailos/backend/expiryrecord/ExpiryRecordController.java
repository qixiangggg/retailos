package com.retailos.backend.expiryrecord;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/expiry-records")
public class ExpiryRecordController {

    private final ExpiryRecordService expiryRecordService;

    public ExpiryRecordController(ExpiryRecordService expiryRecordService) {
        this.expiryRecordService = expiryRecordService;
    }

    @PostMapping
    public CreateExpiryRecordResponse createExpiryRecord(@Valid @RequestBody CreateExpiryRecordRequest createExpiryRecordRequest){
        return expiryRecordService.createExpiryRecord(createExpiryRecordRequest);
    }
}
