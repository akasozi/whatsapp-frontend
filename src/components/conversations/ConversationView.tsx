'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Conversation, Message } from '@/lib/api';
import { apiClient } from '@/lib/api';
import MessageBubble from '@/components/ui/MessageBubble';
import MessageInput from '@/components/ui/MessageInput';
import Avatar from '@/components/ui/Avatar';
import { PhoneIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ConversationViewProps {
  conversationId: number;
}

export default function ConversationView({ conversationId }: ConversationViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [autoScroll, setAutoScroll] = useState(true);

  // Fetch conversation details
  const { data: conversation, isLoading: conversationLoading } = useQuery<Conversation>({
    queryKey: ['conversation', conversationId],
    queryFn: () => apiClient.getConversation(conversationId),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch messages for the conversation
  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['messages', conversationId],
    queryFn: () =>
      apiClient.getMessages({ conversation_id: conversationId, limit: 100 }),
    refetchInterval: 3000, // Refresh every 3 seconds for real-time feel
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      apiClient.sendMessage({
        conversation_id: conversationId,
        content,
        message_type: 'TEXT',
      }),
    onSuccess: () => {
      // Invalidate and refetch messages
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setAutoScroll(true);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, []);

  // Handle scroll to detect if user scrolled up
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    setAutoScroll(isAtBottom);
  };

  const handleSendMessage = (content: string) => {
    sendMessageMutation.mutate(content);
  };

  const sortedMessages = [...(messages || [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600';
      case 'PAUSED':
        return 'text-yellow-600';
      case 'COMPLETED':
        return 'text-blue-600';
      case 'ARCHIVED':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (conversationLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whatsapp-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Conversation not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#efeae2] relative">
      {/* Header - Fixed height */}
      <div className="bg-[#f0f2f5] border-b border-gray-300 px-4 py-3 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar
              name={conversation.user?.full_name}
              phoneNumber={conversation.user?.phone_number}
              size="lg"
            />
            <div>
              <h2 className="text-base font-medium text-gray-900">
                {conversation.user?.full_name || 'Unknown User'}
              </h2>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <PhoneIcon className="h-3 w-3" />
                <span>{conversation.user?.phone_number}</span>
                <span className="mx-1">•</span>
                <span className={`font-medium ${getStatusColor(conversation.status)}`}>
                  {conversation.status}
                </span>
              </div>
            </div>
          </div>
          <button className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-200/50 transition-colors">
            <EllipsisVerticalIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages Container with WhatsApp-style background - Takes remaining space minus input height */}
      <div
        className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 lg:px-16 py-4 flex flex-col"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d9d9d9' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#efeae2',
          paddingBottom: '80px', // Space for fixed input at bottom
        }}
        onScroll={handleScroll}
      >
        {messagesLoading && sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center bg-white/60 backdrop-blur-sm rounded-lg px-6 py-4 border border-gray-200 shadow-sm">
              <p className="text-gray-600 font-medium">No messages yet</p>
              <p className="text-sm text-gray-500 mt-1">Start the conversation below</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0"></div>
            <div className="space-y-2 py-2">
              {sortedMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.source === 'AGENT' || message.source === 'BOT'}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#f0f2f5] border-t border-gray-300 px-4 py-3 flex-shrink-0">
        <MessageInput
          onSend={handleSendMessage}
          disabled={sendMessageMutation.isPending || conversation.status === 'ARCHIVED'}
          placeholder={
            conversation.status === 'ARCHIVED'
              ? 'This conversation is archived'
              : 'Type a message...'
          }
        />
      </div>
    </div>
  );
}
