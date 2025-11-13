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
  media_filename?: string
  attachments?: MessageAttachment[]

  // Admin-specific fields
  admin_note?: string
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  template_id?: number
  is_template_based?: boolean
}

export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
  status: number
}

// Document Management Types
export interface Document {
  id: number
  filename: string
  original_filename: string
  file_size: number
  file_type: string
  content_type: string
  uploaded_by: number
  upload_date: string
  status: 'processing' | 'completed' | 'failed'
  processing_error?: string
  total_chunks: number
  total_words: number
  is_active: boolean
  created_at: string
  updated_at: string
  uploader_name?: string
}

export interface DocumentChunk {
  id: number
  document_id: number
  chunk_text: string
  chunk_index: number
  word_count: number
  character_count: number
  page_number?: number
  section_title?: string
  created_at: string
}

export interface DocumentUploadResponse {
  message: string
  document_id: number
  filename: string
  status: 'processing' | 'completed' | 'failed'
  file_size: number
}

export interface DocumentListResponse {
  documents: Document[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface VectorSearchQuery {
  query: string
  max_results?: number
  min_similarity_score?: number
}

export interface VectorSearchResult {
  chunk_id: number
  document_id: number
  document_title: string
  chunk_text: string
  relevance_score: number
  page_number?: number
  section_title?: string
}

export interface VectorSearchResponse {
  query: string
  results: VectorSearchResult[]
  total_results: number
  search_time_ms: number
}

export interface DocumentStats {
  total_documents: number
  processing_documents: number
  completed_documents: number
  failed_documents: number
  total_chunks: number
  total_words: number
  success_rate: number
  average_words_per_document: number
}

// Attachment Management Types
export interface Attachment {
  id: number
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_by: number
  message_id?: number
  created_at: string
  updated_at: string
  download_url?: string
  uploader_name?: string
}

export interface MessageAttachment {
  attachment_id: number
  filename: string
  mime_type: string
  file_size: number
  download_url: string
}

export interface AttachmentUploadResponse {
  message: string
  attachment_id: number
  filename: string
  file_size: number
  mime_type: string
  download_url: string
}

export interface AttachmentListResponse {
  attachments: Attachment[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface AttachmentStats {
  total_attachments: number
  image_attachments: number
  document_attachments: number
  audio_attachments: number
  video_attachments: number
  total_size_mb: number
  average_size_mb: number
}

// Frontend File Upload Types
export interface FileAttachment {
  id: string
  file: File
  preview?: string
  uploadProgress?: number
  error?: string
}

// Admin Messaging Types
export interface MessageTemplate {
  id: number
  name: string
  content: string
  message_type: string
  attachments_config?: Record<string, any>
  is_active: boolean
  created_by: number
  created_at: string
  updated_at: string
}

export interface MessageTemplateCreate {
  name: string
  content: string
  message_type?: string
  attachments_config?: Record<string, any>
}

export interface MessageTemplateUpdate {
  name?: string
  content?: string
  message_type?: string
  attachments_config?: Record<string, any>
}

export interface TemplateApplicationRequest {
  template_id: number
  conversation_id: number
  admin_note?: string
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
}

export interface TemplateApplicationResponse {
  message_id: number
  template_used: string
  content: string
  message_type: string
  conversation_id: number
  created_at: string
}

export interface TemplateStats {
  total_templates: number
  recent_templates: number
  template_messages_sent: number
  most_used_template: {
    name: string | null
    usage_count: number
  }
}

export interface AdminStats {
  total_admin_messages: number
  admin_messages_today: number
  active_admin_conversations: number
  attachment_usage: number
  template_stats: TemplateStats
}

export interface BroadcastMessageRequest {
  message: string
  message_type?: string
  conversation_ids: number[]
  attachments?: Record<string, any>[]
  admin_note?: string
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
}

export interface BroadcastResult {
  total_sent: number
  successful_sends: number
  failed_sends: number
  message_ids: number[]
  errors: string[]
}

export interface UserSearchRequest {
  query: string
  limit?: number
}

export interface UserSearchResponse {
  id: number
  phone_number: string
  full_name?: string
  email?: string
  role: string
  is_active: boolean
  last_message_at?: string
  conversation_count: number
}

export interface AdminMessageMetadata {
  admin_note?: string
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  template_used?: string
  campaign_id?: string
}

// Enhanced Message interface for admin features
export interface AdminMessage extends Message {
  admin_note?: string
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  campaign_id?: string
  is_template_based?: boolean
  template_id?: number
  template?: MessageTemplate
}