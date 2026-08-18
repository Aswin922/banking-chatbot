/**
 * Conversation state machine models
 */

export type FlowType =
  | 'MAIN_MENU'
  | 'CUSTOMER_VIEW'
  | 'CUSTOMER_CREATE'
  | 'CUSTOMER_UPDATE'
  | 'CUSTOMER_DELETE'
  | 'ACCOUNT_VIEW'
  | 'ACCOUNT_CREATE'
  | 'ACCOUNT_UPDATE'
  | 'ACCOUNT_DELETE'
  | 'TRANSACTION_VIEW'
  | 'TRANSACTION_CREATE'
  | 'TRANSACTION_UPDATE'
  | 'TRANSACTION_DELETE';

export interface ConversationState {
  currentFlow: FlowType;
  step: number; // Index in the flow steps array
  collectedData: Record<string, any>;
  selectedEntityId?: number;
  searchResults?: any[];
  isLoading?: boolean;
  error?: string;
  // Pagination support
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  totalElements?: number;
  lastListAction?: string; // Track the last list API action for pagination
}

export type StepType = 'MENU' | 'PROMPT' | 'CONFIRM' | 'API_CALL' | 'RESULT' | 'SEARCH' | 'SELECT';

export interface FlowStep {
  type: StepType;
  field?: string; // For PROMPT steps
  question?: string; // For PROMPT steps
  validate?: ValidatorFn; // For PROMPT steps
  options?: MenuOption[]; // For MENU steps
  summaryFields?: string[]; // For CONFIRM steps
  action?: string; // For API_CALL steps
  resultMessage?: string; // For RESULT steps
  searchAction?: string; // For SEARCH steps
  optional?: boolean; // For PROMPT steps
}

export interface MenuOption {
  label: string;
  value: string | number;
  nextFlow?: FlowType;
  nextStep?: number;
}

export type ValidatorFn = (value: any) => ValidationResult;

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  options?: MenuOption[];
  isLoading?: boolean;
  data?: any; // For displaying results (lists, cards, etc.)
  keepInputEnabled?: boolean; // Keep text input enabled even when options are shown
}
