'use client'

import { useState, useEffect } from 'react'
import { Document, DocumentStats } from '@/types'
import PDFUpload from '@/components/knowledge-base/PDFUpload'
import DocumentList from '@/components/knowledge-base/DocumentList'
import {
  DocumentIcon,
  BookOpenIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

export default function KnowledgeBase() {
  const [stats, setStats] = useState<DocumentStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    fetchStats()
  }, [refreshTrigger])

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      setStatsError(null)

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/v1/documents/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }

      const data = await response.json()
      setStats(data)

    } catch (err) {
      console.error('Error fetching stats:', err)
      setStatsError(err instanceof Error ? err.message : 'Failed to fetch statistics')
    } finally {
      setStatsLoading(false)
    }
  }

  const handleUploadSuccess = (response: any) => {
    setNotification({
      type: 'success',
      message: `Document "${response.filename}" uploaded successfully. Processing started...`
    })
    setShowUploadModal(false)
    setRefreshTrigger(prev => prev + 1)

    // Clear notification after 5 seconds
    setTimeout(() => setNotification(null), 5000)
  }

  const handleUploadError = (error: string) => {
    setNotification({
      type: 'error',
      message: error
    })

    // Clear notification after 5 seconds
    setTimeout(() => setNotification(null), 5000)
  }

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document)
  }

  const closeModal = () => {
    setSelectedDocument(null)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-md ${
            notification.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setNotification(null)}
                  className={`inline-flex rounded-md p-1.5 ${
                    notification.type === 'success'
                      ? 'hover:bg-green-100'
                      : 'hover:bg-red-100'
                  }`}
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage PDF documents that enhance the chatbot's knowledge and responses.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </>
        ) : statsError ? (
          <div className="col-span-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{statsError}</p>
            <button
              onClick={fetchStats}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpenIcon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.total_documents)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.completed_documents)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Processing</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.processing_documents)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.success_rate}%</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Upload Section */}
      <PDFUpload
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />

      {/* Document List */}
      <DocumentList
        refreshTrigger={refreshTrigger}
        onDocumentClick={handleDocumentClick}
      />

      {/* Document Details Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Document Details</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{selectedDocument.original_filename}</h4>
                  {selectedDocument.metadata?.title && (
                    <p className="text-sm text-gray-600 mt-1">{selectedDocument.metadata.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedDocument.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : selectedDocument.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedDocument.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">File Size</p>
                    <p className="text-sm font-medium">
                      {(selectedDocument.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total Chunks</p>
                    <p className="text-sm font-medium">{selectedDocument.total_chunks}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Total Words</p>
                    <p className="text-sm font-medium">{selectedDocument.total_words.toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Uploaded By</p>
                    <p className="text-sm font-medium">{selectedDocument.uploader_name || 'Unknown'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Upload Date</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedDocument.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedDocument.processing_error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> {selectedDocument.processing_error}
                    </p>
                  </div>
                )}

                {selectedDocument.metadata?.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Description</p>
                    <p className="text-sm text-gray-900">{selectedDocument.metadata.description}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}