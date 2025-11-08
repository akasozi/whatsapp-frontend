export interface User {
  id: number
  phone_number: string
  full_name?: string
  email?: string
  role: 'USER' | 'ADMIN'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access_token: string
  token_type: string
  expires_in: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface Conversation {
  id: number
  session_id: string
  user_id: number
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
  assigned_agent_id?: number
  last_message_at?: string
  created_at: string
  updated_at: string
  user?: User
  assigned_agent?: User
  messages?: Message[]
}

export interface Message {
  id: number
  conversation_id: number
  sender_id?: number
  direction: 'INBOUND' | 'OUTBOUND'
  message_type: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'AUDIO' | 'VIDEO' | 'LOCATION' | 'INTERACTIVE'
  content?: string
  external_message_id?: string
  media_url?: string
  media_filename?: string
  has_attachments: boolean
  message_metadata?: Record<string, any>
  source: 'USER' | 'BOT' | 'AGENT'
  created_at: string
  updated_at: string
  conversation?: Conversation
  sender?: User
}

export interface ConversationStats {
  total_conversations: number
  active_conversations: number
  completed_conversations: number
  total_messages: number
  unique_users: number
  completion_rate: number
}

export interface MessageStats {
  total_messages: number
  inbound_messages: number
  outbound_messages: number
  bot_messages: number
  agent_messages: number
  average_messages_per_conversation: number
}

export interface SendMessageRequest {
  conversation_id: number
  content: string
  message_type?: 'TEXT' | 'IMAGE' | 'DOCUMENT'
  media_url?: string
}

export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
  status: number
}