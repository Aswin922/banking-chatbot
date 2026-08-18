package com.banking.customer.service;

import com.banking.customer.dto.CustomerRequest;
import com.banking.customer.dto.CustomerResponse;
import com.banking.customer.dto.PagedResponse;

public interface CustomerService {

    CustomerResponse createCustomer(CustomerRequest request);

    PagedResponse<CustomerResponse> getAllCustomers(int page, int limit, String search);

    CustomerResponse getCustomerById(Long customerId);

    CustomerResponse updateCustomer(Long customerId, CustomerRequest request);

    CustomerResponse deleteCustomer(Long customerId);
}
