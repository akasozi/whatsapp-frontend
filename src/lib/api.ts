import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { AuthTokens, LoginCredentials, User, Conversation, Message, SendMessageRequest, ConversationStats, MessageStats } from '@/types'

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
    return response.data
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