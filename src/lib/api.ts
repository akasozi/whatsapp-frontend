import axios, { AxiosInstance, AxiosResponse } from 'axios'
import type {
  AuthTokens,
  LoginCredentials,
  User,
  Message,
  Conversation,
  SendMessageRequest,
  ConversationStats,
  MessageStats,
  AttachmentData,
  AttachmentUploadResponse,
  MessageTemplate,
  MessageTemplateCreate,
  MessageTemplateUpdate,
  TemplateApplicationRequest,
  TemplateApplicationResponse,
  AdminStats,
  BroadcastMessageRequest,
  BroadcastResult,
  UserSearchResponse,
  AdminMessageMetadata
} from '@/types'

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
  media_url?: string
  media_filename?: string
  attachments?: AttachmentData[]
}

interface AttachmentData {
  attachment_id: number
  filename: string
  mime_type: string
  file_size: number
  download_url: string
}

interface AttachmentUploadResponse {
  message: string
  attachment_id: number
  filename: string
  file_size: number
  mime_type: string
  download_url: string
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
      session_id: conv.session_id || `session_${conv.id}`,
      user_id: conv.user_id,
      status: conv.status as 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED',
      assigned_agent_id: conv.assigned_agent_id,
      last_message_at: conv.last_message_at,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      user: {
        id: conv.user_id,
        phone_number: conv.user_phone || 'Unknown', // Use actual user phone from backend
        full_name: conv.user_name || 'WhatsApp User', // Use actual user name from backend
        email: undefined,
        role: 'USER' as const,
        is_active: true,
        created_at: conv.created_at,
        updated_at: conv.updated_at
      },
      messages: [] // Empty array for now, will be loaded separately
    }))
  }

  async getConversation(conversationId: number): Promise<Conversation> {
    const response = await this.client.get(`/api/v1/conversations/${conversationId}`)

    // Transform backend response to match frontend expected structure
    const conv = response.data
    return {
      id: conv.id,
      session_id: conv.session_id || `session_${conv.id}`,
      user_id: conv.user_id,
      status: conv.status as 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED',
      assigned_agent_id: conv.assigned_agent_id,
      last_message_at: conv.last_message_at,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      user: {
        id: conv.user_id,
        phone_number: conv.user_phone || 'Unknown', // Use actual user phone from backend
        full_name: conv.user_name || 'WhatsApp User', // Use actual user name from backend
        email: undefined,
        role: 'USER' as const,
        is_active: true,
        created_at: conv.created_at,
        updated_at: conv.updated_at
      },
      messages: conv.messages || [] // Include messages if available
    }
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

  // AI Assistant endpoints
  async askAIAssistant(question: string, sessionId?: string): Promise<any> {
    const response = await this.client.post('/api/v1/ai-assistant/chat', {
      question,
      session_id: sessionId
    })
    return response.data
  }

  async getSuggestedQuestions(category?: string): Promise<any> {
    const params = category ? { category } : {}
    const response = await this.client.get('/api/v1/ai-assistant/suggested-questions', { params })
    return response.data
  }

  async getConversationSummary(conversationId: number): Promise<any> {
    const response = await this.client.get(`/api/v1/ai-assistant/conversation/${conversationId}/summary`)
    return response.data
  }

  async performSentimentAnalysis(days: number = 7): Promise<any> {
    const response = await this.client.post('/api/v1/ai-assistant/analytics/sentiment', {
      scope: 'all',
      days,
      include_details: true
    })
    return response.data
  }

  async performTopicAnalysis(days: number = 7): Promise<any> {
    const response = await this.client.post('/api/v1/ai-assistant/analytics/topics', {
      scope: 'time_period',
      days,
      max_topics: 10,
      include_trends: true
    })
    return response.data
  }

  async analyzeUserBehavior(userIdentifier?: string, days: number = 30): Promise<any> {
    const response = await this.client.post('/api/v1/ai-assistant/analytics/user-behavior', {
      user_identifier: userIdentifier,
      scope: userIdentifier ? 'specific_user' : 'overall',
      days,
      include_predictions: true
    })
    return response.data
  }

  async performCustomAnalytics(query: string, days: number = 7): Promise<any> {
    const response = await this.client.post('/api/v1/ai-assistant/analytics/custom', {
      query,
      time_period_days: days,
      include_recommendations: true
    })
    return response.data
  }

  async getSystemHealth(hours: number = 24): Promise<any> {
    const response = await this.client.get('/api/v1/ai-assistant/system/health', {
      params: { hours }
    })
    return response.data
  }

  async getAIAssistantCapabilities(): Promise<any> {
    const response = await this.client.get('/api/v1/ai-assistant/capabilities')
    return response.data
  }

  // Attachment endpoints
  async uploadAttachment(file: File): Promise<AttachmentUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.client.post('/api/v1/attachments/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  async downloadAttachment(attachmentId: string): Promise<Blob> {
    const response = await this.client.get(`/api/v1/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    })
    return response.data
  }

  async previewAttachment(attachmentId: string): Promise<Blob> {
    const response = await this.client.get(`/api/v1/attachments/${attachmentId}/preview`, {
      responseType: 'blob',
    })
    return response.data
  }

  async getAttachment(attachmentId: string): Promise<any> {
    const response = await this.client.get(`/api/v1/attachments/${attachmentId}`)
    return response.data
  }

  async getMessageAttachments(messageId: number): Promise<any[]> {
    const response = await this.client.get(`/api/v1/attachments/message/${messageId}`)
    return response.data
  }

  async getAttachments(params?: {
    message_id?: number
    skip?: number
    limit?: number
  }): Promise<any> {
    const response = await this.client.get('/api/v1/attachments', { params })
    return response.data
  }

  async deleteAttachment(attachmentId: string): Promise<any> {
    const response = await this.client.delete(`/api/v1/attachments/${attachmentId}`)
    return response.data
  }

  async getAttachmentStats(): Promise<any> {
    const response = await this.client.get('/api/v1/attachments/stats/overview')
    return response.data
  }

  // Helper method to upload multiple attachments
  async uploadAttachments(files: File[]): Promise<AttachmentUploadResponse[]> {
    const uploadPromises = files.map(file => this.uploadAttachment(file))
    return Promise.all(uploadPromises)
  }

  // Helper method to handle file download
  async downloadFile(attachmentId: string, filename: string): Promise<void> {
    try {
      const blob = await this.downloadAttachment(attachmentId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
      throw error
    }
  }

  // Download media from a message (with fallback logic)
  async downloadMessageMedia(messageId: number, filename?: string): Promise<void> {
    try {
      const response = await this.client.get(`/api/v1/attachments/message/${messageId}/download`, {
        responseType: 'blob'
      })

      // Get filename from Content-Disposition header or use provided one
      let downloadFilename = filename || `media_${messageId}`
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]+)"/)
        if (filenameMatch && filenameMatch[1]) {
          downloadFilename = filenameMatch[1]
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = downloadFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error: any) {
      console.error('Error downloading message media:', error)
      throw error
    }
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.client.get('/health')
    return response.data
  }

  // ===== ADMIN-SPECIFIC METHODS =====

  // Admin Dashboard Statistics
  async getAdminDashboardStats(): Promise<any> {
    const response = await this.client.get('/api/v1/messages/admin/stats')
    return response.data
  }

  // Template Management
  async getAdminTemplates(params?: { skip?: number; limit?: number; search?: string }): Promise<any[]> {
    const response = await this.client.get('/api/v1/messages/admin/templates', { params })
    return response.data
  }

  async getAdminTemplate(templateId: number): Promise<any> {
    const response = await this.client.get(`/api/v1/messages/admin/templates/${templateId}`)
    return response.data
  }

  async createAdminTemplate(templateData: any): Promise<any> {
    const response = await this.client.post('/api/v1/messages/admin/templates', templateData)
    return response.data
  }

  async updateAdminTemplate(templateId: number, templateData: any): Promise<any> {
    const response = await this.client.put(`/api/v1/messages/admin/templates/${templateId}`, templateData)
    return response.data
  }

  async deleteAdminTemplate(templateId: number): Promise<void> {
    await this.client.delete(`/api/v1/messages/admin/templates/${templateId}`)
  }

  // Template Application
  async applyTemplateToConversation(applicationData: any): Promise<any> {
    const response = await this.client.post('/api/v1/messages/admin/templates/apply', applicationData)
    return response.data
  }

  // User Search
  async searchUsers(query: string, limit: number = 50): Promise<any[]> {
    const response = await this.client.get('/api/v1/messages/admin/users/search', {
      params: { query, limit }
    })
    return response.data
  }

  // Broadcast Messaging
  async broadcastMessage(broadcastData: any): Promise<any> {
    const response = await this.client.post('/api/v1/messages/admin/messages/broadcast', broadcastData)
    return response.data
  }

  // Enhanced message sending with admin metadata
  async sendMessageWithAdminMetadata(messageData: any): Promise<any> {
    const response = await this.client.post('/api/v1/messages/send', messageData)
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
  MessageStats,
  AttachmentData,
  AttachmentUploadResponse
}