package com.retailos.backend.writeoff;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/v1/writeoffs")
public class WriteoffController {
    private final WriteoffService writeoffService;

    public WriteoffController(WriteoffService writeoffService) {
        this.writeoffService = writeoffService;
    }

    @PostMapping
    public CreateWriteoffResponse createWriteoff(@Valid @RequestBody CreateWriteoffRequest createWriteoffRequest){
        return writeoffService.createWriteoff(createWriteoffRequest);
    }
}
