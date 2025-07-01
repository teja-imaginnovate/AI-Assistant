export interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  isCurrentUser?: boolean;
}

export interface SendMessageRequest {
  content: string;
  sender: string;
}