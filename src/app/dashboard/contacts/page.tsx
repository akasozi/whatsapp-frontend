'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Contact, ContactGroup } from '@/types'
import {
  PlusIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  UsersIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import GroupManagementModal from '@/components/contacts/GroupManagementModal'

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'import' | 'groups'>('list')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null)
  const [isManageModalOpen, setIsManageModalOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [language, setLanguage] = useState('en_US')

  const queryClient = useQueryClient()

  const { data: contactsData, isLoading: loadingContacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => apiClient.getContacts({ skip: 0, limit: 100 })
  })

  const { data: groupsData, isLoading: loadingGroups } = useQuery({
    queryKey: ['contactGroups'],
    queryFn: () => apiClient.getContactGroups({ skip: 0, limit: 50 })
  })

  const { data: templatesData } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const templates = await apiClient.getAdminTemplates({ skip: 0, limit: 100 })
      return { templates }
    }
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => apiClient.uploadContactsCSV(file),
    onSuccess: (data) => {
      toast.success(`Imported ${data.successful} of ${data.total_rows} contacts. ${data.duplicates} duplicates skipped.`)
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      setSelectedFile(null)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || 'Failed to import contacts')
    }
  })

  const createGroupMutation = useMutation({
    mutationFn: (payload: any) => apiClient.createContactGroup(payload),
    onSuccess: () => {
      toast.success('Group created')
      queryClient.invalidateQueries({ queryKey: ['contactGroups'] })
      setNewGroupName('')
      setNewGroupDescription('')
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to create group')
  })

  const sendToGroupMutation = useMutation({
    mutationFn: ({ groupId, payload }: any) => apiClient.sendTemplateToGroup(groupId, payload),
    onSuccess: (data) => {
      toast.success(`Sent to ${data.successful} of ${data.total_recipients}`)
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to send template')
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return toast.error('Please select a CSV file')
    uploadMutation.mutate(selectedFile)
  }

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim()) return toast.error('Group name is required')
    createGroupMutation.mutate({ name: newGroupName, description: newGroupDescription })
  }

  const handleTemplateSelect = (templateId: string) => {
    if (!templateId) {
      setSelectedTemplateId(null)
      setTemplateName('')
      setLanguage('en_US')
      return
    }

    const template = templatesData?.templates?.find((t: any) => t.id === Number(templateId))
    if (template && template.is_whatsapp_template) {
      setSelectedTemplateId(template.id)
      setTemplateName(template.whatsapp_template_name || template.name)
      setLanguage(template.template_language || 'en_US')
    }
  }

  const handleSendToGroup = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGroupId) return toast.error('Select a group')
    if (!templateName.trim()) return toast.error('Template required')

    sendToGroupMutation.mutate({ groupId: selectedGroupId, payload: { template_name: templateName, language } })
  }

  const downloadSampleCSV = () => {
    // Create sample CSV content
    const csvContent = `phone_number,full_name,email,notes
254712345678,John Doe,john@example.com,VIP customer
254723456789,Jane Smith,jane@example.com,Premium member
254734567890,Bob Johnson,,Regular customer`

    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

    // Create a download link
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'contact_import_sample.csv')
    link.style.visibility = 'hidden'

    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success('Sample CSV downloaded')
  }

  const handleManageGroup = (group: ContactGroup) => {
    console.log('handleManageGroup called with group:', group)
    setSelectedGroup(group)
    setIsManageModalOpen(true)
    console.log('Modal state set to true')
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
        <p className="text-gray-600">Manage contacts, import CSVs, and send template messages to groups</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`${activeTab === 'list' ? 'border-whatsapp-500 text-whatsapp-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <UsersIcon className="h-5 w-5 inline-block mr-2" />
            Contact List
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`${activeTab === 'import' ? 'border-whatsapp-500 text-whatsapp-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <ArrowUpTrayIcon className="h-5 w-5 inline-block mr-2" />
            Import CSV
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`${activeTab === 'groups' ? 'border-whatsapp-500 text-whatsapp-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            <DocumentTextIcon className="h-5 w-5 inline-block mr-2" />
            Groups
          </button>
        </nav>
      </div>

      {activeTab === 'list' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">All Contacts</h2>
              <p className="text-sm text-gray-500">{contactsData ? `${contactsData.total} contacts` : ''}</p>
            </div>
            <div>
              <button onClick={() => setActiveTab('import')} className="inline-flex items-center px-4 py-2 bg-whatsapp-500 text-white rounded-lg hover:bg-whatsapp-600">
                <PlusIcon className="h-4 w-4 mr-2" /> Import CSV
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            {loadingContacts ? (
              <div className="p-6 text-center">Loading...</div>
            ) : contactsData && contactsData.contacts && contactsData.contacts.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {contactsData.contacts.map((c: Contact) => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{c.full_name || c.phone_number}</div>
                      <div className="text-xs text-gray-500">{c.phone_number} {c.email ? `• ${c.email}` : ''}</div>
                    </div>
                    <div className="text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500">No contacts yet. Import a CSV to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="max-w-2xl">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Import Contacts (CSV)</h2>
            <p className="text-sm text-gray-500 mb-4">CSV must include `phone_number` column. Max 5MB per file.</p>

            <form onSubmit={handleUpload} className="space-y-4">
              <input type="file" accept=".csv" onChange={handleFileChange} />

              <div className="flex items-center space-x-3">
                <button type="submit" disabled={uploadMutation.isPending} className="inline-flex items-center px-4 py-2 bg-whatsapp-500 text-white rounded-lg hover:bg-whatsapp-600 disabled:opacity-50">
                  {uploadMutation.isPending ? 'Importing...' : 'Upload & Import'}
                </button>
                <button type="button" onClick={downloadSampleCSV} className="text-sm text-whatsapp-600 hover:text-whatsapp-700 underline">
                  Download sample CSV
                </button>
              </div>

              {uploadMutation.isError && (
                <div className="text-sm text-red-600">Upload failed</div>
              )}
            </form>
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create Group</h3>
              <form onSubmit={handleCreateGroup} className="space-y-3">
                <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Group name" className="w-full border-gray-200 rounded-md p-2" />
                <input value={newGroupDescription} onChange={(e) => setNewGroupDescription(e.target.value)} placeholder="Description (optional)" className="w-full border-gray-200 rounded-md p-2" />
                <div className="flex items-center space-x-3">
                  <button type="submit" className="inline-flex items-center px-4 py-2 bg-whatsapp-500 text-white rounded-lg hover:bg-whatsapp-600">
                    <PlusIcon className="h-4 w-4 mr-2" /> Create
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Groups</h3>
              {loadingGroups ? (
                <div>Loading groups...</div>
              ) : groupsData && groupsData.groups && groupsData.groups.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {groupsData.groups.map((g: ContactGroup) => (
                    <div key={g.id} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{g.name}</div>
                        <div className="text-xs text-gray-500">{g.member_count || 0} members</div>
                      </div>
                      <div>
                        <button
                          onClick={() => handleManageGroup(g)}
                          className="px-3 py-1 rounded bg-whatsapp-500 text-white hover:bg-whatsapp-600"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>No groups yet</div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Send Template to Group</h3>
              <form onSubmit={handleSendToGroup} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Group</label>
                  <select
                    value={selectedGroupId || ''}
                    onChange={(e) => setSelectedGroupId(e.target.value ? Number(e.target.value) : null)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-whatsapp-500 focus:border-whatsapp-500 sm:text-sm"
                  >
                    <option value="">-- Select group --</option>
                    {groupsData?.groups?.map((g: ContactGroup) => (
                      <option key={g.id} value={g.id}>{g.name} ({g.member_count || 0} members)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Template</label>
                  <select
                    value={selectedTemplateId || ''}
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-whatsapp-500 focus:border-whatsapp-500 sm:text-sm"
                    required
                  >
                    <option value="">-- Select a WhatsApp template --</option>
                    {templatesData?.templates
                      ?.filter((t: any) => t.is_whatsapp_template)
                      .map((template: any) => (
                        <option key={template.id} value={template.id}>
                          {template.name} ({template.whatsapp_template_name})
                        </option>
                      ))}
                  </select>
                </div>

                {selectedTemplateId && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="text-xs text-gray-600">
                      <div><strong>Template:</strong> {templateName}</div>
                      <div><strong>Language:</strong> {language}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    disabled={sendToGroupMutation.isPending}
                    className="inline-flex items-center px-4 py-2 bg-whatsapp-500 text-white rounded-lg hover:bg-whatsapp-600 disabled:opacity-50"
                  >
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    {sendToGroupMutation.isPending ? 'Sending...' : 'Send to Group'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* Group Management Modal */}
      {selectedGroup && isManageModalOpen && (
        <GroupManagementModal
          isOpen={isManageModalOpen}
          onClose={() => {
            setIsManageModalOpen(false)
            setSelectedGroup(null)
          }}
          group={selectedGroup}
        />
      )}
    </div>
  )
}