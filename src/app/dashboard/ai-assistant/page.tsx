'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import AIAssistantChat from '@/components/ai-assistant/AIAssistantChat'
import { apiClient } from '@/lib/api'

export default function AIAssistantPage() {
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)

  // Fetch suggested questions
  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ['ai-assistant-suggested-questions'],
    queryFn: () => apiClient.getSuggestedQuestions(),
    onSuccess: (data) => {
      // Flatten all categories into a single list
      const allQuestions: string[] = []
      if (data.categories) {
        Object.values(data.categories).forEach((categoryQuestions: string[]) => {
          allQuestions.push(...categoryQuestions)
        })
      } else if (data.questions) {
        allQuestions.push(...data.questions)
      }
      setSuggestedQuestions(allQuestions.slice(0, 8)) // Limit to 8 suggestions
      setIsLoadingQuestions(false)
    },
    onError: () => {
      setIsLoadingQuestions(false)
    }
  })

  return (
    <div className="flex h-full bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
                <p className="text-sm text-gray-500">Ask questions about your WhatsApp platform usage and analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Online
              </span>
            </div>
          </div>
        </div>

        {/* Chat Component */}
        <div className="flex-1 overflow-hidden">
          <AIAssistantChat />
        </div>
      </div>

      {/* Suggested Questions Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Questions</h3>

          {isLoadingQuestions ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded-lg w-full"></div>
                  <div className="h-3 bg-gray-200 rounded-lg w-3/4 mt-2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600 mb-3">
                Click any question to ask the AI Assistant:
              </div>

              {/* User Analytics */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">User Analytics</h4>
                <div className="space-y-2">
                  {suggestedQuestions.filter(q =>
                    q.toLowerCase().includes('user') || q.toLowerCase().includes('how many')
                  ).slice(0, 2).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        // This will be handled by the chat component
                        window.dispatchEvent(new CustomEvent('askAIQuestion', { detail: question }))
                      }}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-purple-50 rounded-lg text-sm text-gray-700 hover:text-purple-700 transition-colors duration-150 border border-gray-200 hover:border-purple-200"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Analysis */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Content Analysis</h4>
                <div className="space-y-2">
                  {suggestedQuestions.filter(q =>
                    q.toLowerCase().includes('question') || q.toLowerCase().includes('topic') || q.toLowerCase().includes('sentiment')
                  ).slice(0, 2).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('askAIQuestion', { detail: question }))
                      }}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-purple-50 rounded-lg text-sm text-gray-700 hover:text-purple-700 transition-colors duration-150 border border-gray-200 hover:border-purple-200"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Performance</h4>
                <div className="space-y-2">
                  {suggestedQuestions.filter(q =>
                    q.toLowerCase().includes('response') || q.toLowerCase().includes('time') || q.toLowerCase().includes('hour')
                  ).slice(0, 2).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('askAIQuestion', { detail: question }))
                      }}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-purple-50 rounded-lg text-sm text-gray-700 hover:text-purple-700 transition-colors duration-150 border border-gray-200 hover:border-purple-200"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Capabilities Info */}
          <div className="mt-6 p-4 bg-purple-50 rounded-lg">
            <h4 className="text-sm font-semibold text-purple-900 mb-2">AI Capabilities</h4>
            <ul className="text-xs text-purple-700 space-y-1">
              <li>• Natural language queries</li>
              <li>• Sentiment analysis</li>
              <li>• Topic modeling</li>
              <li>• User behavior analysis</li>
              <li>• Performance metrics</li>
              <li>• Custom analytics</li>
            </ul>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Tips</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Be specific in your questions</li>
              <li>• Include time periods when relevant</li>
              <li>• Ask follow-up questions</li>
              <li>• Use natural language</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}