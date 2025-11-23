'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { MessageTemplate, MessageTemplateCreate, WhatsAppTemplateMessageRequest } from '@/types'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

type TabType = 'internal' | 'whatsapp'

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('internal')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  const { data: templates, isLoading } = useQuery({
    queryKey: ['adminTemplates', searchTerm],
    queryFn: () => apiClient.getAdminTemplates(searchTerm ? { search: searchTerm } : {}),
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
        <h1 className="text-2xl font-bold text-gray-900">Message Templates</h1>
        <p className="text-gray-600">Manage internal templates and send WhatsApp template messages</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('internal')}
            className={`${
              activeTab === 'internal'
                ? 'border-whatsapp-500 text-whatsapp-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <DocumentTextIcon className="h-5 w-5 inline-block mr-2" />
            Internal Templates
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`${
              activeTab === 'whatsapp'
                ? 'border-whatsapp-500 text-whatsapp-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <PaperAirplaneIcon className="h-5 w-5 inline-block mr-2" />
            WhatsApp Templates
          </button>
        </nav>
      </div>

      {/* Internal Templates Tab */}
      {activeTab === 'internal' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1 mr-4">
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-whatsapp-500 text-white rounded-lg hover:bg-whatsapp-600 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Template
            </button>
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
        </div>
      )}

      {/* WhatsApp Templates Tab */}
      {activeTab === 'whatsapp' && (
        <WhatsAppTemplateSender />
      )}

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
    is_whatsapp_template: (template as any)?.is_whatsapp_template || false,
    whatsapp_template_id: (template as any)?.whatsapp_template_id || '',
    whatsapp_template_name: (template as any)?.whatsapp_template_name || '',
    template_language: (template as any)?.template_language || 'en',
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

    if (formData.is_whatsapp_template && !formData.whatsapp_template_name.trim()) {
      newErrors.whatsapp_template_name = 'WhatsApp template name is required'
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

  const handleChange = (field: string, value: string | boolean) => {
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

                {/* WhatsApp Template Section */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_whatsapp_template"
                      checked={formData.is_whatsapp_template}
                      onChange={(e) => handleChange('is_whatsapp_template', e.target.checked)}
                      className="h-4 w-4 text-whatsapp-600 focus:ring-whatsapp-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_whatsapp_template" className="ml-2 block text-sm font-medium text-gray-700">
                      This is a WhatsApp Template
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Check this if you want to save a Meta-approved WhatsApp template for quick sending
                  </p>
                </div>

                {formData.is_whatsapp_template && (
                  <>
                    <div>
                      <label htmlFor="whatsapp_template_id" className="block text-sm font-medium text-gray-700">
                        WhatsApp Template ID
                      </label>
                      <input
                        type="text"
                        id="whatsapp_template_id"
                        value={formData.whatsapp_template_id}
                        onChange={(e) => handleChange('whatsapp_template_id', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-whatsapp-500 focus:border-whatsapp-500 sm:text-sm"
                        placeholder="e.g., 1159498332229173"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Optional: Meta template ID for reference
                      </p>
                    </div>

                    <div>
                      <label htmlFor="whatsapp_template_name" className="block text-sm font-medium text-gray-700">
                        WhatsApp Template Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="whatsapp_template_name"
                        value={formData.whatsapp_template_name}
                        onChange={(e) => handleChange('whatsapp_template_name', e.target.value)}
                        className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-whatsapp-500 focus:border-whatsapp-500 sm:text-sm ${
                          errors.whatsapp_template_name ? 'border-red-500' : ''
                        }`}
                        placeholder="e.g., welcome_message"
                      />
                      {errors.whatsapp_template_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.whatsapp_template_name}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Required: The exact template name from Meta
                      </p>
                    </div>

                    <div>
                      <label htmlFor="template_language" className="block text-sm font-medium text-gray-700">
                        Template Language
                      </label>
                      <select
                        id="template_language"
                        value={formData.template_language}
                        onChange={(e) => handleChange('template_language', e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-whatsapp-500 focus:border-whatsapp-500 sm:text-sm"
                      >
                        <option value="en">English (en)</option>
                        <option value="en_GB">English GB (en_GB)</option>
                        <option value="en_US">English US (en_US)</option>
                        <option value="es">Spanish (es)</option>
                        <option value="fr">French (fr)</option>
                        <option value="de">German (de)</option>
                        <option value="pt">Portuguese (pt)</option>
                        <option value="ar">Arabic (ar)</option>
                        <option value="hi">Hindi (hi)</option>
                        <option value="sw">Swahili (sw)</option>
                      </select>
                    </div>
                  </>
                )}
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

function WhatsAppTemplateSender() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [language, setLanguage] = useState('en_US')
  const [recipients, setRecipients] = useState('')
  const [sendResult, setSendResult] = useState<any>(null)

  // Fetch all templates to filter for WhatsApp templates
  const { data: allTemplates } = useQuery({
    queryKey: ['adminTemplates'],
    queryFn: () => apiClient.getAdminTemplates({}),
  })

  // Filter only WhatsApp templates
  const whatsappTemplates = allTemplates?.filter(t => t.is_whatsapp_template) || []

  const sendTemplateMutation = useMutation({
    mutationFn: (data: WhatsAppTemplateMessageRequest) =>
      apiClient.sendWhatsAppTemplate(data),
    onSuccess: (data) => {
      setSendResult(data)
      if (data.successful > 0) {
        toast.success(`Template sent to ${data.successful} of ${data.total_recipients} recipients`)
      }
      if (data.failed > 0) {
        toast.error(`Failed to send to ${data.failed} recipients`)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to send template messages')
      setSendResult(null)
    }
  })

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTemplateId) {
      toast.error('Please select a WhatsApp template')
      return
    }

    if (!templateName.trim()) {
      toast.error('Template Name is required')
      return
    }

    if (!recipients.trim()) {
      toast.error('At least one recipient is required')
      return
    }

    // Parse recipients (one per line or comma-separated)
    const recipientList = recipients
      .split(/[\n,]/)
      .map(r => r.trim())
      .filter(r => r.length > 0)

    if (recipientList.length === 0) {
      toast.error('Please enter valid phone numbers')
      return
    }

    if (recipientList.length > 100) {
      toast.error('Maximum 100 recipients allowed per request')
      return
    }

    sendTemplateMutation.mutate({
      template_name: templateName,
      language: language,
      recipients: recipientList,
      parameters: undefined // TODO: Add parameter support later
    })
  }

  const handleTemplateSelect = (templateId: string) => {
    if (!templateId) {
      return
    }

    const template = whatsappTemplates.find(t => t.id === Number(templateId))
    if (template) {
      console.log('Selected template:', template)
      console.log('WhatsApp template name:', template.whatsapp_template_name)
      console.log('Template language:', template.template_language)

      setSelectedTemplateId(template.id)
      setTemplateName(template.whatsapp_template_name || '')
      setLanguage(template.template_language || 'en_US')

      console.log('State updated - templateName:', template.whatsapp_template_name || '')
      console.log('State updated - language:', template.template_language || 'en_US')
    } else {
      console.error('Template not found in whatsappTemplates:', templateId)
      console.log('Available templates:', whatsappTemplates)
    }
  }

  const handleReset = () => {
    setSelectedTemplateId(null)
    setTemplateName('')
    setLanguage('en_US')
    setRecipients('')
    setSendResult(null)
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900">Send WhatsApp Template Message</h2>
          <p className="mt-1 text-sm text-gray-500">
            Send Meta-approved WhatsApp template messages to multiple recipients
          </p>
        </div>

        <form onSubmit={handleSend} className="space-y-6">
          {/* Select WhatsApp Template */}
          <div>
            <label htmlFor="quick_select" className="block text-sm font-medium text-gray-700">
              WhatsApp Template <span className="text-red-500">*</span>
            </label>
            {whatsappTemplates.length > 0 ? (
              <>
                <select
                  id="quick_select"
                  value={selectedTemplateId || ''}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-whatsapp-500 focus:border-whatsapp-500 sm:text-sm"
                >
                  <option value="">-- Select a WhatsApp template --</option>
                  {whatsappTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name} ({template.whatsapp_template_name})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Select a saved WhatsApp template (template name and language will be auto-filled)
                </p>
              </>
            ) : (
              <div className="mt-1 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  No WhatsApp templates saved yet. Go to the "Internal Templates" tab and create a WhatsApp template first.
                </p>
              </div>
            )}
          </div>

          {/* Display selected template details */}
          {selectedTemplateId && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Template Details:</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><span className="font-medium">Template Name:</span> {templateName}</p>
                <p><span className="font-medium">Language:</span> {language}</p>
              </div>
            </div>
          )}


          <div>
            <label htmlFor="recipients" className="block text-sm font-medium text-gray-700">
              Recipients
            </label>
            <textarea
              id="recipients"
              rows={6}
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-whatsapp-500 focus:border-whatsapp-500 sm:text-sm font-mono"
              placeholder="254728107303&#10;254719190725&#10;254720433354"
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter phone numbers (one per line or comma-separated). Include country code without '+'. Max 100 recipients.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="submit"
              disabled={sendTemplateMutation.isPending}
              className="inline-flex items-center px-4 py-2 bg-whatsapp-500 text-white rounded-lg hover:bg-whatsapp-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendTemplateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Send Template
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Results */}
        {sendResult && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-base font-medium text-gray-900 mb-4">Send Results</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">{sendResult.total_recipients}</div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-900">{sendResult.successful}</div>
                <div className="text-sm text-green-600">Successful</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-900">{sendResult.failed}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Detailed Results:</h4>
              <div className="space-y-2">
                {sendResult.results.map((result: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded ${
                      result.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${
                        result.status === 'success' ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {result.phone_number}
                      </span>
                      {result.status === 'success' && result.message_id && (
                        <span className="text-xs text-green-600">
                          ID: {result.message_id}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${
                      result.status === 'success' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.status === 'success' ? '✓ Sent' : `✗ ${result.error}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
