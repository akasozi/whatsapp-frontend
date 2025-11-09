import React from 'react';
import { Conversation } from '@/lib/api';
import { format, formatDistanceToNow } from 'date-fns';
import Avatar from './Avatar';

interface ConversationListItemProps {
  conversation: Conversation;
  isActive?: boolean;
  onClick: () => void;
}

export default function ConversationListItem({
  conversation,
  isActive = false,
  onClick,
}: ConversationListItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) {
      return format(date, 'EEE');
    } else {
      return format(date, 'MM/dd/yy');
    }
  };

  const lastMessage = conversation.messages?.[0];
  const lastMessagePreview = lastMessage?.content?.slice(0, 50) || 'No messages yet';

  return (
    <div
      onClick={onClick}
      className={`flex items-start space-x-3 p-4 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-100 ${
        isActive ? 'bg-gray-100' : ''
      }`}
    >
      <Avatar
        name={conversation.user?.full_name}
        phoneNumber={conversation.user?.phone_number}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {conversation.user?.full_name || conversation.user?.phone_number || 'Unknown'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {conversation.user?.phone_number}
            </p>
          </div>
          <div className="flex flex-col items-end ml-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {formatTime(conversation.last_message_at || conversation.created_at)}
            </span>
            <span
              className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                conversation.status
              )}`}
            >
              {conversation.status}
            </span>
          </div>
        </div>
        {lastMessage && (
          <p className="mt-1 text-sm text-gray-600 truncate">
            {lastMessage.source === 'AGENT' || lastMessage.source === 'BOT' ? (
              <span className="text-whatsapp-600">You: </span>
            ) : null}
            {lastMessagePreview}
            {lastMessage.content && lastMessage.content.length > 50 ? '...' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
