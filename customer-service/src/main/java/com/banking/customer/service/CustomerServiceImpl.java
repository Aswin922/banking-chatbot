package com.banking.customer.service;

import com.banking.customer.dto.CustomerRequest;
import com.banking.customer.dto.CustomerResponse;
import com.banking.customer.dto.PagedResponse;
import com.banking.customer.entity.AuditLog;
import com.banking.customer.entity.Customer;
import com.banking.customer.exception.BusinessRuleException;
import com.banking.customer.exception.CustomerNotFoundException;
import com.banking.customer.exception.DuplicateEmailException;
import com.banking.customer.repository.AuditLogRepository;
import com.banking.customer.repository.CustomerRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${services.account.base-url}")
    private String accountServiceUrl;

    @Override
    public CustomerResponse createCustomer(CustomerRequest request) {
        // Check for duplicate email
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        // Create new customer
        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setStatus(Customer.CustomerStatus.ACTIVE);

        Customer savedCustomer = customerRepository.save(customer);

        // Log the creation
        createAuditLog(savedCustomer.getCustomerId(), AuditLog.AuditAction.CREATE, null, savedCustomer);

        return CustomerResponse.fromEntity(savedCustomer);
    }

    @Override
    public PagedResponse<CustomerResponse> getAllCustomers(int page, int limit, String search) {
        Pageable pageable = PageRequest.of(page, limit, Sort.by(Sort.Direction.DESC, "createdDate"));

        Page<Customer> customerPage;
        if (search != null && !search.trim().isEmpty()) {
            customerPage = customerRepository.findBySearch(search, pageable);
        } else {
            customerPage = customerRepository.findAll(pageable);
        }

        List<CustomerResponse> customers = customerPage.getContent()
                .stream()
                .map(CustomerResponse::fromEntity)
                .collect(Collectors.toList());

        return new PagedResponse<>(customers, customerPage.getTotalElements(), page, limit);
    }

    @Override
    public CustomerResponse getCustomerById(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(customerId));

        return CustomerResponse.fromEntity(customer);
    }

    @Override
    public CustomerResponse updateCustomer(Long customerId, CustomerRequest request) {
        Customer existingCustomer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(customerId));

        // Keep old values for audit
        Customer oldCustomer = copyCustomer(existingCustomer);

        // Check for duplicate email if email is being changed
        if (!existingCustomer.getEmail().equals(request.getEmail())) {
            if (customerRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateEmailException(request.getEmail());
            }
        }

        // Update customer
        existingCustomer.setName(request.getName());
        existingCustomer.setEmail(request.getEmail());
        existingCustomer.setPhone(request.getPhone());
        existingCustomer.setAddress(request.getAddress());

        Customer updatedCustomer = customerRepository.save(existingCustomer);

        // Log the update
        createAuditLog(updatedCustomer.getCustomerId(), AuditLog.AuditAction.UPDATE, oldCustomer, updatedCustomer);

        return CustomerResponse.fromEntity(updatedCustomer);
    }

    @Override
    public CustomerResponse deleteCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(customerId));

        // Check if customer has active accounts
        // TODO: Enable this check when account-service is fully integrated
        try {
            checkActiveAccounts(customerId);
        } catch (Exception e) {
            // If account-service is not reachable, log warning and proceed
            // In production, you might want to fail the operation instead
            System.err.println("Warning: Could not verify accounts for customer " + customerId + ": " + e.getMessage());
        }

        // Keep old values for audit
        Customer oldCustomer = copyCustomer(customer);

        // Soft delete - set status to INACTIVE
        customer.setStatus(Customer.CustomerStatus.INACTIVE);
        Customer deletedCustomer = customerRepository.save(customer);

        // Log the deletion
        createAuditLog(deletedCustomer.getCustomerId(), AuditLog.AuditAction.DELETE, oldCustomer, deletedCustomer);

        return CustomerResponse.fromEntity(deletedCustomer);
    }

    private void checkActiveAccounts(Long customerId) {
        try {
            String url = accountServiceUrl + "/accounts?customerId=" + customerId + "&page=0&limit=1";
            // This will call account-service to check if customer has active accounts
            // For now, this is a placeholder - will be fully implemented when account-service is ready
            // If there are active accounts, throw BusinessRuleException
        } catch (Exception e) {
            // Rethrow if it's a business rule violation
            if (e instanceof BusinessRuleException) {
                throw e;
            }
            // Otherwise, log and continue (service might not be available yet)
            throw new BusinessRuleException("Cannot verify accounts: Account service unavailable");
        }
    }

    private void createAuditLog(Long customerId, AuditLog.AuditAction action, Customer oldCustomer, Customer newCustomer) {
        AuditLog auditLog = new AuditLog();
        auditLog.setCustomerId(customerId);
        auditLog.setAction(action);
        auditLog.setChangedBy("SYSTEM"); // In a real app, get from security context

        try {
            if (oldCustomer != null) {
                auditLog.setOldValues(objectMapper.writeValueAsString(toMap(oldCustomer)));
            }
            if (newCustomer != null) {
                auditLog.setNewValues(objectMapper.writeValueAsString(toMap(newCustomer)));
            }
        } catch (JsonProcessingException e) {
            // Log error but don't fail the main operation
            System.err.println("Error creating audit log JSON: " + e.getMessage());
        }

        auditLogRepository.save(auditLog);
    }

    private Customer copyCustomer(Customer customer) {
        Customer copy = new Customer();
        copy.setCustomerId(customer.getCustomerId());
        copy.setName(customer.getName());
        copy.setEmail(customer.getEmail());
        copy.setPhone(customer.getPhone());
        copy.setAddress(customer.getAddress());
        copy.setStatus(customer.getStatus());
        copy.setCreatedDate(customer.getCreatedDate());
        copy.setUpdatedDate(customer.getUpdatedDate());
        return copy;
    }

    private Map<String, Object> toMap(Customer customer) {
        Map<String, Object> map = new HashMap<>();
        map.put("customerId", customer.getCustomerId());
        map.put("name", customer.getName());
        map.put("email", customer.getEmail());
        map.put("phone", customer.getPhone());
        map.put("address", customer.getAddress());
        map.put("status", customer.getStatus().name());
        return map;
    }
}
