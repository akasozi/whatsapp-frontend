import React, { useState } from 'react';
import { Conversation, MessageTemplate } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import Avatar from './Avatar';
import {
  EllipsisVerticalIcon,
  DocumentTextIcon,
  PencilIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ConversationListItemProps {
  conversation: Conversation;
  isActive?: boolean;
  onClick: () => void;
  adminMode?: boolean;
  availableTemplates?: MessageTemplate[];
  onTemplateApply?: (templateId: number) => void;
  onNoteAdd?: () => void;
  onPriorityChange?: (priority: string) => void;
  messagePriority?: string;
}

export default function ConversationListItem({
  conversation,
  isActive = false,
  onClick,
  adminMode = false,
  availableTemplates = [],
  onTemplateApply,
  onNoteAdd,
  onPriorityChange,
  messagePriority = 'NORMAL'
}: ConversationListItemProps) {
  const [showAdminActions, setShowAdminActions] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'border-l-red-500 bg-red-50';
      case 'URGENT':
        return 'border-l-orange-500 bg-orange-50';
      case 'LOW':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-whatsapp-500 bg-whatsapp-50';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'URGENT':
        return 'bg-orange-100 text-orange-800';
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
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

  const handleTemplateSelect = (templateId: number) => {
    onTemplateApply?.(templateId)
    setShowTemplateSelector(false)
    setShowAdminActions(false)
  }

  return (
    <div
      onClick={(e) => {
        // Prevent click when admin actions are open
        if (!showAdminActions && !showTemplateSelector) {
          onClick()
        }
      }}
      className={`relative flex items-start space-x-3 p-4 cursor-pointer transition-colors hover:bg-gray-50 border-b border-gray-100 ${
        isActive ? 'bg-gray-100' : ''
      } ${adminMode ? getPriorityColor(messagePriority) : ''}`}
    >
      <Avatar
        name={conversation.user?.full_name}
        phoneNumber={conversation.user?.phone_number}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {conversation.user?.full_name || conversation.user?.phone_number || 'Unknown'}
              </p>
              {adminMode && messagePriority !== 'NORMAL' && (
                <span
                  className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(
                    messagePriority
                  )}`}
                >
                  {messagePriority}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">
              {conversation.user?.phone_number}
            </p>
          </div>
          <div className="flex flex-col items-end ml-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {formatTime(conversation.last_message_at || conversation.created_at)}
              </span>
              {adminMode && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowAdminActions(!showAdminActions)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </button>

                  {showAdminActions && (
                    <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[200px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowTemplateSelector(true)
                          setShowAdminActions(false)
                        }}
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      >
                        <DocumentTextIcon className="h-4 w-4 inline mr-2" />
                        Apply Template
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onNoteAdd?.()
                          setShowAdminActions(false)
                        }}
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                      >
                        <PencilIcon className="h-4 w-4 inline mr-2" />
                        Add Note
                      </button>
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <select
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            onPriorityChange?.(e.target.value)
                            setShowAdminActions(false)
                          }}
                          value={messagePriority}
                          className="w-full px-4 py-2 text-sm text-gray-700 bg-white border-0 focus:ring-0"
                        >
                          <option value="LOW">Low Priority</option>
                          <option value="NORMAL">Normal Priority</option>
                          <option value="HIGH">High Priority</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
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

        {/* Template Selector */}
        {showTemplateSelector && availableTemplates.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 z-20 mt-2">
            <div className="p-2">
              <p className="text-xs font-medium text-gray-700 px-2 py-1">Select a template:</p>
              {availableTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className="block w-full px-3 py-2 text-left hover:bg-gray-50 rounded border-b border-gray-100 last:border-0"
                >
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-gray-500 truncate">{template.content}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
