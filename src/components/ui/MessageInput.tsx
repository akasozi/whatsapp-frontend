'use client';

import React, { useState } from 'react';
import {
  PaperAirplaneIcon,
  PaperClipIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/solid';
import AttachmentUpload from './AttachmentUpload';
import { MessageTemplate } from '@/types';

interface Attachment {
  id: string;
  file: File;
  preview?: string;
  uploadProgress?: number;
  error?: string;
}

interface MessageInputProps {
  onSend: (message: string, attachments: Attachment[], adminMetadata?: {
    adminNote?: string;
    priority?: string;
    templateId?: number;
    isTemplateBased?: boolean;
  }) => void;
  disabled?: boolean;
  placeholder?: string;
  showAttachments?: boolean;
  isAdminMode?: boolean;
  availableTemplates?: MessageTemplate[];
  selectedTemplate?: MessageTemplate | null;
  onTemplateSelect?: (template: MessageTemplate) => void;
}

export default function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  showAttachments = true,
  isAdminMode = false,
  availableTemplates = [],
  selectedTemplate = null,
  onTemplateSelect,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);

  // Admin-specific states
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showPrioritySelector, setShowPrioritySelector] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [showAdminNote, setShowAdminNote] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || attachments.length > 0) && !disabled) {
      const validAttachments = attachments.filter(att => !att.error);

      // Prepare admin metadata if in admin mode
      const adminMetadata = isAdminMode ? {
        adminNote: adminNote.trim() || undefined,
        priority: priority !== 'NORMAL' ? priority : undefined,
        templateId: selectedTemplate?.id,
        isTemplateBased: !!selectedTemplate
      } : undefined;

      onSend(message.trim(), validAttachments, adminMetadata);
      setMessage('');
      setAttachments([]);
      setShowAttachmentUpload(false);

      // Reset admin fields if not template-based
      if (!selectedTemplate) {
        setAdminNote('');
        setPriority('NORMAL');
      }
    }
  };

  const handleTemplateSelect = (template: MessageTemplate) => {
    setMessage(template.content);
    onTemplateSelect?.(template);
    setShowTemplateSelector(false);
  };

  const clearTemplate = () => {
    onTemplateSelect?.(null);
  };

  const handleAttachmentsChange = (newAttachments: Attachment[]) => {
    setAttachments(newAttachments);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = (message.trim() || attachments.some(att => !att.error)) && !disabled;
  const validAttachmentsCount = attachments.filter(att => !att.error).length;

  return (
    <div className="w-full space-y-3">
      {/* Admin Features */}
      {isAdminMode && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quick Templates
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="text-sm">
                  {selectedTemplate ? selectedTemplate.name : 'Select a template...'}
                </span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {showTemplateSelector && (
                <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 z-10 mt-1">
                  {availableTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateSelect(template)}
                      className="block w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-gray-500 truncate">{template.content}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Template Display */}
            {selectedTemplate && (
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center text-xs text-purple-600">
                  <DocumentTextIcon className="h-3 w-3 mr-1" />
                  Using template: {selectedTemplate.name}
                </div>
                <button
                  type="button"
                  onClick={clearTemplate}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Priority Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPrioritySelector(!showPrioritySelector)}
                className="w-full px-3 py-2 text-left border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-between"
              >
                <span className="capitalize text-sm">{priority.toLowerCase()}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {showPrioritySelector && (
                <div className="absolute top-full left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 z-10 mt-1">
                  {['low', 'normal', 'high', 'urgent'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        setPriority(level.toUpperCase())
                        setShowPrioritySelector(false)
                      }}
                      className="block w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <span className="capitalize">{level}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Admin Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Note
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Internal notes about this message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-whatsapp-500 focus:border-whatsapp-500 resize-none"
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Attachment Upload */}
      {showAttachments && showAttachmentUpload && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <AttachmentUpload
            onAttachmentsChange={handleAttachmentsChange}
            disabled={disabled}
          />
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-end space-x-2">
          {/* Template Button (Admin Mode) */}
          {isAdminMode && (
            <button
              type="button"
              onClick={() => setShowTemplateSelector(!showTemplateSelector)}
              disabled={disabled}
              className={`inline-flex items-center justify-center h-[42px] w-[42px] rounded-full transition-all duration-200 ${
                showTemplateSelector
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <DocumentTextIcon className="h-5 w-5" />
            </button>
          )}

          {/* Attachment Button */}
          {showAttachments && (
            <button
              type="button"
              onClick={() => setShowAttachmentUpload(!showAttachmentUpload)}
              disabled={disabled}
              className={`inline-flex items-center justify-center h-[42px] w-[42px] rounded-full transition-all duration-200 ${
                showAttachmentUpload
                  ? 'bg-whatsapp-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <PaperClipIcon className="h-5 w-5" />
            </button>
          )}

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className={`block w-full rounded-lg bg-white border px-4 py-2.5 text-[15px] focus:ring-1 resize-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors ${
                selectedTemplate
                  ? 'border-purple-300 focus:border-purple-500 focus:ring-purple-500'
                  : 'border-gray-300 focus:border-whatsapp-500 focus:ring-whatsapp-500'
              }`}
              style={{ minHeight: '42px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!canSend}
            className="inline-flex items-center justify-center h-[42px] w-[42px] rounded-full bg-whatsapp-500 text-white hover:bg-whatsapp-600 focus:outline-none focus:ring-2 focus:ring-whatsapp-500 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Attachment Status */}
        {validAttachmentsCount > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {validAttachmentsCount} file{validAttachmentsCount !== 1 ? 's' : ''} attached
          </div>
        )}

        {/* Admin Status */}
        {isAdminMode && (adminNote || priority !== 'NORMAL' || selectedTemplate) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {priority !== 'NORMAL' && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                priority === 'URGENT' ? 'bg-orange-100 text-orange-800' :
                priority === 'LOW' ? 'bg-gray-100 text-gray-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                Priority: {priority.toLowerCase()}
              </span>
            )}
            {adminNote && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                Note added
              </span>
            )}
            {selectedTemplate && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Template: {selectedTemplate.name}
              </span>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
