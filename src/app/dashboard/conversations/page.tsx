'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Conversation } from '@/types';
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
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">
      {/* Conversations List - Left Sidebar */}
      <div
        className={`${
          showMobileList ? 'block' : 'hidden'
        } lg:block w-full lg:w-96 border-r border-gray-200 bg-white flex flex-col`}
      >
        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <h1 className="text-xl font-bold text-gray-900">Conversations</h1>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 text-sm"
          >
            <option value="all">All Conversations</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="PAUSED">Paused</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading conversations...</p>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-4">
                <div className="text-5xl mb-3">💬</div>
                <h3 className="text-sm font-medium text-gray-900">No conversations found</h3>
                <p className="mt-1 text-xs text-gray-500">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Try adjusting your search or filter'
                    : 'No conversations yet'}
                </p>
              </div>
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
      <div
        className={`${
          !showMobileList ? 'block' : 'hidden'
        } lg:block flex-1 flex flex-col relative`}
      >
        {/* Mobile back button */}
        {selectedConversationId && (
          <button
            onClick={handleBackToList}
            className="lg:hidden absolute top-4 left-4 z-10 p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-gray-900"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {selectedConversationId ? (
          <ConversationView conversationId={selectedConversationId} />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-xl font-semibold text-gray-900">Select a conversation</h2>
              <p className="mt-2 text-gray-500">
                Choose a conversation from the list to view messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}