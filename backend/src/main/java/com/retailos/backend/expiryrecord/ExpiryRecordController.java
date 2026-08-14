package com.retailos.backend.expiryrecord;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api/v1/expiry-records")
public class ExpiryRecordController {

    private final ExpiryRecordService expiryRecordService;
    private final Clock clock;

    public ExpiryRecordController(ExpiryRecordService expiryRecordService, Clock clock) {
        this.expiryRecordService = expiryRecordService;
        this.clock = clock;
    }

    @PostMapping
    public CreateExpiryRecordResponse createExpiryRecord(@Valid @RequestBody CreateExpiryRecordRequest createExpiryRecordRequest){
        return expiryRecordService.createExpiryRecord(createExpiryRecordRequest);
    }

    @GetMapping("/dashboard")
    public List<UrgencySection> getDashboard(){
        LocalDate currentDate = LocalDate.now(clock);
        return expiryRecordService.getDashboard(currentDate);
    }
}
