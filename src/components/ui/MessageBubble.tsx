import React, { useState } from 'react';
import { Message } from '@/lib/api';
import { format } from 'date-fns';
import {
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isAdmin?: boolean;
  onDownloadAttachment?: (attachmentId: string, filename: string) => void;
  onPreviewAttachment?: (attachmentId: string, type: string) => void;
}

export default function MessageBubble({
  message,
  isOwn,
  isAdmin = false,
  onDownloadAttachment,
  onPreviewAttachment
}: MessageBubbleProps) {
  const [imagePreview, setImagePreview] = useState(false);

  const bubbleClass = isOwn
    ? 'bg-[#d9fdd3] text-gray-900'
    : 'bg-white text-gray-900';

  const getSourceLabel = () => {
    if (message.source === 'BOT') return 'Bot';
    if (message.source === 'AGENT') return 'Agent';
    return null; // Don't show label for user messages
  };

  const sourceLabel = getSourceLabel();

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return PhotoIcon;
    if (type.startsWith('video/')) return VideoCameraIcon;
    if (type.startsWith('audio/')) return MusicalNoteIcon;
    return DocumentIcon;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = (attachmentId: string, filename: string) => {
    if (onDownloadAttachment) {
      onDownloadAttachment(attachmentId, filename);
    }
  };

  const handleMessageDownload = (messageId: string, filename: string) => {
    if (onDownloadAttachment) {
      // Use message ID for downloading message media
      onDownloadAttachment(messageId, filename);
    }
  };

  const handlePreview = (attachmentId: string, type: string) => {
    if (onPreviewAttachment) {
      onPreviewAttachment(attachmentId, type);
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] sm:max-w-[65%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {sourceLabel && (
          <span className="text-[11px] font-medium text-gray-600 mb-1 px-2">
            {sourceLabel}
          </span>
        )}
        <div
          className={`rounded-lg px-3 py-2 ${bubbleClass} shadow-md relative`}
          style={{
            borderRadius: isOwn ? '8px 8px 0px 8px' : '8px 8px 8px 0px',
          }}
        >
          {/* Text Message */}
          {message.message_type === 'TEXT' && (
            <p className="text-[14.5px] leading-[19px] whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* Image Message */}
          {message.message_type === 'IMAGE' && message.media_url && (
            <div className="space-y-2">
              <div className="relative group">
                <img
                  src={message.media_url}
                  alt="Message attachment"
                  className="rounded-md max-w-full h-auto cursor-pointer"
                  onClick={() => handlePreview(message.id || '', 'image')}
                />
                {isAdmin && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleMessageDownload(message.id || '', message.media_filename || 'image.jpg')}
                      className="bg-white rounded-full p-2 shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                )}
              </div>
              {message.content && (
                <p className="text-[14.5px] leading-[19px] whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
            </div>
          )}

          {/* Document Message */}
          {message.message_type === 'DOCUMENT' && (
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <DocumentIcon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                <span className="text-sm truncate">{message.media_filename || 'Document'}</span>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleMessageDownload(message.id || '', message.media_filename || 'document.pdf')}
                  className="flex-shrink-0 p-1 text-gray-600 hover:text-whatsapp-600 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Audio Message */}
          {message.message_type === 'AUDIO' && (
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
              <MusicalNoteIcon className="h-5 w-5 text-gray-600 flex-shrink-0" />
              <span className="text-sm flex-1">Voice message</span>
              {isAdmin && message.media_filename && (
                <button
                  onClick={() => handleMessageDownload(message.id || '', message.media_filename)}
                  className="flex-shrink-0 p-1 text-gray-600 hover:text-whatsapp-600 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Video Message */}
          {message.message_type === 'VIDEO' && (
            <div className="space-y-2">
              <div className="relative group">
                <VideoCameraIcon className="h-8 w-8 text-gray-600" />
                <div className="text-sm">Video attachment</div>
                {isAdmin && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => handleMessageDownload(message.id || '', message.media_filename || 'video.mp4')}
                      className="bg-white rounded-full p-2 shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                )}
              </div>
              {message.content && (
                <p className="text-[14.5px] leading-[19px] whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
            </div>
          )}

          {/* Multiple Attachments (from message_metadata) */}
          {message.has_attachments && message.message_metadata?.attachments && (
            <div className="space-y-2">
              {message.message_metadata.attachments.map((attachment: any, index: number) => {
                const Icon = getFileIcon(attachment.mime_type);
                return (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <Icon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{attachment.filename}</p>
                        {attachment.file_size && (
                          <p className="text-xs text-gray-500">{formatFileSize(attachment.file_size)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {attachment.mime_type?.startsWith('image/') && (
                        <button
                          onClick={() => handlePreview(attachment.id, attachment.mime_type)}
                          className="p-1 text-gray-600 hover:text-whatsapp-600 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleDownload(attachment.id, attachment.filename)}
                          className="p-1 text-gray-600 hover:text-whatsapp-600 transition-colors"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {message.content && (
                <p className="text-[14.5px] leading-[19px] whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              )}
            </div>
          )}
          <div className="flex items-end justify-end mt-1 space-x-1">
            <span className="text-[11px] text-gray-500 select-none">
              {format(new Date(message.created_at), 'HH:mm')}
            </span>
            {isOwn && (
              <svg
                className="w-4 h-4 text-gray-500"
                viewBox="0 0 16 11"
                fill="none"
              >
                <path
                  d="M11.071 0.929L5.657 6.343L3.929 4.615a1 1 0 00-1.414 1.414l2.5 2.5a1 1 0 001.414 0l6.5-6.5a1 1 0 00-1.414-1.414z"
                  fill="currentColor"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
