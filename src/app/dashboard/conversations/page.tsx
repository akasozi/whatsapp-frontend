'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Conversation } from '@/lib/api';
import ConversationListItem from '@/components/ui/ConversationListItem';
import ConversationView from '@/components/conversations/ConversationView';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function ConversationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [showMobileList, setShowMobileList] = useState(true);

  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations', statusFilter],
    queryFn: () =>
      apiClient.getConversations({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 50,
      }),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const filteredConversations =
    conversations?.filter(
      (conversation) =>
        conversation.user?.phone_number?.includes(searchTerm) ||
        conversation.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conversation.session_id &&
          conversation.session_id.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || [];

  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
    setShowMobileList(false);
  };

  const handleBackToList = () => {
    setShowMobileList(true);
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-gray-50">
      {/* Conversations List - Left Sidebar */}
      <div
        className={`${
          showMobileList ? 'block' : 'hidden'
        } lg:block lg:w-96 bg-white border-r border-gray-200 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Conversations</h1>
        </div>

        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-500"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isActive={selectedConversationId === conversation.id}
                onClick={() => handleSelectConversation(conversation.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Conversation View - Right Panel */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <ConversationView conversationId={selectedConversationId} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600 max-w-md">
                Choose a conversation from the left sidebar to start messaging
              </p>
            </div>
          </div>
        )}

        {/* Mobile Back Button */}
        {selectedConversationId && !showMobileList && (
          <div className="lg:hidden p-4 bg-white border-t border-gray-200">
            <button
              onClick={handleBackToList}
              className="flex items-center text-whatsapp-600 hover:text-whatsapp-700"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to conversations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}