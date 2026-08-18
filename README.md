# Banking Chatbot - Microservices Backend + Angular Frontend

A complete rule-based banking chatbot system with three Spring Boot microservices and an Angular frontend. This is **not** an AI/LLM chatbot — it's a menu-driven conversational interface over REST APIs.

## 📋 Project Description

Users interact with a chatbot UI that provides structured, turn-by-turn flows for managing:
- **Customers** — create, view, update, and deactivate customer records
- **Accounts** — open, view, update, and close bank accounts
- **Transactions** — create, view, update (metadata only), and void transactions

The backend consists of three independent Spring Boot microservices, each with its own MySQL database. The Angular frontend uses a finite state machine to guide users through 12 conversation flows.

## 🏗️ Architecture

| Service | Port | MySQL Schema | Purpose |
|---------|------|--------------|---------|
| **customer-service** | 9081 | `customer_db` | Customer CRUD operations |
| **account-service** | 9082 | `account_db` | Account management + balance operations |
| **transaction-service** | 9083 | `transaction_db` | Transaction management + voiding |
| **banking-chatbot-ui** | 4200 | N/A | Angular chatbot interface |

### Service Dependencies

```
transaction-service
    ↓ (validates account, updates balance)
account-service
    ↓ (validates customer)
customer-service
    (no dependencies)
```

**Start order**: customer-service → account-service → transaction-service → Angular app

## ⚙️ Prerequisites

- **Java 17+** — for backend services
- **Maven 3.6+** — for building backend
- **Node.js 18+ / npm** — for Angular frontend
- **MySQL 8.x** — running on `localhost:3306`

## 🚀 Running the Project Locally

### 1. Start MySQL

Ensure MySQL is running on port 3306. The databases (`customer_db`, `account_db`, `transaction_db`) will be created automatically on first run.

**Current credentials** (hardcoded in `application.yml` files):
- Username: `root`
- Password: `root@39`

> ⚠️ **Known gap**: Database credentials are in plaintext. Update each service's `src/main/resources/application.yml` if your MySQL credentials differ.

### 2. Start Backend Services (in order)

Open **three terminal windows** and run:

#### Terminal 1 — Customer Service
```bash
cd customer-service
mvn clean install
mvn spring-boot:run
```
Service starts on **http://localhost:9081**

#### Terminal 2 — Account Service (wait for customer-service to be ready)
```bash
cd account-service
mvn clean install
mvn spring-boot:run
```
Service starts on **http://localhost:9082**

#### Terminal 3 — Transaction Service (wait for account-service to be ready)
```bash
cd transaction-service
mvn clean install
mvn spring-boot:run
```
Service starts on **http://localhost:9083**

### 3. Verify Backend Health

```bash
curl http://localhost:9081/actuator/health
curl http://localhost:9082/actuator/health
curl http://localhost:9083/actuator/health
```

All should return `{"status":"UP"}`.

### 4. Start Angular Frontend

In a **fourth terminal**:
```bash
cd banking-chatbot-ui
npm install
npm start
```

The chatbot UI opens at **http://localhost:4200**

## 📚 API Documentation

Each service exposes Swagger UI for interactive API testing:

- Customer Service: http://localhost:9081/swagger-ui.html
- Account Service: http://localhost:9082/swagger-ui.html
- Transaction Service: http://localhost:9083/swagger-ui.html

For manual API testing, see [`api-collection.http`](api-collection.http) — note that it still references **old ports (8081/8082/8083)**; update to 9081/9082/9083 before use.

## 📂 Detailed Documentation

Each service has its own README with endpoint-level details:

- [customer-service/README.md](customer-service/README.md) — Customer API endpoints, validation rules, seed data
- [account-service/README.md](account-service/README.md) — Account API endpoints, balance operations, business rules
- [transaction-service/README.md](transaction-service/README.md) — *(does not exist yet)*
- [banking-chatbot-ui/README.md](banking-chatbot-ui/README.md) — Frontend architecture, conversation flows, state machine

## 🧪 Seed Data

Each service comes pre-loaded with test data (SQL init mode set to `never` — data is already loaded):

- **customer-service**: 20 customers (19 ACTIVE, 1 INACTIVE for testing deletion)
- **account-service**: 50 accounts across customers (48 ACTIVE, 1 CLOSED, 1 FROZEN)
- **transaction-service**: 100 transactions with realistic categories

You can test all CRUD flows immediately without manual data setup.

## 🔍 Business Rules Enforced

### Customer Service
- Email must be unique
- Cannot deactivate a customer who has active accounts *(note: currently a soft warning, not a hard block)*
- Delete operation is **soft delete** (sets status to INACTIVE)

### Account Service
- Customer must exist and be ACTIVE before creating an account
- Account number is auto-generated (format: `ACC-XXXX`)
- Cannot close an account with a non-zero balance

### Transaction Service
- Account must exist and be ACTIVE
- Debits cannot overdraw the account (balance must stay ≥ 0)
- Only `description` and `category` fields can be updated; `amount` and `type` are immutable
- Void operation reverses the balance and logs the void reason

## ⚠️ Known Gaps

1. **No authentication or authorization** — all endpoints are open; no user roles or permissions.
2. **Database credentials in plaintext** — stored directly in `application.yml` files.
3. **Account closure with active accounts** — the check exists but is a warning, not a hard block; the operation can still proceed.
4. **Port mismatches** — `api-collection.http` and the Angular UI's `environment.ts` still reference old ports (8081/8082/8083) instead of current ones (9081/9082/9083).
5. **No transaction-service README** — the service is functional but lacks dedicated documentation.

## 🐛 Troubleshooting

### Services won't start
- Check if MySQL is running: `mysql -u root -p`
- Verify ports 9081/9082/9083 are not in use
- Confirm database credentials match `application.yml` (`root`/`root@39`)

### Inter-service communication fails
- Start services **in order**: customer → account → transaction
- Verify no firewall is blocking localhost traffic
- Check logs for `RestTemplate` or connection errors

### Angular app can't reach backend
- Ensure all three backend services are running and healthy
- Check browser console for CORS errors
- Verify Angular is using the correct backend URLs in `src/environments/environment.ts`

## 📄 License

This is a training project for the Claude Champion Program.

---

**Project Status**: All three backend services and the Angular frontend are functional and ready for integration testing. Known gaps are documented above.
