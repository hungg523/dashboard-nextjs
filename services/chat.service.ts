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
    const request = new Request('/api/chat/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ userId }),
    });

    const response = await fetch(request);
    if (!response.ok) {
      throw new Error(`Không thể tạo/lấy session: ${response.statusText}`);
    }

    const data: { success: boolean; data: ChatSession; message?: string } = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Tạo/lấy session thất bại');
    }

    return data.data;
  }

  // Lấy danh sách tin nhắn theo session
  async getMessagesBySession(sessionId: string | number): Promise<ChatMessage[]> {
    const request = new Request(`/api/chat/session/${sessionId}/messages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const response = await fetch(request);
    if (!response.ok) {
      throw new Error(`Không thể lấy tin nhắn: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw API response:', data);
    
    // Kiểm tra cấu trúc response
    if (data.success && data.data) {
      console.log('Messages data:', data.data);
      // Nếu data.data là array
      if (Array.isArray(data.data)) {
        return data.data;
      }
      // Nếu data.data có property messages
      if (data.data.messages && Array.isArray(data.data.messages)) {
        return data.data.messages;
      }
    }
    
    // Fallback: trả về array rỗng nếu không có data
    console.warn('No messages found or invalid format:', data);
    return [];
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