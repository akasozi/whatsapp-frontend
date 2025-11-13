'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  PaperClipIcon,
  XMarkIcon,
  DocumentIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline';

interface Attachment {
  id: string;
  file: File;
  preview?: string;
  uploadProgress?: number;
  error?: string;
}

interface AttachmentUploadProps {
  onAttachmentsChange: (attachments: Attachment[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

const MAX_FILE_SIZE_MB = 20;
const MAX_FILES = 10;

const ALLOWED_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf'
  ],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
  video: ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo']
};

export default function AttachmentUpload({
  onAttachmentsChange,
  maxFiles = MAX_FILES,
  maxSizeMB = MAX_FILE_SIZE_MB,
  disabled = false
}: AttachmentUploadProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (ALLOWED_TYPES.images.includes(type)) return PhotoIcon;
    if (ALLOWED_TYPES.video.includes(type)) return VideoCameraIcon;
    if (ALLOWED_TYPES.audio.includes(type)) return MusicalNoteIcon;
    return DocumentIcon;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    // Check file type
    const allAllowedTypes = Object.values(ALLOWED_TYPES).flat();
    if (!allAllowedTypes.includes(file.type)) {
      return 'File type not supported';
    }

    return null;
  };

  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const addFiles = async (files: FileList) => {
    if (disabled) return;

    const newAttachments: Attachment[] = [];

    for (let i = 0; i < files.length && attachments.length + newAttachments.length < maxFiles; i++) {
      const file = files[i];
      const error = validateFile(file);

      const attachment: Attachment = {
        id: Math.random().toString(36).substr(2, 9),
        file,
        error: error || undefined
      };

      if (!error) {
        attachment.preview = await createPreview(file);
      }

      newAttachments.push(attachment);
    }

    const updatedAttachments = [...attachments, ...newAttachments];
    setAttachments(updatedAttachments);
    onAttachmentsChange(updatedAttachments);
  };

  const removeAttachment = (id: string) => {
    const updatedAttachments = attachments.filter(att => att.id !== id);
    setAttachments(updatedAttachments);
    onAttachmentsChange(updatedAttachments);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  }, [disabled, attachments.length, maxFiles]);

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      {/* Attachment Button */}
      <button
        type="button"
        onClick={openFileDialog}
        disabled={disabled || attachments.length >= maxFiles}
        className="inline-flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PaperClipIcon className="h-5 w-5" />
        <span>Attach File</span>
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        accept={Object.values(ALLOWED_TYPES).flat().join(',')}
        className="hidden"
        disabled={disabled}
      />

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragging
            ? 'border-whatsapp-500 bg-whatsapp-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onClick={openFileDialog}
      >
        <PaperClipIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
        <p className="text-sm text-gray-600">
          {isDragging ? 'Drop files here' : 'Drag & drop files here or click to browse'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Max {maxSizeMB}MB per file, {maxFiles} files total
        </p>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Attachments ({attachments.length}/{maxFiles})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {attachments.map((attachment) => {
              const Icon = getFileIcon(attachment.file.type);
              const isValid = !attachment.error;

              return (
                <div
                  key={attachment.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border ${
                    isValid
                      ? 'border-gray-200 bg-white'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  {/* Preview/Icon */}
                  <div className="flex-shrink-0">
                    {attachment.preview ? (
                      <img
                        src={attachment.preview}
                        alt={attachment.file.name}
                        className="h-10 w-10 object-cover rounded"
                      />
                    ) : (
                      <Icon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(attachment.file.size)}
                      {attachment.uploadProgress !== undefined && (
                        <span className="ml-2">
                          {attachment.uploadProgress < 100
                            ? `Uploading ${attachment.uploadProgress}%`
                            : 'Uploaded'}
                        </span>
                      )}
                    </p>
                    {attachment.error && (
                      <p className="text-xs text-red-600">{attachment.error}</p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeAttachment(attachment.id)}
                    className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}