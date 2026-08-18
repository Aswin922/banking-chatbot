# Banking Services Chatbot - Angular Frontend

A rule-based, menu-driven conversational UI for managing banking operations (customers, accounts, and transactions) through a chat interface.

## 🎯 Project Overview

This is **NOT an AI chatbot**. There is no LLM, no NLP, no intent detection. It's a **finite state machine** that guides users through structured flows via:
- **Numbered/tappable options** for menus
- **Turn-by-turn field collection** with validation
- **Confirmation screens** before API calls
- **Client-side validation** with friendly error messages

The conversation logic is defined as **flow definitions** (see below) that the conversation engine interprets.

## 🏗️ Architecture

### Core Components

```
src/app/
├── core/
│   ├── models/           # TypeScript interfaces
│   ├── services/         # HTTP services (Customer, Account, Transaction)
│   └── conversation/
│       ├── conversation-engine.service.ts  # State machine interpreter
│       ├── flow-definitions.ts             # All 12 conversation flows
│       └── validators.ts                   # Client-side validation library
├── chat/
│   ├── chat-window.component.*       # Main chat interface
│   ├── chat-message.component.*      # Individual message bubbles
│   └── chat-options.component.*      # Tappable button options
└── environments/
    └── environment.ts                # Backend API base URLs
```

### 12 Conversation Flows

| Entity | Operations |
|--------|-----------|
| **Customer** | View, Create, Update, Delete (deactivate) |
| **Account** | View, Create, Update, Delete (close) |
| **Transaction** | View, Create, Update, Delete (void) |

Each flow is defined in `flow-definitions.ts` as a sequence of steps.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend services running (customer-service on 8081, account-service on 8082, transaction-service on 8083)

### Installation

```bash
cd banking-chatbot-ui
npm install
```

### Running the Application

```bash
npm start
```

The application will open at **http://localhost:4200**

### Building for Production

```bash
npm run build
```

Output will be in `dist/banking-chatbot-ui/`

## ⚙️ Configuration

### Backend URLs

Edit `src/app/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrls: {
    customer: 'http://localhost:8081/api/v1',
    account: 'http://localhost:8082/api/v1',
    transaction: 'http://localhost:8083/api/v1'
  }
};
```

For production, update `environment.prod.ts` with your deployed backend URLs.

### CORS Requirements

The backend services must enable CORS for `http://localhost:4200` (already configured in the backend services).

## 📝 Flow Definition Format

Flows are defined as arrays of steps in `flow-definitions.ts`. Each step has a `type` that determines its behavior:

### Step Types

#### 1. MENU
Shows tappable options to the user.

```typescript
{
  type: 'MENU',
  question: 'What would you like to do?',
  options: [
    { label: '👤 Manage Customers', value: 'customers', nextFlow: 'CUSTOMER_VIEW' },
    { label: '💳 Manage Accounts', value: 'accounts', nextFlow: 'ACCOUNT_VIEW' }
  ]
}
```

**Options**:
- `label`: Display text (can include emojis)
- `value`: Internal value passed to the engine
- `nextFlow`: (optional) Flow to transition to
- `nextStep`: (optional) Step index to jump to

#### 2. PROMPT
Asks for user input with validation.

```typescript
{
  type: 'PROMPT',
  field: 'name',
  question: "What's the customer's full name?",
  validate: v.required(2, 150),
  optional: false
}
```

**Validation Functions** (`validators.ts`):
- `required(min, max)` - Non-empty string with length bounds
- `email()` - Valid email format
- `phone()` - Phone number with formatting characters
- `numeric()` - Any number
- `positive()` - Number > 0
- `nonNegative()` - Number >= 0
- `integer()` - Whole number
- `positiveInteger()` - Whole number > 0
- `oneOf([...])` - Value must be in array
- `optional(min, max)` - Can be "skip" or empty

#### 3. CONFIRM
Shows a summary of collected data with Confirm/Cancel buttons.

```typescript
{
  type: 'CONFIRM',
  question: 'Please confirm the details:',
  summaryFields: ['name', 'email', 'phone', 'address']
}
```

#### 4. API_CALL
Executes a backend API call.

```typescript
{
  type: 'API_CALL',
  action: 'createCustomer'
}
```

**Actions** map to service methods in the conversation engine:
- `listCustomers`, `getCustomerById`, `createCustomer`, `updateCustomer`, `deleteCustomer`
- `listAccounts`, `getAccountById`, `createAccount`, `updateAccount`, `deleteAccount`
- `listTransactions`, `getTransactionById`, `createTransaction`, `updateTransaction`, `voidTransaction`

#### 5. SEARCH
Prompts for search input and fetches results.

```typescript
{
  type: 'SEARCH',
  action: 'searchCustomers',
  question: 'Enter name, email, or ID to search:'
}
```

#### 6. SELECT
Displays search results as tappable options.

```typescript
{
  type: 'SELECT',
  question: 'Select a customer to update:'
}
```

#### 7. RESULT
Final step showing success/error and return options.

```typescript
{
  type: 'RESULT',
  resultMessage: 'Customer created successfully!'
}
```

### Complete Flow Example

