import axios, { AxiosInstance, AxiosResponse } from 'axios'

// Type definitions
interface AuthTokens {
  access_token: string
  token_type: string
  expires_in: number
}

interface LoginCredentials {
  email: string
  password: string
}

interface User {
  id: number
  phone_number: string
  full_name: string
  email?: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Message {
  id: number
  conversation_id: number
  sender_id?: number
  direction: 'INBOUND' | 'OUTBOUND'
  message_type: string
  content: string
  external_message_id?: string
  media_url?: string
  media_filename?: string
  has_attachments: boolean
  message_metadata: any
  source: string
  created_at: string
  updated_at: string
}

interface Conversation {
  id: number
  session_id: string
  user_id: number
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
  assigned_agent_id?: number
  last_message_at?: string
  created_at: string
  updated_at: string
  user: User
  messages: Message[]
}

interface SendMessageRequest {
  conversation_id: number
  content: string
  message_type?: string
}

interface ConversationStats {
  total_conversations: number
  active_conversations: number
  completed_conversations: number
  total_messages: number
  unique_users: number
  completion_rate: number
}

interface MessageStats {
  total_messages: number
  inbound_messages: number
  outbound_messages: number
  bot_messages: number
  agent_messages: number
  average_messages_per_conversation: number
}

class ApiClient {
  private client: AxiosInstance
  private static instance: ApiClient

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getStoredToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.removeStoredToken()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token')
    }
    return null
  }

  private removeStoredToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
    }
  }

  setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
    }
  }

  clearToken(): void {
    this.removeStoredToken()
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    const response = await this.client.post('/api/v1/auth/login', credentials)
    const tokens = response.data

    // Store token for future requests
    this.setToken(tokens.access_token)

    return tokens
  }

  async createAdminUser(): Promise<any> {
    const response = await this.client.post('/api/v1/auth/create-admin')
    return response.data
  }

  // Conversation endpoints
  async getConversations(params?: {
    skip?: number
    limit?: number
    status?: string
  }): Promise<Conversation[]> {
    const response = await this.client.get('/api/v1/conversations', { params })

    // Transform backend response to match frontend expected structure
    return response.data.map((conv: any) => ({
      id: conv.id,
      session_id: `session_${conv.id}`, // Generate session_id
      user_id: conv.id, // Use conversation ID as user_id
      status: conv.status as 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED',
      assigned_agent_id: undefined,
      last_message_at: conv.last_message_at || conv.messages?.[conv.messages.length - 1]?.created_at,
      created_at: conv.created_at || new Date().toISOString(),
      updated_at: conv.updated_at || new Date().toISOString(),
      user: {
        id: conv.id,
        phone_number: conv.user_phone,
        full_name: conv.username,
        email: undefined,
        role: 'USER' as const,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      messages: conv.messages?.map((msg: any) => ({
        id: msg.id,
        conversation_id: conv.id,
        sender_id: undefined,
        direction: msg.direction as 'INBOUND' | 'OUTBOUND',
        message_type: 'TEXT' as const,
        content: msg.content,
        external_message_id: undefined,
        media_url: undefined,
        media_filename: undefined,
        has_attachments: false,
        message_metadata: {},
        source: msg.direction === 'INBOUND' ? 'USER' : 'BOT',
        created_at: msg.created_at,
        updated_at: msg.created_at
      })) || []
    }))
  }

  async getConversation(conversationId: number): Promise<Conversation> {
    const response = await this.client.get(`/api/v1/conversations/${conversationId}`)
    return response.data
  }

  async getConversationStats(): Promise<ConversationStats> {
    const response = await this.client.get('/api/v1/conversations/stats/overview')
    return response.data
  }

  async updateConversationStatus(conversationId: number, newStatus: string): Promise<any> {
    const response = await this.client.patch(`/api/v1/conversations/${conversationId}/status`, { new_status: newStatus })
    return response.data
  }

  // Message endpoints
  async getMessages(params?: {
    conversation_id?: number
    direction?: string
    message_type?: string
    skip?: number
    limit?: number
  }): Promise<Message[]> {
    const response = await this.client.get('/api/v1/messages', { params })
    return response.data
  }

  async sendMessage(messageData: SendMessageRequest): Promise<any> {
    const response = await this.client.post('/api/v1/messages/send', messageData)
    return response.data
  }

  async getMessageStats(): Promise<MessageStats> {
    const response = await this.client.get('/api/v1/messages/stats/overview')
    return response.data
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.client.get('/health')
    return response.data
  }
}

export const apiClient = ApiClient.getInstance()

// Export types for use in components
export type {
  AuthTokens,
  LoginCredentials,
  User,
  Message,
  Conversation,
  SendMessageRequest,
  ConversationStats,
  MessageStats
}