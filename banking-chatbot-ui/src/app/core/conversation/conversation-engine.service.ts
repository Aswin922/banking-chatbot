import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { ConversationState, FlowStep, FlowType, ChatMessage, MenuOption } from '../models/conversation-state.model';
import { FLOW_DEFINITIONS } from './flow-definitions';
import { CustomerService } from '../services/customer.service';
import { AccountService } from '../services/account.service';
import { TransactionService } from '../services/transaction.service';
import { ApiError } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ConversationEngineService {
  private customerService = inject(CustomerService);
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);

  private stateSubject = new BehaviorSubject<ConversationState>({
    currentFlow: 'MAIN_MENU',
    step: 0,
    collectedData: {}
  });

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);

  public state$ = this.stateSubject.asObservable();
  public messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.startConversation();
  }

  /**
   * Initialize the conversation with a welcome message
   */
  private startConversation(): void {
    this.addBotMessage('Welcome to Banking Services! Let me help you today.');
    this.executeCurrentStep();
  }

  /**
   * Get the current flow definition
   */
  private getCurrentFlow(): FlowStep[] {
    const state = this.stateSubject.value;
    return FLOW_DEFINITIONS[state.currentFlow];
  }

  /**
   * Get the current step in the flow
   */
  private getCurrentStep(): FlowStep | undefined {
    const flow = this.getCurrentFlow();
    const state = this.stateSubject.value;
    return flow[state.step];
  }

  /**
   * Execute the current step
   */
  private executeCurrentStep(): void {
    const step = this.getCurrentStep();
    if (!step) {
      this.addBotMessage('Something went wrong. Returning to main menu...');
      this.goToMainMenu();
      return;
    }

    switch (step.type) {
      case 'MENU':
        this.handleMenuStep(step);
        break;
      case 'PROMPT':
        this.handlePromptStep(step);
        break;
      case 'CONFIRM':
        this.handleConfirmStep(step);
        break;
      case 'API_CALL':
        this.handleApiCallStep(step);
        break;
      case 'RESULT':
        this.handleResultStep(step);
        break;
      case 'SEARCH':
        this.handleSearchStep(step);
        break;
      case 'SELECT':
        this.handleSelectStep(step);
        break;
    }
  }

  /**
   * Handle MENU step - show options to user
   */
  private handleMenuStep(step: FlowStep): void {
    const options = step.options || [];
    this.addBotMessage(step.question || 'Please select an option:', options);
  }

  /**
   * Handle PROMPT step - ask for user input
   */
  private handlePromptStep(step: FlowStep): void {
    const state = this.stateSubject.value;
    const currentValue = step.field ? state.collectedData[step.field] : undefined;

    let question = step.question || 'Please provide a value:';

    // If updating and there's a current value, show it
    if (currentValue && state.currentFlow.includes('UPDATE')) {
      question += ` (Current: ${currentValue})`;
    }

    // For optional fields, add Skip button but keep input enabled
    if (step.optional) {
      const options: MenuOption[] = [
        { label: '⏭️ Skip (Keep current)', value: 'skip' }
      ];
      this.addBotMessageWithInput(question, options);
    } else {
      this.addBotMessage(question);
    }
  }

  /**
   * Handle CONFIRM step - show summary and ask for confirmation
   */
  private handleConfirmStep(step: FlowStep): void {
    const state = this.stateSubject.value;
    let summaryFields = step.summaryFields || Object.keys(state.collectedData);

    // For transfers, include source and destination accounts in summary
    if (state.collectedData['type'] === 'TRANSFER') {
      summaryFields = [...summaryFields];
      // Add source account at the beginning
      if (!summaryFields.includes('accountIdentifier') && state.collectedData['accountIdentifier']) {
        summaryFields.unshift('accountIdentifier');
      }
      // Add destination account after type
      if (!summaryFields.includes('destinationAccountIdentifier') && state.collectedData['destinationAccountIdentifier']) {
        const typeIndex = summaryFields.indexOf('type');
        summaryFields.splice(typeIndex + 1, 0, 'destinationAccountIdentifier');
      }
    }

    let summary = step.question || 'Please confirm:';
    summary += '\n\n';

    summaryFields.forEach(field => {
      const value = state.collectedData[field];
      if (value && value !== 'skip') {
        summary += `• ${this.formatFieldName(field)}: ${value}\n`;
      }
    });

    const options: MenuOption[] = [
      { label: '✅ Confirm', value: 'confirm' },
      { label: '❌ Cancel', value: 'cancel' }
    ];

    this.addBotMessage(summary, options);
  }

  /**
   * Handle API_CALL step - make the API request
   */
  private handleApiCallStep(step: FlowStep): void {
    const action = step.action;
    if (!action) {
      this.addBotMessage('Error: No action specified');
      return;
    }

    // Show loading indicator
    this.setLoading(true);
    this.addBotMessage('Processing...', [], true);

    const apiCall = this.getApiCall(action);

    apiCall.pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        this.handleApiError(error);
        return throwError(() => error);
      })
    ).subscribe({
      next: (response) => this.handleApiSuccess(response),
      error: () => {} // Error already handled in catchError
    });
  }

  /**
   * Handle RESULT step - show final result
   */
  private handleResultStep(step: FlowStep): void {
    const state = this.stateSubject.value;
    const message = step.resultMessage || 'Operation completed!';

    const options: MenuOption[] = [];

    // Add entity-specific back button
    const currentFlow = state.currentFlow;
    if (currentFlow.includes('CUSTOMER')) {
      options.push({ label: '🔙 Customer Management', value: 'back' });
    } else if (currentFlow.includes('ACCOUNT')) {
      options.push({ label: '🔙 Account Management', value: 'back' });
    } else if (currentFlow.includes('TRANSACTION')) {
      options.push({ label: '🔙 Transaction Management', value: 'back' });
    } else {
      options.push({ label: '🔙 Go Back', value: 'back' });
    }

    options.push({ label: '🏠 Main Menu', value: 'menu', nextFlow: 'MAIN_MENU' });

    this.addBotMessage(message, options);
  }

  /**
   * Handle SEARCH step - prompt for search and execute
   */
  private handleSearchStep(step: FlowStep): void {
    this.addBotMessage(step.question || 'Enter search term:');
  }

  /**
   * Handle SELECT step - show search results and let user pick
   */
  private handleSelectStep(step: FlowStep): void {
    const state = this.stateSubject.value;
    const results = state.searchResults || [];

    if (results.length === 0) {
      this.addBotMessage('No results found. Please try again or go back to the menu.');
      const options: MenuOption[] = [
        { label: '🔙 Go Back', value: 'back' }
      ];
      this.addBotMessage('What would you like to do?', options);
      return;
    }

    const options: MenuOption[] = results.map((item, index) => {
      const label = this.formatSearchResult(item);
      return { label, value: index.toString() };
    });

    options.push({ label: '🔙 Go Back', value: 'back' });

    this.addBotMessage(step.question || 'Select from results:', options);
  }

  /**
   * Process user input
   */
  public processUserInput(input: string): void {
    const state = this.stateSubject.value;
    const step = this.getCurrentStep();

    if (!step) return;

    // Add user message to chat
    this.addUserMessage(input);

    // Handle special commands
    if (input.toLowerCase() === 'menu' || input.toLowerCase() === 'cancel') {
      this.goToMainMenu();
      return;
    }

    if (input.toLowerCase() === 'back') {
      // For UPDATE/CREATE/DELETE flows, go to the VIEW flow (management menu)
      // For VIEW flows, go to step 0 (which is the management menu)
      const state = this.stateSubject.value;
      if (state.currentFlow.includes('_CREATE') ||
          state.currentFlow.includes('_UPDATE') ||
          state.currentFlow.includes('_DELETE')) {
        this.goToViewFlow();
      } else {
        this.goToStep(0);
      }
      return;
    }

    // Handle pagination commands
    if (input.startsWith('page:')) {
      this.handlePaginationCommand(input);
      return;
    }

    switch (step.type) {
      case 'MENU':
        this.processMenuSelection(input);
        break;
      case 'PROMPT':
        this.processPromptInput(input, step);
        break;
      case 'CONFIRM':
        this.processConfirmSelection(input);
        break;
      case 'SEARCH':
        this.processSearchInput(input, step);
        break;
      case 'SELECT':
        this.processSelectInput(input);
        break;
      case 'RESULT':
        this.processResultSelection(input);
        break;
    }
  }

  /**
   * Process menu option selection
   */
  private processMenuSelection(input: string): void {
    // Handle special retry command
    if (input.toLowerCase() === 'retry') {
      this.goBack();
      return;
    }

    const step = this.getCurrentStep();
    const options = step?.options || [];

    const selectedOption = options.find(opt =>
      opt.value.toString() === input || opt.label.toLowerCase().includes(input.toLowerCase())
    );

    if (!selectedOption) {
      this.addBotMessage('Invalid selection. Please choose from the options.');
      this.executeCurrentStep();
      return;
    }

    // Store the selection if it has a field
    if (step?.field) {
      this.updateCollectedData(step.field, selectedOption.value);
    }

    // Transition to next flow or step
    if (selectedOption.nextFlow) {
      this.transitionToFlow(selectedOption.nextFlow);
    } else if (selectedOption.nextStep !== undefined) {
      this.goToStep(selectedOption.nextStep);
    } else {
      this.advanceStep();
    }
  }

  /**
   * Process prompt input with validation
   */
  private processPromptInput(input: string, step: FlowStep): void {
    // Handle skip for optional fields
    if (step.optional && (input.toLowerCase() === 'skip' || input.trim() === '')) {
      // Don't update collectedData - keep the original value
      // Just advance to the next step
      this.advanceStep();
      return;
    }

    // Validate input
    if (step.validate) {
      const result = step.validate(input);
      if (!result.valid) {
        this.addBotMessage(result.message || 'Invalid input. Please try again.');
        this.executeCurrentStep();
        return;
      }
    }

    // Store the input
    if (step.field) {
      this.updateCollectedData(step.field, input);
    }

    // Special handling for direct transaction ID entry in UPDATE/DELETE flows
    const state = this.stateSubject.value;
    const isUpdateOrDeleteFlow = state.currentFlow.includes('_UPDATE') || state.currentFlow.includes('_DELETE');

    if (step.field === 'transactionId' && isUpdateOrDeleteFlow) {
      const transactionId = Number(input);
      this.setLoading(true);
      this.addBotMessage('Loading transaction...', [], true);

      this.transactionService.getTransactionById(transactionId).pipe(
        tap(() => this.setLoading(false)),
        catchError((error) => {
          this.setLoading(false);
          this.handleApiError(error);
          return of(null);
        })
      ).subscribe({
        next: (response) => {
          if (response && response.success && response.data) {
            this.removeLastMessageIfLoading();
            const currentState = this.stateSubject.value;

            // Store the transaction data
            this.updateState({
              ...currentState,
              selectedEntityId: response.data['transactionId'],
              collectedData: { ...currentState.collectedData, ...response.data }
            });

            // Skip to step 5 (the update/delete prompts) - skip accountIdentifier, listTransactions, and SELECT
            const flow = this.getCurrentFlow();
            const targetStep = 5; // Step 5 is the first prompt after SELECT
            if (targetStep < flow.length) {
              this.updateState({ ...this.stateSubject.value, step: targetStep });
              this.executeCurrentStep();
            }
          }
        }
      });
      return; // Don't call advanceStep() - we're handling navigation above
    }

    this.advanceStep();
  }

  /**
   * Process confirm/cancel selection
   */
  private processConfirmSelection(input: string): void {
    if (input.toLowerCase() === 'confirm') {
      this.advanceStep();
    } else {
      this.addBotMessage('Operation cancelled. Returning to menu...');
      this.goToMainMenu();
    }
  }

  /**
   * Process search input
   */
  private processSearchInput(input: string, step: FlowStep): void {
    if (!step.action) return;

    // Detect input type: number (ID), email pattern, account number, or name
    const trimmedInput = input.trim();
    const isNumeric = /^\d+$/.test(trimmedInput);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);
    const isAccountNumber = /^ACC-\d+$/i.test(trimmedInput);

    // Handle account number search (e.g., ACC-1010)
    if (isAccountNumber && step.action === 'searchAccounts') {
      this.searchByAccountNumber(trimmedInput.toUpperCase());
      return;
    }

    // If it's a number, treat it differently based on action
    if (isNumeric) {
      const id = Number(trimmedInput);

      // For customer search: direct ID lookup
      if (step.action === 'searchCustomers') {
        this.setLoading(true);
        this.addBotMessage('Loading...', [], true);
        const apiCall = this.customerService.getCustomerById(id);

        apiCall.pipe(
          tap(() => this.setLoading(false)),
          catchError((error) => {
            this.setLoading(false);
            this.handleApiError(error);
            return of(null);
          })
        ).subscribe({
          next: (response) => {
            if (response && response.success && response.data) {
              this.removeLastMessageIfLoading();
              const state = this.stateSubject.value;

              // Store the entity
              const idField = this.getEntityIdField(state.currentFlow);
              const entityData = response.data as any;
              this.updateState({
                ...state,
                selectedEntityId: entityData[idField],
                collectedData: { ...state.collectedData, ...response.data }
              });

              // For VIEW flows, display details and skip to end
              if (state.currentFlow.includes('_VIEW')) {
                this.displayEntityDetails(response.data);
                const flow = this.getCurrentFlow();
                this.updateState({ ...this.stateSubject.value, step: flow.length - 1 });
              } else {
                // For UPDATE/DELETE flows, skip SEARCH and SELECT steps
                const flow = this.getCurrentFlow();
                let nextStepIndex = state.step + 1;

                // Skip SELECT step if it's the next step
                if (nextStepIndex < flow.length && flow[nextStepIndex].type === 'SELECT') {
                  nextStepIndex++;
                }

                this.updateState({ ...this.stateSubject.value, step: nextStepIndex });
                this.executeCurrentStep();
              }
            }
          }
        });
        return;
      }

      // For account search: treat number as CUSTOMER ID (not account ID)
      if (step.action === 'searchAccounts') {
        this.setLoading(true);
        this.addBotMessage('Searching accounts for customer...', [], true);
        const apiCall = this.getSearchCall(step.action, trimmedInput);

        apiCall.pipe(
          tap(() => this.setLoading(false)),
          catchError((error) => {
            this.setLoading(false);
            this.handleApiError(error);
            return of(null);
          })
        ).subscribe({
          next: (response) => {
            if (response) {
              this.handleSearchResults(response);
            }
          }
        });
        return;
      }
    }

    // Otherwise, perform a search (name or email)
    this.setLoading(true);
    this.addBotMessage('Searching...', [], true);

    const searchCall = this.getSearchCall(step.action, trimmedInput);

    searchCall.pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        this.handleApiError(error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          this.handleSearchResults(response);
        }
      }
    });
  }

  /**
   * Search by account number (client-side filtering)
   */
  private searchByAccountNumber(accountNumber: string): void {
    this.setLoading(true);
    this.addBotMessage('Searching...', [], true);

    // Get all accounts and filter by account number
    this.accountService.getAllAccounts(0, 100).pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        this.handleApiError(error);
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response && response.success && response.data) {
          const allAccounts = response.data.accounts || [];

          // Filter by account number
          const matchingAccounts = allAccounts.filter((acc: any) =>
            acc['accountNumber'] && acc['accountNumber'].toUpperCase() === accountNumber
          );

          if (matchingAccounts.length === 0) {
            this.removeLastMessageIfLoading();
            this.addBotMessage(`No account found with number ${accountNumber}.`);
            const options: MenuOption[] = [
              { label: '🔄 Try Again', value: 'retry' },
              { label: '🏠 Main Menu', value: 'menu' }
            ];
            this.addBotMessage('What would you like to do?', options);
            return;
          }

          // Create a response that looks like a search result
          const searchResponse = {
            success: true,
            data: {
              accounts: matchingAccounts,
              total: matchingAccounts.length,
              page: 0,
              limit: matchingAccounts.length,
              totalPages: 1
            }
          };

          this.removeLastMessageIfLoading();
          this.handleSearchResults(searchResponse);
        }
      }
    });
  }

  /**
   * Handle pagination commands (next/prev page)
   */
  private handlePaginationCommand(input: string): void {
    const state = this.stateSubject.value;
    const command = input.split(':')[1];

    if (!state.lastListAction) {
      this.addBotMessage('No list to paginate.');
      return;
    }

    let newPage = state.currentPage || 0;

    if (command === 'next' && newPage < (state.totalPages || 1) - 1) {
      newPage++;
    } else if (command === 'prev' && newPage > 0) {
      newPage--;
    } else {
      this.addBotMessage('Cannot navigate to that page.');
      return;
    }

    // Show loading indicator
    this.setLoading(true);
    this.addBotMessage('Loading...', [], true);

    // Fetch the new page
    const apiCall = this.getApiCall(state.lastListAction, newPage);

    apiCall.pipe(
      tap(() => this.setLoading(false)),
      catchError((error) => {
        this.setLoading(false);
        this.handleApiError(error);
        return throwError(() => error);
      })
    ).subscribe({
      next: (response) => {
        this.removeLastMessageIfLoading();
        if (response && response.success && response.data) {
          this.displayListResults(response.data);
        }
      },
      error: () => {
        // Error already handled
      }
    });
  }

  /**
   * Process selection from search results
   */
  private processSelectInput(input: string): void {
    if (input.toLowerCase() === 'back') {
      this.goBack();
      return;
    }

    const state = this.stateSubject.value;
    const results = state.searchResults || [];
    const index = parseInt(input);

    if (isNaN(index) || index < 0 || index >= results.length) {
      this.addBotMessage('Invalid selection. Please choose a number from the list.');
      this.executeCurrentStep();
      return;
    }

    const selected = results[index];
    const step = this.getCurrentStep();

    // Store the selected entity
    if (step?.field) {
      // If field is specified, store specific property
      if (step.field === 'customerId') {
        this.updateCollectedData('customerId', selected['customerId']);
      } else if (step.field === 'accountId') {
        this.updateCollectedData('accountId', selected['accountId']);
        // Also store the account number for API calls
        this.updateCollectedData('accountIdentifier', selected['accountNumber']);
      } else if (step.field === 'destinationAccountId') {
        this.updateCollectedData('destinationAccountId', selected['accountId']);
        // Also store the account number for display and API calls
        this.updateCollectedData('destinationAccountIdentifier', selected['accountNumber']);
      }

      // For CREATE flows with account selection, skip the PROMPT step
      const flow = this.getCurrentFlow();
      let nextStepIndex = state.step + 1;

      if (state.currentFlow.includes('_CREATE') &&
          nextStepIndex < flow.length &&
          flow[nextStepIndex].type === 'PROMPT' &&
          (flow[nextStepIndex].field === 'accountIdentifier' ||
           flow[nextStepIndex].field === 'destinationAccountIdentifier')) {
        nextStepIndex++;
      }

      this.updateState({ ...this.stateSubject.value, step: nextStepIndex });
      this.executeCurrentStep();
    } else {
      // Check if this is an UPDATE or DELETE flow
      const isUpdateOrDeleteFlow = state.currentFlow.includes('_UPDATE') || state.currentFlow.includes('_DELETE');

      if (isUpdateOrDeleteFlow) {
        // For UPDATE/DELETE flows, store the entire entity and continue
        const idField = this.getEntityIdField(state.currentFlow);
        this.updateState({
          ...state,
          selectedEntityId: selected[idField],
          collectedData: { ...state.collectedData, ...selected }
        });

        // Advance to next step (prompt for updates or confirmation)
        this.advanceStep();
      } else {
        // For VIEW flows, display the selected entity details
        const idField = this.getEntityIdField(state.currentFlow);
        this.updateState({
          ...state,
          selectedEntityId: selected[idField],
          collectedData: { ...state.collectedData, ...selected }
        });

        // Display entity details
        this.displayEntityDetails(selected);

        // Skip to end of flow (RESULT step)
        const flow = this.getCurrentFlow();
        this.updateState({ ...this.stateSubject.value, step: flow.length - 1 });
      }
    }
  }

  /**
   * Process result screen selection
   */
  private processResultSelection(input: string): void {
    if (input.toLowerCase() === 'menu') {
      this.goToMainMenu();
    } else if (input.toLowerCase() === 'back') {
      this.goToViewFlow();
    }
  }

  /**
   * Get the appropriate API call based on action
   */
  private getApiCall(action: string, page?: number): Observable<any> {
    const state = this.stateSubject.value;
    const data = state.collectedData;
    const currentPage = page !== undefined ? page : (state.currentPage || 0);
    const pageSize = state.pageSize || 10;

    switch (action) {
      // Customer actions
      case 'listCustomers':
        // Store the action for pagination
        this.updateState({ ...state, lastListAction: action });
        return this.customerService.getAllCustomers(currentPage, pageSize);
      case 'getCustomerById':
        return this.customerService.getCustomerById(Number(data['customerId']));
      case 'createCustomer':
        return this.customerService.createCustomer({
          name: data['name'],
          email: data['email'],
          phone: data['phone'],
          address: data['address']
        });
      case 'updateCustomer':
        return this.customerService.updateCustomer(state.selectedEntityId!, {
          name: data['name'],
          email: data['email'],
          phone: data['phone'],
          address: data['address']
        });
      case 'deleteCustomer':
        return this.customerService.deleteCustomer(state.selectedEntityId!);

      // Account actions
      case 'listAccounts':
        this.updateState({ ...state, lastListAction: action });
        return this.accountService.getAllAccounts(currentPage, pageSize);
      case 'listAccountsByCustomer':
        this.updateState({ ...state, lastListAction: action });
        return this.accountService.getAllAccounts(currentPage, pageSize, Number(data['customerId']));
      case 'getAccountById':
        return this.accountService.getAccountById(Number(data['accountId']));
      case 'createAccount':
        return this.accountService.createAccount({
          customerId: Number(data['customerId']),
          accountType: data['accountType'],
          initialDeposit: Number(data['initialDeposit'])
        });
      case 'updateAccount':
        const updateData: any = {};
        if (data['accountType'] && data['accountType'] !== 'skip') updateData.accountType = data['accountType'];
        if (data['status'] && data['status'] !== 'skip') updateData.status = data['status'];
        return this.accountService.updateAccount(state.selectedEntityId!, updateData);
      case 'deleteAccount':
        return this.accountService.deleteAccount(state.selectedEntityId!);

      // Transaction actions
      case 'listTransactions':
        this.updateState({ ...state, lastListAction: action });
        const accountIdentifier = data['accountIdentifier'] || data['accountId'];

        // Check if it's an account number (ACC-XXXX) or numeric ID
        if (/^ACC-\d+$/i.test(accountIdentifier)) {
          // It's an account number - need to look up the account ID first
          return this.accountService.getAllAccounts(0, 100).pipe(
            switchMap((accountsResponse: any) => {
              if (accountsResponse && accountsResponse.success && accountsResponse.data) {
                const allAccounts = accountsResponse.data.accounts || [];
                const matchingAccount = allAccounts.find((acc: any) =>
                  acc['accountNumber'] && acc['accountNumber'].toUpperCase() === accountIdentifier.toUpperCase()
                );

                if (matchingAccount) {
                  const accountId = matchingAccount['accountId'];
                  return this.transactionService.getAllTransactions(accountId, currentPage, pageSize);
                } else {
                  return throwError(() => new Error(`Account ${accountIdentifier} not found`));
                }
              }
              return throwError(() => new Error('Failed to fetch accounts'));
            })
          );
        } else {
          // It's a numeric account ID
          return this.transactionService.getAllTransactions(Number(accountIdentifier), currentPage, pageSize);
        }
      case 'getTransactionById':
        return this.transactionService.getTransactionById(Number(data['transactionId']));
      case 'createTransaction':
        const createAccountIdentifier = data['accountIdentifier'] || data['accountId'];
        const transactionType = data['type'];

        // For TRANSFER, we need to look up both source and destination accounts
        if (transactionType === 'TRANSFER') {
          const destAccountIdentifier = data['destinationAccountIdentifier'] || data['destinationAccountId'];

          // Look up both accounts
          return this.accountService.getAllAccounts(0, 100).pipe(
            switchMap((accountsResponse: any) => {
              if (accountsResponse && accountsResponse.success && accountsResponse.data) {
                const allAccounts = accountsResponse.data.accounts || [];

                // Find source account
                let sourceAccountId: number;
                if (/^ACC-\d+$/i.test(createAccountIdentifier)) {
                  const sourceAccount = allAccounts.find((acc: any) =>
                    acc['accountNumber'] && acc['accountNumber'].toUpperCase() === createAccountIdentifier.toUpperCase()
                  );
                  if (!sourceAccount) {
                    return throwError(() => new Error(`Source account ${createAccountIdentifier} not found`));
                  }
                  sourceAccountId = sourceAccount['accountId'];
                } else {
                  sourceAccountId = Number(createAccountIdentifier);
                }

                // Find destination account
                let destAccountId: number;
                if (/^ACC-\d+$/i.test(destAccountIdentifier)) {
                  const destAccount = allAccounts.find((acc: any) =>
                    acc['accountNumber'] && acc['accountNumber'].toUpperCase() === destAccountIdentifier.toUpperCase()
                  );
                  if (!destAccount) {
                    return throwError(() => new Error(`Destination account ${destAccountIdentifier} not found`));
                  }
                  destAccountId = destAccount['accountId'];
                } else {
                  destAccountId = Number(destAccountIdentifier);
                }

                // Create DEBIT transaction for source account
                return this.transactionService.createTransaction({
                  accountId: sourceAccountId,
                  type: 'DEBIT',
                  amount: Number(data['amount']),
                  description: data['description'] || `Transfer to ${destAccountIdentifier}`,
                  category: data['category']
                }).pipe(
                  switchMap(() => {
                    // Create CREDIT transaction for destination account
                    return this.transactionService.createTransaction({
                      accountId: destAccountId,
                      type: 'CREDIT',
                      amount: Number(data['amount']),
                      description: data['description'] || `Transfer from ${createAccountIdentifier}`,
                      category: data['category']
                    });
                  })
                );
              }
              return throwError(() => new Error('Failed to fetch accounts'));
            })
          );
        }

        // For DEBIT/CREDIT, handle normally
        // Check if it's an account number (ACC-XXXX) or numeric ID
        if (/^ACC-\d+$/i.test(createAccountIdentifier)) {
          // It's an account number - need to look up the account ID first
          return this.accountService.getAllAccounts(0, 100).pipe(
            switchMap((accountsResponse: any) => {
              if (accountsResponse && accountsResponse.success && accountsResponse.data) {
                const allAccounts = accountsResponse.data.accounts || [];
                const matchingAccount = allAccounts.find((acc: any) =>
                  acc['accountNumber'] && acc['accountNumber'].toUpperCase() === createAccountIdentifier.toUpperCase()
                );

                if (matchingAccount) {
                  const accountId = matchingAccount['accountId'];
                  return this.transactionService.createTransaction({
                    accountId: accountId,
                    type: data['type'],
                    amount: Number(data['amount']),
                    description: data['description'],
                    category: data['category']
                  });
                } else {
                  return throwError(() => new Error(`Account ${createAccountIdentifier} not found`));
                }
              }
              return throwError(() => new Error('Failed to fetch accounts'));
            })
          );
        } else {
          // It's a numeric account ID
          return this.transactionService.createTransaction({
            accountId: Number(createAccountIdentifier),
            type: data['type'],
            amount: Number(data['amount']),
            description: data['description'],
            category: data['category']
          });
        }
      case 'updateTransaction':
        const txnUpdateData: any = {};
        if (data['description'] && data['description'] !== 'skip') txnUpdateData.description = data['description'];
        if (data['category'] && data['category'] !== 'skip') txnUpdateData.category = data['category'];
        return this.transactionService.updateTransaction(state.selectedEntityId!, txnUpdateData);
      case 'voidTransaction':
        return this.transactionService.voidTransaction(state.selectedEntityId!, {
          voidReason: data['voidReason']
        });

      default:
        return throwError(() => new Error('Unknown action: ' + action));
    }
  }

  /**
   * Get search API call
   */
  private getSearchCall(action: string, searchTerm: string): Observable<any> {
    switch (action) {
      case 'searchCustomers':
        return this.customerService.searchCustomers(searchTerm);
      case 'searchAccounts':
        const customerId = searchTerm ? Number(searchTerm) : undefined;
        return this.accountService.searchAccounts(customerId);
      default:
        return throwError(() => new Error('Unknown search action: ' + action));
    }
  }

  /**
   * Handle API success response
   */
  private handleApiSuccess(response: any): void {
    const state = this.stateSubject.value;

    // Remove loading message
    this.removeLastMessageIfLoading();

    // Check response format
    if (!response || !response.success) {
      this.addBotMessage('Operation failed. Please try again.');
      return;
    }

    let isListResult = false;
    let isViewOperation = state.currentFlow.includes('_VIEW');
    let isUpdateOrDeleteFlow = state.currentFlow.includes('_UPDATE') || state.currentFlow.includes('_DELETE');

    // Display results based on data type
    if (response.data) {
      if (Array.isArray(response.data.customers) ||
          Array.isArray(response.data.accounts) ||
          Array.isArray(response.data.transactions)) {

        // For UPDATE/DELETE flows, store results in searchResults BEFORE displaying
        // so SELECT step can access them
        if (isUpdateOrDeleteFlow) {
          const items = response.data.customers || response.data.accounts || response.data.transactions || [];
          this.updateState({ ...state, searchResults: items });
        }

        // Paginated list response
        this.displayListResults(response.data);
        isListResult = true;
      } else if (isViewOperation) {
        // Single entity response in a VIEW flow - show details with navigation
        this.displayEntityDetails(response.data);
      }
      // For CREATE/UPDATE/DELETE flows, don't show entity details - just success message
    }

    // Determine if we should advance to next step:
    // - CREATE operations: advance after API call to show RESULT
    // - UPDATE/DELETE with list: advance to SELECT step (list is intermediate)
    // - VIEW operations with list: don't advance (list is final, has nav buttons)
    const shouldAdvance = (!isListResult && !isViewOperation) || (isListResult && isUpdateOrDeleteFlow);

    if (shouldAdvance) {
      this.advanceStep();
    }
    // Note: For CREATE/UPDATE/DELETE, we don't show response.message here
    // because the RESULT step will show its own success message
  }

  /**
   * Handle search results
   */
  private handleSearchResults(response: any): void {
    this.removeLastMessageIfLoading();

    if (!response || !response.success || !response.data) {
      this.addBotMessage('No results found. Please try a different search term.');
      const options: MenuOption[] = [
        { label: '🔄 Try Again', value: 'retry' },
        { label: '🏠 Main Menu', value: 'menu' }
      ];
      this.addBotMessage('What would you like to do?', options);
      return;
    }

    const data = response.data;
    const results = data.customers || data.accounts || data.transactions || [];

    if (results.length === 0) {
      this.addBotMessage('No results found. Please try a different search term.');
      const options: MenuOption[] = [
        { label: '🔄 Try Again', value: 'retry' },
        { label: '🏠 Main Menu', value: 'menu' }
      ];
      this.addBotMessage('What would you like to do?', options);
      return;
    }

    // If only one result, auto-select it
    if (results.length === 1) {
      const selected = results[0];
      const state = this.stateSubject.value;

      // Store the selected entity ID and data
      const idField = this.getEntityIdField(state.currentFlow);
      this.updateState({
        ...state,
        selectedEntityId: selected[idField],
        collectedData: { ...state.collectedData, ...selected }
      });

      // For VIEW flows, display details and skip to end
      if (state.currentFlow.includes('_VIEW')) {
        this.displayEntityDetails(selected);
        const flow = this.getCurrentFlow();
        this.updateState({ ...this.stateSubject.value, step: flow.length - 1 });
        return;
      }

      // For UPDATE/DELETE/CREATE flows, skip SEARCH and SELECT steps
      const flow = this.getCurrentFlow();
      let nextStepIndex = state.step + 1;

      // Skip SELECT step if it's the next step
      if (nextStepIndex < flow.length && flow[nextStepIndex].type === 'SELECT') {
        nextStepIndex++;
      }

      // For CREATE flows, also skip any PROMPT steps (account identifier prompts)
      if (state.currentFlow.includes('_CREATE') &&
          nextStepIndex < flow.length &&
          flow[nextStepIndex].type === 'PROMPT' &&
          (flow[nextStepIndex].field === 'accountIdentifier' ||
           flow[nextStepIndex].field === 'destinationAccountIdentifier')) {
        nextStepIndex++;
      }

      this.updateState({ ...this.stateSubject.value, step: nextStepIndex });
      this.executeCurrentStep();
      return;
    }

    // Multiple results - proceed to SELECT step
    this.updateState({
      ...this.stateSubject.value,
      searchResults: results
    });

    this.advanceStep();
  }

  /**
   * Handle API error
   */
  private handleApiError(error: any): void {
    this.removeLastMessageIfLoading();

    const apiError: ApiError = error.error;

    if (apiError && apiError.errors && apiError.errors.length > 0) {
      // Validation errors
      const errorMessages = apiError.errors.map(e => `• ${e.field}: ${e.message}`).join('\n');
      this.addBotMessage(`Validation failed:\n${errorMessages}\n\nPlease try again.`);
    } else if (apiError && apiError.message) {
      this.addBotMessage(`Error: ${apiError.message}`);
    } else {
      this.addBotMessage('An error occurred. Please try again.');
    }
  }

  /**
   * Display list results
   */
  private displayListResults(data: any): void {
    const items = data.customers || data.accounts || data.transactions || [];
    const page = data.page !== undefined ? data.page : 0;
    const limit = data.limit || data.size || items.length;
    const totalPages = data.totalPages || 1;
    const totalElements = data.total || items.length;

    if (items.length === 0) {
      this.addBotMessage('No records found.');
      return;
    }

    // Determine entity type
    let entityType: 'customer' | 'account' | 'transaction' = 'customer';
    if (data.accounts) entityType = 'account';
    else if (data.transactions) entityType = 'transaction';

    // Update state with pagination info
    const state = this.stateSubject.value;
    this.updateState({
      ...state,
      currentPage: page,
      pageSize: limit,
      totalPages: totalPages,
      totalElements: totalElements
    });

    // Add message with table data
    const pageInfo = totalPages > 1 ? ` (Page ${page + 1} of ${totalPages})` : '';
    const message = `Found ${totalElements} record(s)${pageInfo}:`;
    this.addBotMessageWithData(message, items, entityType);

    // Add pagination/navigation controls
    const navigationOptions: MenuOption[] = [];

    // Add pagination buttons if multiple pages
    if (totalPages > 1) {
      if (page > 0) {
        navigationOptions.push({ label: '⬅️ Previous Page', value: 'page:prev' });
      }

      if (page < totalPages - 1) {
        navigationOptions.push({ label: 'Next Page ➡️', value: 'page:next' });
      }
    }

    // Add navigation back to management menu based on entity type
    const currentFlow = state.currentFlow;
    if (currentFlow.includes('CUSTOMER')) {
      navigationOptions.push({ label: '🔙 Customer Management', value: 'back' });
    } else if (currentFlow.includes('ACCOUNT')) {
      navigationOptions.push({ label: '🔙 Account Management', value: 'back' });
    } else if (currentFlow.includes('TRANSACTION')) {
      navigationOptions.push({ label: '🔙 Transaction Management', value: 'back' });
    }

    navigationOptions.push({ label: '🏠 Main Menu', value: 'menu' });

    // Show navigation options without label
    if (navigationOptions.length > 0) {
      this.addBotMessage('', navigationOptions);
    }
  }

  /**
   * Display single entity details
   */
  private displayEntityDetails(entity: any): void {
    const state = this.stateSubject.value;

    // Determine entity type
    let entityType: 'customer' | 'account' | 'transaction' = 'customer';
    if ('accountId' in entity && !('transactionId' in entity)) {
      entityType = 'account';
    } else if ('transactionId' in entity) {
      entityType = 'transaction';
    }

    // Display as table with single row
    this.addBotMessageWithData('Details:', [entity], entityType);

    // Add navigation buttons
    const navigationOptions: MenuOption[] = [];

    // Add navigation back to management menu based on entity type
    const currentFlow = state.currentFlow;
    if (currentFlow.includes('CUSTOMER')) {
      navigationOptions.push({ label: '🔙 Customer Management', value: 'back' });
    } else if (currentFlow.includes('ACCOUNT')) {
      navigationOptions.push({ label: '🔙 Account Management', value: 'back' });
    } else if (currentFlow.includes('TRANSACTION')) {
      navigationOptions.push({ label: '🔙 Transaction Management', value: 'back' });
    }

    navigationOptions.push({ label: '🏠 Main Menu', value: 'menu' });

    // Show navigation options
    if (navigationOptions.length > 0) {
      this.addBotMessage('', navigationOptions);
    }
  }

  /**
   * Format search result for display
   */
  private formatSearchResult(item: any): string {
    // Transaction - CHECK FIRST because transactions also have accountId!
    if ('transactionId' in item) {
      const transactionId = item['transactionId'];
      const txnType = item['txnType'] || 'N/A';
      const amount = item['amount'] ?? 0;
      const description = item['description'] || 'No description';
      const status = item['status'] || 'N/A';
      return `[${transactionId}] ${txnType} $${amount} - ${description} - ${status}`;
    }

    // Customer
    if ('customerId' in item && !('accountId' in item)) {
      const name = item['name'] || 'N/A';
      const email = item['email'] || 'N/A';
      const status = item['status'] || 'N/A';
      return `[${item['customerId']}] ${name} (${email}) - ${status}`;
    }

    // Account
    if ('accountId' in item) {
      const accountId = item['accountId'];
      const accountNumber = item['accountNumber'] || 'N/A';
      const accountType = item['accountType'] || 'N/A';
      const balance = item['balance'] ?? 0;
      const status = item['status'] || 'N/A';
      return `[${accountId}] ${accountNumber} - ${accountType} - Balance: $${balance} - ${status}`;
    }

    // Fallback: show raw JSON for debugging
    return JSON.stringify(item);
  }

  /**
   * Advance to the next step in the flow
   */
  private advanceStep(): void {
    const state = this.stateSubject.value;
    const flow = this.getCurrentFlow();

    if (state.step < flow.length - 1) {
      this.updateState({
        ...state,
        step: state.step + 1
      });
      this.executeCurrentStep();
    } else {
      // Flow complete, go back to view flow or main menu
      this.goToViewFlow();
    }
  }

  /**
   * Go to specific step
   */
  private goToStep(stepNumber: number): void {
    const state = this.stateSubject.value;
    this.updateState({
      ...state,
      step: stepNumber
    });
    this.executeCurrentStep();
  }

  /**
   * Transition to a different flow
   */
  private transitionToFlow(flowType: FlowType): void {
    this.updateState({
      currentFlow: flowType,
      step: 0,
      collectedData: {},
      searchResults: [],
      selectedEntityId: undefined
    });
    this.executeCurrentStep();
  }

  /**
   * Go to main menu
   */
  private goToMainMenu(): void {
    this.transitionToFlow('MAIN_MENU');
  }

  /**
   * Go back to the appropriate view flow
   */
  private goToViewFlow(): void {
    const state = this.stateSubject.value;

    if (state.currentFlow.includes('CUSTOMER')) {
      this.transitionToFlow('CUSTOMER_VIEW');
    } else if (state.currentFlow.includes('ACCOUNT')) {
      this.transitionToFlow('ACCOUNT_VIEW');
    } else if (state.currentFlow.includes('TRANSACTION')) {
      this.transitionToFlow('TRANSACTION_VIEW');
    } else {
      this.goToMainMenu();
    }
  }

  /**
   * Go back one step
   */
  private goBack(): void {
    const state = this.stateSubject.value;
    if (state.step > 0) {
      this.updateState({
        ...state,
        step: state.step - 1
      });
      this.executeCurrentStep();
    } else {
      this.goToViewFlow();
    }
  }

  /**
   * Helper methods
   */
  private updateState(newState: ConversationState): void {
    this.stateSubject.next(newState);
  }

  private updateCollectedData(field: string, value: any): void {
    const state = this.stateSubject.value;
    this.updateState({
      ...state,
      collectedData: {
        ...state.collectedData,
        [field]: value
      }
    });
  }

  private setLoading(isLoading: boolean): void {
    const state = this.stateSubject.value;
    this.updateState({
      ...state,
      isLoading
    });
  }

  private addBotMessage(text: string, options?: MenuOption[], isLoading: boolean = false): void {
    const messages = this.messagesSubject.value;
    const message: ChatMessage = {
      id: this.generateId(),
      sender: 'bot',
      text,
      timestamp: new Date(),
      options,
      isLoading
    };
    this.messagesSubject.next([...messages, message]);
  }

  private addBotMessageWithData(text: string, data: any[], entityType: string): void {
    const messages = this.messagesSubject.value;
    const message: ChatMessage = {
      id: this.generateId(),
      sender: 'bot',
      text,
      timestamp: new Date(),
      data: { items: data, type: entityType }
    };
    this.messagesSubject.next([...messages, message]);
  }

  private addBotMessageWithInput(text: string, options: MenuOption[]): void {
    const messages = this.messagesSubject.value;
    const message: ChatMessage = {
      id: this.generateId(),
      sender: 'bot',
      text,
      timestamp: new Date(),
      options,
      keepInputEnabled: true  // Keep input enabled even with options
    };
    this.messagesSubject.next([...messages, message]);
  }

  private addUserMessage(text: string): void {
    const messages = this.messagesSubject.value;
    const message: ChatMessage = {
      id: this.generateId(),
      sender: 'user',
      text,
      timestamp: new Date()
    };
    this.messagesSubject.next([...messages, message]);
  }

  private removeLastMessageIfLoading(): void {
    const messages = this.messagesSubject.value;
    if (messages.length > 0 && messages[messages.length - 1].isLoading) {
      this.messagesSubject.next(messages.slice(0, -1));
    }
  }

  private formatFieldName(field: string): string {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  private getEntityIdField(flow: FlowType): string {
    if (flow.includes('CUSTOMER')) return 'customerId';
    if (flow.includes('ACCOUNT')) return 'accountId';
    if (flow.includes('TRANSACTION')) return 'transactionId';
    return 'id';
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Reset conversation
   */
  public reset(): void {
    this.messagesSubject.next([]);
    this.updateState({
      currentFlow: 'MAIN_MENU',
      step: 0,
      collectedData: {},
      searchResults: [],
      selectedEntityId: undefined
    });
    this.startConversation();
  }
}
