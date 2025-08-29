import { environment } from '../environments/environment';
import { 
  ChatMessage, 
  ChatResponse, 
  ApiResponse, 
  MessagesResponse,
  ChatSession
} from '@/types/chat';

// Interface cho suggestions
export interface SuggestionResponse {
  quickQuestions: string[]
  exampleQueries: {
    question: string
    description: string
  }[]
  templates: string[]
  tips: string[]
}

// Interface cho paginated messages response
export interface PaginatedMessagesResponse {
  messages: ChatMessage[]
  count: number
  hasMore: boolean
  nextBeforeMessageId: number | null
  paginationInfo: string
}

class ChatService {
  private apiUrlV1 = `${environment.apiUrlV1}/api/Chat`;
  private apiUrlV1Lower = `${environment.apiUrlV1}/api/chat`; // fallback với lowercase

  constructor() {}

  // Helper method để tạo full API URL
  private getExternalApiUrl(endpoint: string): string {
    return `${this.apiUrlV1}${endpoint}`;
  }

  // Helper method với lowercase fallback
  private getExternalApiUrlLower(endpoint: string): string {
    return `${this.apiUrlV1Lower}${endpoint}`;
  }

  // Tạo hoặc lấy session cho user
  async getOrCreateSession(userId: string): Promise<ChatSession> {
    try {
      const request = new Request(`${environment.apiUrlV1}/api/Chat/session/get-or-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Loại bỏ credentials để tránh CORS issues
        // credentials: 'include',
        body: JSON.stringify({ userId }),
      });

      const response = await fetch(request);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: { success: boolean; data: ChatSession; message?: string } = await response.json();
      console.log('Session response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Tạo/lấy session thất bại');
      }

      return data.data;
    } catch (error) {
      console.error('Error in getOrCreateSession:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Không thể tạo/lấy session: ${errorMessage}`);
    }
  }

  // Lấy tin nhắn mới nhất của session (để initial load)
  async getLatestMessages(sessionId: string | number): Promise<PaginatedMessagesResponse> {
    try {
      const request = new Request(`${environment.apiUrlV1}/api/Chat/session/${sessionId}/messages/latest`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // credentials: 'include',
      });

      const response = await fetch(request);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<PaginatedMessagesResponse> = await response.json();
      console.log('Latest messages response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Lấy tin nhắn mới nhất thất bại');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error in getLatestMessages:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Không thể lấy tin nhắn mới nhất: ${errorMessage}`);
    }
  }

  // Lấy tin nhắn trước một message ID cụ thể (để load more)
  async getMessagesBefore(sessionId: string | number, beforeMessageId: number): Promise<PaginatedMessagesResponse> {
    try {
      const request = new Request(`${environment.apiUrlV1}/api/Chat/session/${sessionId}/messages/before/${beforeMessageId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // credentials: 'include',
      });

      const response = await fetch(request);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<PaginatedMessagesResponse> = await response.json();
      console.log('Messages before response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Lấy tin nhắn trước đó thất bại');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error in getMessagesBefore:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Không thể lấy tin nhắn trước đó: ${errorMessage}`);
    }
  }

  // Lấy danh sách tin nhắn theo session (legacy method - deprecated)
  async getMessagesBySession(sessionId: string | number): Promise<ChatMessage[]> {
    console.warn('getMessagesBySession is deprecated, use getLatestMessages instead');
    
    try {
      const result = await this.getLatestMessages(sessionId);
      return result.messages;
    } catch (error) {
      console.warn('Fallback to old API endpoint');
      // Fallback to old endpoint if new one fails
      const request = new Request(`${environment.apiUrlV1}/api/Chat/session/${sessionId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // credentials: 'include',
      });

      const response = await fetch(request);
      if (!response.ok) {
        throw new Error(`Không thể lấy tin nhắn: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Legacy API response:', data);
      
      // Kiểm tra cấu trúc response
      if (data.success && data.data) {
        if (Array.isArray(data.data)) {
          return data.data;
        }
        if (data.data.messages && Array.isArray(data.data.messages)) {
          return data.data.messages;
        }
      }
      
      return [];
    }
  }

  // Lấy suggestions cho câu hỏi tiếp theo
  async getSuggestions(): Promise<SuggestionResponse> {
    // Thử uppercase 'Chat' trước
    let url = this.getExternalApiUrl('/suggestions');
    console.log('Trying suggestions API (uppercase):', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status (uppercase):', response.status, response.statusText);
      
      if (response.ok) {
        const data: ApiResponse<SuggestionResponse> = await response.json();
        console.log('Suggestions data:', data);
        
        if (data.success) {
          return data.data;
        }
      }
    } catch (error) {
      console.log('Uppercase failed, trying lowercase:', error);
    }

    // Fallback với lowercase 'chat'
    url = this.getExternalApiUrlLower('/suggestions');
    console.log('Trying suggestions API (lowercase):', url);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status (lowercase):', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`API không khả dụng: ${response.status} ${response.statusText}`);
      }

      const data: ApiResponse<SuggestionResponse> = await response.json();
      console.log('Suggestions data (lowercase):', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Lấy suggestions thất bại');
      }

      return data.data;
    } catch (error) {
      console.error('Error in getSuggestions (both attempts failed):', error);
      throw error;
    }
  }

  // Gửi feedback cho tin nhắn
  async sendFeedback(messageId: number, rating: number, comment: string): Promise<any> {
    const url = this.getExternalApiUrl(`/message/${messageId}/feedback`);
    console.log('Calling feedback API:', url);
    
    const request = new Request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // credentials: 'include',
      body: JSON.stringify({
        rating,
        comment
      }),
    });

    const response = await fetch(request);
    if (!response.ok) {
      throw new Error(`Không thể gửi feedback: ${response.statusText}`);
    }

    const data: ApiResponse<any> = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Gửi feedback thất bại');
    }

    return data.data;
  }
}

export const chatService = new ChatService();