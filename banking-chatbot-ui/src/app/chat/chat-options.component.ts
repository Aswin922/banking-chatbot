import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuOption } from '../core/models/conversation-state.model';

@Component({
  selector: 'app-chat-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-options.component.html',
  styleUrls: ['./chat-options.component.scss']
})
export class ChatOptionsComponent {
  @Input() options: MenuOption[] = [];
  @Output() optionSelected = new EventEmitter<string>();

  onClick(option: MenuOption): void {
    this.optionSelected.emit(option.value.toString());
  }
}
