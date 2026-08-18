import { Component } from '@angular/core';
import { ChatWindowComponent } from './chat/chat-window.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatWindowComponent],
  template: '<app-chat-window></app-chat-window>',
  styles: []
})
export class AppComponent {
  title = 'Banking Chatbot';
}
