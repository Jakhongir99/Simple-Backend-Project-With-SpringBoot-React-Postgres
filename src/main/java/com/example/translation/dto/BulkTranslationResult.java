package com.example.translation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkTranslationResult {
    private int totalRequested;
    private int created;
    private int skipped;
    private int errors;
    
    public boolean hasNewTranslations() {
        return created > 0;
    }
    
    public boolean hasErrors() {
        return errors > 0;
    }
}
