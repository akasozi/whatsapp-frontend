'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { MessageTemplate, MessageTemplateCreate } from '@/types'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function TemplatesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  const { data: templates, isLoading } = useQuery({
    queryKey: ['adminTemplates', searchTerm],
    queryFn: () => apiClient.getAdminTemplates({ search: searchTerm }),
  })

  const createTemplateMutation = useMutation({
    mutationFn: (templateData: MessageTemplateCreate) =>
      apiClient.createAdminTemplate(templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTemplates'] })
      setShowCreateModal(false)
      toast.success('Template created successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create template')
    }
  })

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<MessageTemplateCreate> }) =>
      apiClient.updateAdminTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTemplates'] })
      setEditingTemplate(null)
      toast.success('Template updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update template')
    }
  })

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteAdminTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTemplates'] })
      toast.success('Template deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to delete template')
    }
  })

  const handleCreateTemplate = (templateData: MessageTemplateCreate) => {
    createTemplateMutation.mutate(templateData)
  }

  const handleUpdateTemplate = (templateData: Partial<MessageTemplateCreate>) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({
        id: editingTemplate.id,
        data: templateData
      })
    }
  }

  const handleDeleteTemplate = (id: number) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(id)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Message Templates</h1>
            <p className="text-gray-600">Create and manage reusable message templates</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-whatsapp-500 text-white rounded-lg hover:bg-whatsapp-600 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Template
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-whatsapp-500 focus:border-whatsapp-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-white shadow rounded-lg">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-500 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading templates...</p>
          </div>
        ) : templates && templates.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {templates.map((template) => (
              <div key={template.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        template.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {template.content}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <span>Type: {template.message_type}</span>
                      <span className="mx-2">•</span>
                      <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit template"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete template"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No templates found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first template'}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-whatsapp-500 text-white rounded-lg hover:bg-whatsapp-600 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Template
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Template Modal */}
      {(showCreateModal || editingTemplate) && (
        <TemplateModal
          template={editingTemplate}
          onSave={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
          onClose={() => {
            setShowCreateModal(false)
            setEditingTemplate(null)
          }}
          isLoading={createTemplateMutation.isPending || updateTemplateMutation.isPending}
        />
      )}
    </div>
  )
}

interface TemplateModalProps {
  template?: MessageTemplate | null
  onSave: (data: MessageTemplateCreate | Partial<MessageTemplateCreate>) => void
  onClose: () => void
  isLoading: boolean
}

function TemplateModal({ template, onSave, onClose, isLoading }: TemplateModalProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    content: template?.content || '',
    message_type: template?.message_type || 'TEXT',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Template content is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {template ? 'Edit Template' : 'Create New Template'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {template ? 'Update the template details below.' : 'Create a reusable message template.'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Template Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-whatsapp-500 focus:border-whatsapp-500 sm:text-sm ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    placeholder="e.g., Welcome Message"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message_type" className="block text-sm font-medium text-gray-700">
                    Message Type
                  </label>
                  <select
                    id="message_type"
                    value={formData.message_type}
                    onChange={(e) => handleChange('message_type', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-whatsapp-500 focus:border-whatsapp-500 sm:text-sm"
                  >
                    <option value="TEXT">Text Message</option>
                    <option value="IMAGE">Image Message</option>
                    <option value="DOCUMENT">Document Message</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Message Content
                  </label>
                  <textarea
                    id="content"
                    rows={4}
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-whatsapp-500 focus:border-whatsapp-500 sm:text-sm ${
                      errors.content ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter your message content here..."
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-whatsapp-500 text-base font-medium text-white hover:bg-whatsapp-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-whatsapp-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {template ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {template ? 'Update Template' : 'Create Template'}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-whatsapp-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}