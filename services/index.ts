// Export all services
export { chatService } from './chat.service';

// Export interfaces from services
export type { SuggestionResponse, PaginatedMessagesResponse } from './chat.service';

// Re-export types for convenience
export type {
  ChatMessage,
  ChatResponse,
  ApiResponse,
  MessagesResponse,
  PaginatedMessagesResponse as PaginatedMessages,
} from '@/types/chat';
