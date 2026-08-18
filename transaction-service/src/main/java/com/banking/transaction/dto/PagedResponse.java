package com.banking.transaction.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {

    private List<T> transactions;
    private long total;
    private int page;
    private int limit;
    private long totalPages;

    public PagedResponse(List<T> transactions, long total, int page, int limit) {
        this.transactions = transactions;
        this.total = total;
        this.page = page;
        this.limit = limit;
        this.totalPages = (long) Math.ceil((double) total / limit);
    }
}
