# Customer Service

Customer management microservice for the Banking Chatbot application.

## Overview

This service manages customer records including create, read, update, and soft delete operations. It maintains an audit log of all changes and validates business rules.

## Technology Stack

- Java 17
- Spring Boot 3.2.5
- Spring Data JPA
- MySQL 8.x
- Maven
- SpringDoc OpenAPI (Swagger UI)

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.x running on localhost:3306
- MySQL root credentials (username: root, password: root) or update application.yml

## Database Setup

1. Start MySQL server
2. Create the database (or let Spring Boot create it automatically):
   ```sql
   CREATE DATABASE customer_db;
   ```

3. Update database credentials in `src/main/resources/application.yml` if different from default:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/customer_db
       username: root
       password: root
   ```

## Running the Service

### Using Maven

```bash
cd customer-service
mvn clean install
mvn spring-boot:run
```

The service will start on **http://localhost:8081**

### Verify Service is Running

Check the health endpoint:
```bash
curl http://localhost:8081/actuator/health
```

## API Documentation

Once the service is running, access Swagger UI at:
```
http://localhost:8081/swagger-ui.html
```

## API Endpoints

### Base URL: `/api/v1/customers`

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| POST | `/` | Create a new customer | 201, 400, 409 |
| GET | `/` | Get all customers (paginated, searchable) | 200 |
| GET | `/{id}` | Get customer by ID | 200, 404 |
| PUT | `/{id}` | Update customer | 200, 400, 404, 409 |
| DELETE | `/{id}` | Soft delete customer (set to INACTIVE) | 200, 404, 409 |

### Sample API Calls

#### 1. Create Customer
```bash
curl -X POST http://localhost:8081/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice.johnson@email.com",
    "phone": "555-9999",
    "address": "789 Elm St, Seattle, WA"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "customerId": 21,
    "name": "Alice Johnson",
    "email": "alice.johnson@email.com",
    "phone": "555-9999",
    "address": "789 Elm St, Seattle, WA",
    "status": "ACTIVE",
    "createdDate": "2025-01-15T10:30:00",
    "updatedDate": "2025-01-15T10:30:00"
  },
  "message": "Customer created successfully"
}
```

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

**Duplicate Email Error (409):**
```json
{
  "success": false,
  "message": "Email already exists: alice.johnson@email.com",
  "errors": [
    {
      "field": "email",
      "message": "Email already exists: alice.johnson@email.com"
    }
  ]
}
```

#### 2. Get All Customers (Paginated)
```bash
curl "http://localhost:8081/api/v1/customers?page=0&limit=10"
```

#### 3. Search Customers
```bash
curl "http://localhost:8081/api/v1/customers?page=0&limit=10&search=john"
```

#### 4. Get Customer by ID
```bash
curl http://localhost:8081/api/v1/customers/1
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "customerId": 1,
    "name": "John Smith",
    "email": "john.smith@email.com",
    "phone": "555-0101",
    "address": "123 Main St, New York, NY 10001",
    "status": "ACTIVE",
    "createdDate": "2025-01-15T08:00:00",
    "updatedDate": "2025-01-15T08:00:00"
  },
  "message": null
}
```

**Not Found Error (404):**
```json
{
  "success": false,
  "message": "Customer not found with ID: 999",
  "errors": null
}
```

#### 5. Update Customer
```bash
curl -X PUT http://localhost:8081/api/v1/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith Updated",
    "email": "john.smith@email.com",
    "phone": "555-0101",
    "address": "123 Main St, New York, NY 10001"
  }'
```

#### 6. Delete Customer (Soft Delete)
```bash
curl -X DELETE http://localhost:8081/api/v1/customers/19
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "customerId": 19,
    "name": "Christopher Martin",
    "email": "christopher.martin@email.com",
    "phone": "555-0119",
    "address": "579 Cherry Pl, Denver, CO 80201",
    "status": "INACTIVE",
    "createdDate": "2025-01-15T08:00:00",
    "updatedDate": "2025-01-15T10:45:00"
  },
  "message": "Customer deactivated successfully"
}
```

## Validation Rules

- **Name**: Required, 2-150 characters
- **Email**: Required, valid email format, unique across all customers
- **Phone**: Required, 7-30 characters, digits and formatting characters only
- **Address**: Optional, max 255 characters

## Business Rules

1. Email must be unique across all customers
2. Customer cannot be deactivated if they have active accounts (checked via account-service)
3. Delete operation is soft delete (sets status to INACTIVE)
4. All changes are logged in audit_log table

## Seed Data

The service automatically loads 20 sample customers on startup. One customer (ID 19) is pre-set to INACTIVE status for testing purposes.

## Running Tests

```bash
mvn test
```

## CORS Configuration

CORS is enabled for `http://localhost:4200` to support the Angular frontend.

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Verify credentials in application.yml
- Check that customer_db exists or set `createDatabaseIfNotExist=true` in JDBC URL

### Port Already in Use
- Change the port in application.yml:
  ```yaml
  server:
    port: 8081
  ```

### Integration with Account Service
- The service attempts to call account-service before deactivating customers
- If account-service is not available, a warning is logged but the operation continues
- In production, you may want to make this check mandatory
