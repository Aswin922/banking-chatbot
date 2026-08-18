import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConversationEngineService } from '../core/conversation/conversation-engine.service';
import { ChatMessage } from '../core/models/conversation-state.model';
import { ChatMessageComponent } from './chat-message.component';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatMessageComponent],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss']
})
export class ChatWindowComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  private conversationEngine = inject(ConversationEngineService);

  messages: ChatMessage[] = [];
  userInput: string = '';
  isInputDisabled: boolean = false;
  private shouldScroll: boolean = false;

  ngOnInit(): void {
    this.conversationEngine.messages$.subscribe(messages => {
      this.messages = messages;
      this.shouldScroll = true;
      this.updateInputState();
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.userInput.trim() && !this.isInputDisabled) {
      this.conversationEngine.processUserInput(this.userInput.trim());
      this.userInput = '';
    }
  }

  /**
   * Handle option button click
   */
  onOptionSelected(value: string): void {
    this.conversationEngine.processUserInput(value);
  }

  /**
   * Reset conversation
   */
  onReset(): void {
    if (confirm('Are you sure you want to start over?')) {
      this.conversationEngine.reset();
    }
  }

  /**
   * Go to main menu
   */
  onMainMenu(): void {
    this.conversationEngine.processUserInput('menu');
  }

  /**
   * Update input state based on current message
   */
  private updateInputState(): void {
    const lastMessage = this.messages[this.messages.length - 1];

    // Disable input if last message has options (MENU/CONFIRM step)
    // UNLESS keepInputEnabled is true (for optional PROMPT fields with Skip button)
    this.isInputDisabled = lastMessage?.sender === 'bot' &&
                          lastMessage?.options !== undefined &&
                          lastMessage?.options.length > 0 &&
                          !lastMessage?.keepInputEnabled;
  }

  /**
   * Scroll chat to bottom
   */
  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}
