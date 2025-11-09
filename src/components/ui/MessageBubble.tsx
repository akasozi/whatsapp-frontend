import React from 'react';
import { Message } from '@/lib/api';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const bubbleClass = isOwn
    ? 'bg-whatsapp-500 text-white ml-auto'
    : 'bg-white border border-gray-200 text-gray-900';

  const getSourceLabel = () => {
    if (message.source === 'BOT') return 'Bot';
    if (message.source === 'AGENT') return 'Agent';
    return 'User';
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && (
          <span className="text-xs text-gray-500 mb-1 px-1">
            {getSourceLabel()}
          </span>
        )}
        <div className={`rounded-lg px-4 py-2 ${bubbleClass} shadow-sm`}>
          {message.message_type === 'TEXT' && (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          )}
          {message.message_type === 'IMAGE' && message.media_url && (
            <div className="space-y-2">
              <img
                src={message.media_url}
                alt="Message attachment"
                className="rounded-md max-w-full h-auto"
              />
              {message.content && <p className="whitespace-pre-wrap">{message.content}</p>}
            </div>
          )}
          {message.message_type === 'DOCUMENT' && (
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">{message.media_filename || 'Document'}</span>
            </div>
          )}
          {message.message_type === 'AUDIO' && (
            <div className="flex items-center space-x-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <span className="text-sm">Voice message</span>
            </div>
          )}
          <div className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
            {format(new Date(message.created_at), 'HH:mm')}
          </div>
        </div>
      </div>
    </div>
  );
}
