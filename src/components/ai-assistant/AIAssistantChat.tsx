'use client'

import { useState, useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
// Note: react-hot-toast should be installed and set up in the app
import { apiClient } from '@/lib/api'
import MessageBubble from '@/components/ui/MessageBubble'
import MessageInput from '@/components/ui/MessageInput'

interface AIMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  data?: any
  suggestions?: string[]
  isLoading?: boolean
}

export default function AIAssistantChat() {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Assistant. I can help you analyze your WhatsApp platform usage and provide insights about user behavior, sentiment, topics, and performance metrics.\n\nYou can ask me questions like:\n• "How many users did we have today?"\n• "What are the most common questions?"\n• "What\'s our average response time?"\n• "Perform sentiment analysis on recent conversations"\n\nWhat would you like to know?',
      timestamp: new Date(),
      suggestions: [
        "How many unique users did we have today?",
        "What was the most commonly asked question?",
        "What are our peak conversation hours?",
        "Perform sentiment analysis"
      ]
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Listen for suggested question clicks from sidebar
  useEffect(() => {
    const handleAskQuestion = (event: CustomEvent) => {
      const question = event.detail
      handleSendMessage(question)
    }

    window.addEventListener('askAIQuestion', handleAskQuestion as EventListener)
    return () => {
      window.removeEventListener('askAIQuestion', handleAskQuestion as EventListener)
    }
  }, [])

  // Mutation for sending messages to AI
  const chatMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiClient.askAIAssistant(question)
      return response
    },
    onMutate: (question) => {
      // Add user message immediately
      const userMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: question,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, userMessage])

      // Add loading message
      const loadingMessage: AIMessage = {
        id: 'loading-' + Date.now(),
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        isLoading: true
      }
      setMessages(prev => [...prev, loadingMessage])

      setIsTyping(true)
    },
    onSuccess: (response, question) => {
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading))

      // Add AI response
      const aiMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: response.answer || 'I apologize, but I couldn\'t process your question. Please try rephrasing it.',
        timestamp: new Date(),
        data: response.detailed_data,
        suggestions: response.suggested_follow_up_questions || []
      }
      setMessages(prev => [...prev, aiMessage])

      setIsTyping(false)
    },
    onError: (error: any) => {
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading))

      // Add error message
      const errorMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error while processing your question. This might be due to:\n\n• Temporary system issues\n• Complex query requirements\n• Data availability\n\nPlease try rephrasing your question or contact support if the issue persists.',
        timestamp: new Date(),
        suggestions: [
          "Try a simpler question",
          "Check system status",
          "Ask about a different time period"
        ]
      }
      setMessages(prev => [...prev, errorMessage])

      setIsTyping(false)
      console.error('Failed to get AI response')
    }
  })

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || chatMutation.isLoading) return

    chatMutation.mutate(content.trim())
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const formatMessageContent = (content: string) => {
    // Convert markdown-like formatting to HTML
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br />')
      .replace(/•\s(.+?)(<br \/>|$)/g, '<li class="ml-4">$1</li>')
      .replace(/(<li.*?<\/li>)/s, '<ul class="list-disc ml-6 space-y-1">$1</ul>')
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col space-y-2">
            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-3xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {message.type === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-purple-900">AI Assistant</span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                {message.isLoading ? (
                  <div className="bg-gray-100 rounded-lg p-4 max-w-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div
                      className={`text-sm whitespace-pre-wrap ${
                        message.type === 'user' ? 'text-white' : 'text-gray-900'
                      }`}
                      dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                    />
                  </div>
                )}

                {message.type === 'assistant' && message.data && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-sm font-medium text-purple-900">Analytics Data</span>
                    </div>
                    <div className="text-xs text-purple-700 space-y-1">
                      {message.data.analysis_period_days && (
                        <div>• Period analyzed: {message.data.analysis_period_days} days</div>
                      )}
                      {message.data.messages_analyzed && (
                        <div>• Messages analyzed: {message.data.messages_analyzed}</div>
                      )}
                      {message.data.analysis_type && (
                        <div>• Analysis type: {message.data.analysis_type}</div>
                      )}
                    </div>
                  </div>
                )}

                {message.type === 'user' && (
                  <div className="flex items-center space-x-2 mt-1 justify-end">
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Suggested follow-up questions */}
            {message.type === 'assistant' && message.suggestions && message.suggestions.length > 0 && (
              <div className="flex justify-start">
                <div className="max-w-3xl order-1">
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Follow-up questions:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.slice(0, 3).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="inline-flex items-center px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 text-sm rounded-full transition-colors duration-150"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-600">AI Assistant is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <MessageInput
              onSend={handleSendMessage}
              disabled={chatMutation.isLoading}
              placeholder="Ask me anything about your WhatsApp platform..."
            />
          </div>
          {chatMutation.isLoading && (
            <button
              onClick={() => {
                // Cancel the current request
                chatMutation.reset()
                setMessages(prev => prev.filter(msg => !msg.isLoading))
                setIsTyping(false)
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Powered by AI • Responses are based on your platform data
          </div>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <button
              onClick={() => {
                setMessages([messages[0]]) // Keep only welcome message
                console.log('Chat cleared')
              }}
              className="hover:text-gray-700 transition-colors duration-150"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}