```typescript
export const CUSTOMER_CREATE_FLOW: FlowStep[] = [
  { type: 'PROMPT', field: 'name', question: "Customer's name?", validate: v.required(2, 150) },
  { type: 'PROMPT', field: 'email', question: "Email?", validate: v.email() },
  { type: 'PROMPT', field: 'phone', question: "Phone?", validate: v.phone() },
  { type: 'PROMPT', field: 'address', question: "Address (or 'skip')?", validate: v.optional(), optional: true },
  { type: 'CONFIRM', summaryFields: ['name', 'email', 'phone', 'address'] },
  { type: 'API_CALL', action: 'createCustomer' },
  { type: 'RESULT', resultMessage: 'Customer created!' }
];
```

## 🔧 Adding New Flows

To add a new flow:

1. **Define the flow** in `flow-definitions.ts`:
```typescript
export const MY_NEW_FLOW: FlowStep[] = [
  // ... your steps
];
```

2. **Register it** in the `FLOW_DEFINITIONS` map:
```typescript
export const FLOW_DEFINITIONS: Record<FlowType, FlowStep[]> = {
  // ... existing flows
  MY_NEW_FLOW: MY_NEW_FLOW
};
```

3. **Add the flow type** to `conversation-state.model.ts`:
```typescript
export type FlowType =
  | 'MAIN_MENU'
  | 'MY_NEW_FLOW'  // Add here
  | ...;
```

4. **Add API action** in `conversation-engine.service.ts` if needed:
```typescript
private getApiCall(action: string): Observable<any> {
  switch (action) {
    case 'myNewAction':
      return this.myService.doSomething();
    // ...
  }
}
```

No changes needed to the UI components - the flow interpreter handles everything!

## 🧪 Testing

### Run Unit Tests

```bash
npm test
```

Tests are provided for:
- **Validators** (`validators.spec.ts`) - All validation functions
- **Conversation Engine** (can be extended for state transitions)

### Manual Testing

1. Start the backend services
2. Run `npm start`
3. Walk through each flow:
   - Try valid inputs
   - Try invalid inputs (test validation)
   - Test "skip" for optional fields
   - Test "cancel" and "back" commands
   - Test cross-entity flows (Account → Customer, Transaction → Account)

## 📖 Usage Guide

### Quick Commands

Available at any time:
- `menu` or `cancel` - Return to main menu
- `back` - Go back one step
- `skip` - Skip optional fields

### Navigation

1. **Start**: You'll see the main menu with 3 options (Customers, Accounts, Transactions)
2. **Select entity**: Tap or type the option number
3. **Select operation**: View, Create, Update, or Delete
4. **Follow prompts**: Answer one question at a time
5. **Validation**: Invalid inputs show friendly error messages - just try again
6. **Confirm**: Review your data before submission
7. **Result**: See the outcome and choose to continue or go back

### Cross-Entity Flows

**Creating an Account** requires a Customer:
- You can type a known customer ID
- Or search for the customer first (bot will guide you)
- The selected customer ID is carried forward automatically

**Creating a Transaction** requires an Account:
- Same pattern as above - ID or search
- Account must be ACTIVE

### Error Handling

- **Client-side validation**: Catches format/type errors immediately
- **Server-side validation**: Shows field-level error messages from the backend
- **Business rule errors**: Clear messages (e.g., "Cannot close account with non-zero balance")
- **Network errors**: Graceful fallback messages

## 🎨 Customization

### Styling

Global styles: `src/styles.scss`
Component styles: Each component has its own `.scss` file

The chat uses a purple gradient theme. To change:
1. Update colors in component `.scss` files
2. Look for `#667eea` and `#764ba2` (primary gradient colors)

### Validation Messages

Edit messages in `validators.ts`:
```typescript
if (!result.valid) {
  return { valid: false, message: 'Your custom message here' };
}
```

### Bot Personality

Edit greeting and messages in:
- `conversation-engine.service.ts` - Initial greeting in `startConversation()`
- `flow-definitions.ts` - Question text in each step

## 📦 Project Structure Details

### Models
- `api-response.model.ts` - Backend response envelope
- `customer/account/transaction.model.ts` - Domain entities
- `conversation-state.model.ts` - Flow and state machine types

### Services
- `customer/account/transaction.service.ts` - HTTP calls to backend
- `conversation-engine.service.ts` - State machine interpreter

### Chat Components
- `chat-window` - Main container, input box, header
- `chat-message` - Individual message bubble (bot/user)
- `chat-options` - Button group for menu options

## 🐛 Troubleshooting

### Backend Connection Failed
- Verify backend services are running (ports 8081, 8082, 8083)
- Check environment.ts URLs
- Ensure CORS is enabled on backends

### Validation Errors Not Showing
- Check browser console for errors
- Verify validators are imported and used in flow definitions

### Flow Not Advancing
- Check if the current step type is implemented in conversation engine
- Verify action names match in flow definitions and engine switch statement

### Messages Not Scrolling
- Known issue in some browsers - check `chat-window.component.ts` scroll logic

## 📊 Performance

- Client-side only app - fast and responsive
- Lazy-loaded modules (if you add routing)
- Optimized builds with Angular CLI
- Production build ~300KB gzipped

## 🔐 Security Notes

- No authentication implemented (add JWT tokens as needed)
- All security handled by backend services
- Never trust client-side validation alone - backend must validate too

## 📄 License

This is a training project for the Claude Champion Program.

## 🙋 Support

For issues or questions:
1. Check this README
2. Review flow-definitions.ts
3. Check browser console for errors
4. Verify backend services are operational

---

**Built with Angular 18+ Standalone Components**
**No NgModules, clean and modern architecture**
