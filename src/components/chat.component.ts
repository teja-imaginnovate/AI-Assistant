import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../services/chat.service';
import { ChatMessage } from '../models/message.interface';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="chat-container">
      <div class="chat-header">
        <div class="header-content">
          <div class="status-indicator"></div>
          <h2>Shield 2.O</h2>
          <span class="user-info">AI</span>
        </div>
      </div>

      <div class="chat-messages" #messagesContainer>
        <div class="messages-wrapper">
          <div 
            *ngFor="let message of messages; trackBy: trackByMessageId" 
            class="message-item"
            [class.sent]="message.isCurrentUser || message.sender === currentUser"
            [class.received]="!message.isCurrentUser && message.sender !== currentUser"
          >
            <div class="message-bubble">
              <div class="message-header" *ngIf="!message.isCurrentUser && message.sender !== currentUser">
                <div class="avatar">{{ getInitials(message.sender) }}</div>
                <span class="sender-name">{{ message.sender }}</span>
              </div>
              <div class="message-content">{{ message.content }}</div>
              <div class="message-timestamp">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input-container">
        <div class="input-wrapper">
          <input
            type="text"
            [(ngModel)]="newMessage"
            (keyup.enter)="sendMessage()"
            placeholder="Type your message..."
            class="message-input"
            [disabled]="isSending"
          />
          <button 
            (click)="sendMessage()" 
            class="send-button"
            [disabled]="!newMessage.trim() || isSending"
          >
            <svg *ngIf="!isSending" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9"></polygon>
            </svg>
            <div *ngIf="isSending" class="loading-spinner"></div>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      max-height: 800px;
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .chat-header {
      background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      color: white;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .chat-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
      animation: shimmer 3s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
      z-index: 1;
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      background: #10B981;
      border-radius: 50%;
      border: 2px solid white;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .header-content h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      flex: 1;
    }

    .user-info {
      background: rgba(255, 255, 255, 0.2);
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 0.9rem;
      backdrop-filter: blur(10px);
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 0;
      background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
    }

    .messages-wrapper {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: 100%;
    }

    .message-item {
      display: flex;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message-item.sent {
      justify-content: flex-end;
    }

    .message-item.received {
      justify-content: flex-start;
    }

    .message-bubble {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 18px;
      position: relative;
      transition: all 0.2s ease;
    }

    .message-item.sent .message-bubble {
      background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      color: white;
      border-bottom-right-radius: 6px;
    }

    .message-item.received .message-bubble {
      background: white;
      color: #1f2937;
      border: 1px solid #e5e7eb;
      border-bottom-left-radius: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .message-bubble:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .avatar {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #10B981, #059669);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
    }

    .sender-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: #6b7280;
    }

    .message-content {
      font-size: 0.95rem;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .message-timestamp {
      font-size: 0.75rem;
      opacity: 0.7;
      margin-top: 6px;
      text-align: right;
    }

    .message-item.received .message-timestamp {
      text-align: left;
      color: #6b7280;
    }

    .chat-input-container {
      padding: 20px;
      background: white;
      border-top: 1px solid #e5e7eb;
    }

    .input-wrapper {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .message-input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 24px;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s ease;
      background: #f9fafb;
    }

    .message-input:focus {
      border-color: #3B82F6;
      background: white;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .message-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .send-button {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #3B82F6, #1D4ED8);
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .send-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }

    .send-button:active:not(:disabled) {
      transform: translateY(0);
    }

    .send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: 0 2px 6px rgba(59, 130, 246, 0.2);
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Scrollbar Styling */
    .chat-messages::-webkit-scrollbar {
      width: 6px;
    }

    .chat-messages::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    .chat-messages::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .chat-messages::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Mobile Responsiveness */
    @media (max-width: 768px) {
      .chat-container {
        height: 100vh;
        border-radius: 0;
        max-height: none;
      }

      .message-bubble {
        max-width: 85%;
      }

      .header-content h2 {
        font-size: 1.25rem;
      }

      .user-info {
        display: none;
      }

      .messages-wrapper {
        padding: 16px;
      }

      .chat-input-container {
        padding: 16px;
      }
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage = '';
  currentUser = 'You';
  isSending = false;
  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        const wasAtBottom = this.isScrolledToBottom();
        this.messages = messages.map(msg => ({
          ...msg,
          isCurrentUser: msg.sender === this.currentUser,
          timestamp: new Date(msg.timestamp)
        }));
        
        if (wasAtBottom || messages.length === 1) {
          this.shouldScrollToBottom = true;
        }
      });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.isSending) return;

    const messageContent = this.newMessage.trim();
    this.newMessage = '';
    this.isSending = true;

    this.chatService.sendMessage({
      content: messageContent,
      sender: this.currentUser
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.isSending = false;
        this.shouldScrollToBottom = true;
      },
      error: () => {
        this.isSending = false;
      }
    });
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }

  formatTime(timestamp: Date): string {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  private isScrolledToBottom(): boolean {
    const container = this.messagesContainer?.nativeElement;
    if (!container) return false;
    
    const threshold = 100;
    return container.scrollHeight - container.scrollTop <= container.clientHeight + threshold;
  }

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}