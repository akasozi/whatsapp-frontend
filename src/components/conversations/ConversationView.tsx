'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Conversation, Message } from '@/types';
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
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar
              name={conversation.user?.full_name}
              phoneNumber={conversation.user?.phone_number}
              size="lg"
            />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {conversation.user?.full_name || 'Unknown User'}
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <PhoneIcon className="h-4 w-4" />
                <span>{conversation.user?.phone_number}</span>
                <span className="mx-2">•</span>
                <span className={`font-medium ${getStatusColor(conversation.status)}`}>
                  {conversation.status}
                </span>
              </div>
            </div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <EllipsisVerticalIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-6 py-4 space-y-2"
        onScroll={handleScroll}
      >
        {messagesLoading && sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : sortedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Start the conversation below</p>
            </div>
          </div>
        ) : (
          sortedMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.source === 'AGENT' || message.source === 'BOT'}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
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
  );
}
