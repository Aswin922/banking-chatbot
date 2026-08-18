package com.banking.customer.service;

import com.banking.customer.dto.CustomerRequest;
import com.banking.customer.dto.CustomerResponse;
import com.banking.customer.entity.Customer;
import com.banking.customer.exception.CustomerNotFoundException;
import com.banking.customer.exception.DuplicateEmailException;
import com.banking.customer.repository.AuditLogRepository;
import com.banking.customer.repository.CustomerRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private CustomerServiceImpl customerService;

    private CustomerRequest validRequest;
    private Customer existingCustomer;

    @BeforeEach
    void setUp() {
        validRequest = new CustomerRequest();
        validRequest.setName("John Doe");
        validRequest.setEmail("john.doe@email.com");
        validRequest.setPhone("555-1234");
        validRequest.setAddress("123 Main St");

        existingCustomer = new Customer();
        existingCustomer.setCustomerId(1L);
        existingCustomer.setName("John Doe");
        existingCustomer.setEmail("john.doe@email.com");
        existingCustomer.setPhone("555-1234");
        existingCustomer.setAddress("123 Main St");
        existingCustomer.setStatus(Customer.CustomerStatus.ACTIVE);
    }

    @Test
    void createCustomer_WithValidData_ShouldSucceed() {
        // Arrange
        when(customerRepository.existsByEmail(validRequest.getEmail())).thenReturn(false);
        when(customerRepository.save(any(Customer.class))).thenReturn(existingCustomer);

        // Act
        CustomerResponse response = customerService.createCustomer(validRequest);

        // Assert
        assertNotNull(response);
        assertEquals("John Doe", response.getName());
        assertEquals("john.doe@email.com", response.getEmail());
        verify(customerRepository).save(any(Customer.class));
        verify(auditLogRepository).save(any());
    }

    @Test
    void createCustomer_WithDuplicateEmail_ShouldThrowException() {
        // Arrange
        when(customerRepository.existsByEmail(validRequest.getEmail())).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateEmailException.class, () -> {
            customerService.createCustomer(validRequest);
        });

        verify(customerRepository, never()).save(any());
    }

    @Test
    void getCustomerById_WithExistingId_ShouldReturnCustomer() {
        // Arrange
        when(customerRepository.findById(1L)).thenReturn(Optional.of(existingCustomer));

        // Act
        CustomerResponse response = customerService.getCustomerById(1L);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getCustomerId());
        assertEquals("John Doe", response.getName());
    }

    @Test
    void getCustomerById_WithNonExistingId_ShouldThrowException() {
        // Arrange
        when(customerRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(CustomerNotFoundException.class, () -> {
            customerService.getCustomerById(999L);
        });
    }

    @Test
    void updateCustomer_WithValidData_ShouldSucceed() {
        // Arrange
        CustomerRequest updateRequest = new CustomerRequest();
        updateRequest.setName("Jane Doe");
        updateRequest.setEmail("john.doe@email.com"); // Same email
        updateRequest.setPhone("555-5678");
        updateRequest.setAddress("456 Oak Ave");

        when(customerRepository.findById(1L)).thenReturn(Optional.of(existingCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(existingCustomer);

        // Act
        CustomerResponse response = customerService.updateCustomer(1L, updateRequest);

        // Assert
        assertNotNull(response);
        verify(customerRepository).save(any(Customer.class));
        verify(auditLogRepository).save(any());
    }

    @Test
    void updateCustomer_WithNewDuplicateEmail_ShouldThrowException() {
        // Arrange
        CustomerRequest updateRequest = new CustomerRequest();
        updateRequest.setName("Jane Doe");
        updateRequest.setEmail("jane.doe@email.com"); // Different email
        updateRequest.setPhone("555-5678");
        updateRequest.setAddress("456 Oak Ave");

        when(customerRepository.findById(1L)).thenReturn(Optional.of(existingCustomer));
        when(customerRepository.existsByEmail("jane.doe@email.com")).thenReturn(true);

        // Act & Assert
        assertThrows(DuplicateEmailException.class, () -> {
            customerService.updateCustomer(1L, updateRequest);
        });
    }

    @Test
    void deleteCustomer_ShouldSetStatusToInactive() {
        // Arrange
        when(customerRepository.findById(1L)).thenReturn(Optional.of(existingCustomer));
        when(customerRepository.save(any(Customer.class))).thenAnswer(invocation -> {
            Customer customer = invocation.getArgument(0);
            customer.setStatus(Customer.CustomerStatus.INACTIVE);
            return customer;
        });

        // Act
        CustomerResponse response = customerService.deleteCustomer(1L);

        // Assert
        assertNotNull(response);
        verify(customerRepository).save(argThat(customer ->
            customer.getStatus() == Customer.CustomerStatus.INACTIVE
        ));
        verify(auditLogRepository).save(any());
    }
}
