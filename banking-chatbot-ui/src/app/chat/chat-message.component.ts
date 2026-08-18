import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../core/models/conversation-state.model';
import { ChatOptionsComponent } from './chat-options.component';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, ChatOptionsComponent],
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent {
  @Input() message!: ChatMessage;
  @Output() optionSelected = new EventEmitter<string>();

  onOptionClick(value: string): void {
    this.optionSelected.emit(value);
  }

  formatText(text: string): string[] {
    return text.split('\n');
  }

  hasTableData(): boolean {
    return !!(this.message.data && this.message.data.items && this.message.data.items.length > 0);
  }

  getTableHeaders(): string[] {
    if (!this.message.data || !this.message.data.type) {
      return [];
    }

    const type = this.message.data.type;
    const isSingleRecord = this.message.data.items.length === 1;

    if (type === 'customer') {
      if (isSingleRecord) {
        return ['ID', 'Name', 'Email', 'Phone', 'Address', 'Status'];
      }
      return ['ID', 'Name', 'Email'];
    } else if (type === 'account') {
      if (isSingleRecord) {
        return ['ID', 'Account Number', 'Type', 'Balance', 'Customer ID', 'Status'];
      }
      return ['ID', 'Account Number', 'Type', 'Customer ID'];
    } else if (type === 'transaction') {
      if (isSingleRecord) {
        return ['ID', 'Type', 'Amount', 'Description', 'Category', 'Date', 'Status'];
      }
      return ['ID', 'Type', 'Amount', 'Status', 'Date'];
    }

    return [];
  }

  getTableRows(): any[][] {
    if (!this.message.data || !this.message.data.items || !this.message.data.type) {
      return [];
    }

    const items = this.message.data.items;
    const type = this.message.data.type;
    const isSingleRecord = items.length === 1;

    return items.map((item: any) => {
      if (type === 'customer') {
        if (isSingleRecord) {
          return [
            item['customerId'] || 'N/A',
            item['name'] || 'N/A',
            item['email'] || 'N/A',
            item['phone'] || 'N/A',
            item['address'] || 'N/A',
            item['status'] || 'N/A'
          ];
        }
        return [
          item['customerId'] || 'N/A',
          item['name'] || 'N/A',
          item['email'] || 'N/A'
        ];
      } else if (type === 'account') {
        if (isSingleRecord) {
          return [
            item['accountId'] || 'N/A',
            item['accountNumber'] || 'N/A',
            item['accountType'] || 'N/A',
            item['balance'] !== undefined ? '$' + item['balance'].toFixed(2) : '$0.00',
            item['customerId'] || 'N/A',
            item['status'] || 'N/A'
          ];
        }
        return [
          item['accountId'] || 'N/A',
          item['accountNumber'] || 'N/A',
          item['accountType'] || 'N/A',
          item['customerId'] || 'N/A'
        ];
      } else if (type === 'transaction') {
        if (isSingleRecord) {
          return [
            item['transactionId'] || 'N/A',
            item['txnType'] || 'N/A',
            item['amount'] !== undefined ? '$' + item['amount'].toFixed(2) : '$0.00',
            item['description'] || 'N/A',
            item['category'] || 'N/A',
            item['txnDate'] ? new Date(item['txnDate']).toLocaleDateString() : 'N/A',
            item['status'] || 'N/A'
          ];
        }
        return [
          item['transactionId'] || 'N/A',
          item['txnType'] || 'N/A',
          item['amount'] !== undefined ? '$' + item['amount'].toFixed(2) : '$0.00',
          item['status'] || 'N/A',
          item['txnDate'] ? new Date(item['txnDate']).toLocaleDateString() : 'N/A'
        ];
      }

      return [];
    });
  }
}
