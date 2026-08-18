# Account Service

Bank account management microservice for the Banking Chatbot application.

## Overview

This service manages bank accounts including open, view, update, and close operations. It validates customer existence via customer-service and provides internal endpoints for transaction-service to query and update account balances.

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
- **customer-service must be running** on port 8081 (for customer validation)

## Database Setup

1. Start MySQL server
2. Create the database (or let Spring Boot create it automatically):
   ```sql
   CREATE DATABASE account_db;
   ```

3. Update database credentials in `src/main/resources/application.yml` if different from default:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/account_db
       username: root
       password: root
   ```

## Running the Service

### Using Maven

```bash
cd account-service
mvn clean install
mvn spring-boot:run
```

The service will start on **http://localhost:8082**

### Verify Service is Running

Check the health endpoint:
```bash
curl http://localhost:8082/actuator/health
```

## API Documentation

Once the service is running, access Swagger UI at:
```
http://localhost:8082/swagger-ui.html
```

## API Endpoints

### Base URL: `/api/v1/accounts`

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| POST | `/` | Create a new account | 201, 400, 404 |
| GET | `/` | Get all accounts (paginated, filterable by customer) | 200 |
| GET | `/{id}` | Get account by ID | 200, 404 |
| PUT | `/{id}` | Update account type or status | 200, 400, 404 |
| DELETE | `/{id}` | Close account (must have zero balance) | 200, 404, 409 |
| GET | `/{id}/balance` | Get account balance (internal) | 200, 404 |
| PATCH | `/{id}/balance` | Update account balance (internal) | 200, 400, 404, 409 |

### Sample API Calls

#### 1. Create Account
```bash
curl -X POST http://localhost:8082/api/v1/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "accountType": "SAVINGS",
    "initialDeposit": 5000.00
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "accountId": 51,
    "customerId": 1,
    "accountNumber": "ACC-7823",
    "accountType": "SAVINGS",
    "balance": 5000.00,
    "status": "ACTIVE",
    "openedDate": "2025-01-15T10:30:00",
    "updatedDate": "2025-01-15T10:30:00"
  },
  "message": "Account created successfully"
}
```

**Customer Not Found Error (400):**
```json
{
  "success": false,
  "message": "Customer validation failed: Customer ID 999 does not exist or is not active",
  "errors": null
}
```

#### 2. Get All Accounts (with customer filter)
```bash
curl "http://localhost:8082/api/v1/accounts?page=0&limit=10&customerId=1"
```

#### 3. Get Account by ID
```bash
curl http://localhost:8082/api/v1/accounts/1
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accountId": 1,
    "customerId": 1,
    "accountNumber": "ACC-1001",
    "accountType": "CHECKING",
    "balance": 2500.00,
    "status": "ACTIVE",
    "openedDate": "2025-01-15T08:00:00",
    "updatedDate": "2025-01-15T08:00:00"
  },
  "message": null
}
```

#### 4. Update Account
```bash
curl -X PUT http://localhost:8082/api/v1/accounts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "accountType": "SAVINGS",
    "status": "ACTIVE"
  }'
```

#### 5. Close Account (Delete)
```bash
curl -X DELETE http://localhost:8082/api/v1/accounts/45
```

**Error - Non-Zero Balance (409):**
```json
{
  "success": false,
  "message": "Cannot close: balance is $482.10, must be withdrawn first",
  "errors": null
}
```

#### 6. Get Balance (Internal Endpoint)
```bash
curl http://localhost:8082/api/v1/accounts/1/balance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accountId": 1,
    "balance": 2500.00,
    "status": "ACTIVE"
  },
  "message": null
}
```

#### 7. Update Balance (Internal Endpoint)
```bash
curl -X PATCH http://localhost:8082/api/v1/accounts/1/balance \
  -H "Content-Type: application/json" \
  -d '{
    "delta": -100.00,
    "transactionId": "TXN-12345"
  }'
```

## Validation Rules

- **customerId**: Required, must exist in customer-service and be ACTIVE
- **accountType**: Required, must be one of: `SAVINGS`, `CHECKING`, `FIXED`
- **initialDeposit**: Required, must be >= 0
- **accountNumber**: Auto-generated server-side (format: `ACC-XXXX`)

## Business Rules

1. Customer must exist and be ACTIVE (validated via customer-service call)
2. Account cannot be closed if balance is not zero
3. Balance updates must not result in negative balance (no overdraft)
4. Account status must be ACTIVE for balance updates
5. All changes are logged in account_log table

## Seed Data

The service automatically loads 50 sample accounts on startup, distributed across the 20 customers:
- Customer 1 has 3 accounts (checking, savings, fixed)
- Customer 19 has 1 CLOSED account (for testing)
- Customer 20 has 5 accounts including one FROZEN account (for testing)
- Other customers have 2-3 accounts each

## Inter-Service Communication

### Outgoing Calls
- **customer-service** (port 8081): Validates customer existence and status

### Incoming Calls (from transaction-service)
- `GET /api/v1/accounts/{id}/balance`: Query account balance
- `PATCH /api/v1/accounts/{id}/balance`: Apply transaction delta

## Running Tests

```bash
mvn test
```

## CORS Configuration

CORS is enabled for `http://localhost:4200` to support the Angular frontend.

## Troubleshooting

### customer-service Unreachable
- Ensure customer-service is running on port 8081
- Check `services.customer.base-url` in application.yml
- Account creation will fail if customer validation fails

### Account Number Collision
- Very rare with 4-digit random numbers
- Retries automatically until unique number is found

### Database Connection Issues
- Ensure MySQL is running
- Verify credentials in application.yml
- Check that account_db exists or set `createDatabaseIfNotExist=true` in JDBC URL

### Port Already in Use
- Change the port in application.yml:
  ```yaml
  server:
    port: 8082
  ```
