package com.retailos.backend.expiryrecord;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public enum Urgency {
    EXPIRED,
    WITHIN_3,
    WITHIN_7,
    WITHIN_14,
    LATER;

    public static Urgency findRemainingDays(LocalDate today, LocalDate expiryDate){
        long remainingDays = ChronoUnit.DAYS.between(today, expiryDate);
        if(remainingDays < 1){
            return EXPIRED;
        }else if(remainingDays <= 3){
            return WITHIN_3;
        }else if(remainingDays <= 7){
            return WITHIN_7;
        }else if(remainingDays <= 14){
            return WITHIN_14;
        }else{
            return LATER;
        }
    }
}
