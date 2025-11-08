'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { format } from 'date-fns'
import { apiClient } from '@/lib/api'

export default function ConversationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations', statusFilter],
    queryFn: () => apiClient.getConversations({
      status: statusFilter !== 'all' ? statusFilter : undefined,
      limit: 50,
    }),
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  const filteredConversations = conversations?.filter(conversation =>
    conversation.user?.phone_number?.includes(searchTerm) ||
    conversation.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conversation.session_id && conversation.session_id.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800'
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage WhatsApp conversations
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="PAUSED">Paused</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto text-6xl text-gray-400">💬</div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No conversations found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No conversations have been started yet'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  href={`/dashboard/conversations/${conversation.id}`}
                  className="block hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* User Avatar */}
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                            <span className="text-white text-lg">👤</span>
                          </div>
                        </div>

                        {/* Conversation Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {conversation.user?.full_name || 'Unknown User'}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                              {conversation.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.user?.phone_number}
                          </p>
                          <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <span className="mr-1">⏰</span>
                              {format(new Date(conversation.created_at), 'MMM d, h:mm a')}
                            </span>
                            {conversation.last_message_at && (
                              <span>
                                Last: {format(new Date(conversation.last_message_at), 'MMM d, h:mm a')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination Info */}
      {filteredConversations.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Showing {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}