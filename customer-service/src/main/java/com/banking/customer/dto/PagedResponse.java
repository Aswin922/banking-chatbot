package com.banking.customer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {

    private List<T> customers;
    private long total;
    private int page;
    private int limit;
    private long totalPages;

    public PagedResponse(List<T> customers, long total, int page, int limit) {
        this.customers = customers;
        this.total = total;
        this.page = page;
        this.limit = limit;
        this.totalPages = (long) Math.ceil((double) total / limit);
    }
}
