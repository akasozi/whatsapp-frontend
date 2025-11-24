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
  PaperAirplaneIcon,
  PencilIcon,
  TrashIcon
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
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [contactForm, setContactForm] = useState({
    phone_number: '',
    full_name: '',
    email: '',
    notes: ''
  })

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

  const createContactMutation = useMutation({
    mutationFn: (contactData: any) => apiClient.createContact(contactData),
    onSuccess: () => {
      toast.success('Contact created successfully')
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      setIsContactModalOpen(false)
      resetContactForm()
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to create contact')
  })

  const updateContactMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => apiClient.updateContact(id, data),
    onSuccess: () => {
      toast.success('Contact updated successfully')
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      setIsContactModalOpen(false)
      setEditingContact(null)
      resetContactForm()
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to update contact')
  })

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: number) => apiClient.deleteContact(contactId),
    onSuccess: () => {
      toast.success('Contact deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to delete contact')
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

  const resetContactForm = () => {
    setContactForm({
      phone_number: '',
      full_name: '',
      email: '',
      notes: ''
    })
  }

  const handleAddContact = () => {
    resetContactForm()
    setEditingContact(null)
    setIsContactModalOpen(true)
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setContactForm({
      phone_number: contact.phone_number,
      full_name: contact.full_name || '',
      email: contact.email || '',
      notes: contact.notes || ''
    })
    setIsContactModalOpen(true)
  }

  const handleDeleteContact = (contact: Contact) => {
    if (window.confirm(`Are you sure you want to delete ${contact.full_name || contact.phone_number}?`)) {
      deleteContactMutation.mutate(contact.id)
    }
  }

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!contactForm.phone_number.trim()) {
      toast.error('Phone number is required')
      return
    }

    if (editingContact) {
      updateContactMutation.mutate({ id: editingContact.id, data: contactForm })
    } else {
      createContactMutation.mutate(contactForm)
    }
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
            <div className="flex gap-2">
              <button onClick={handleAddContact} className="inline-flex items-center px-4 py-2 bg-whatsapp-500 text-white rounded-lg hover:bg-whatsapp-600">
                <PlusIcon className="h-4 w-4 mr-2" /> Add Contact
              </button>
              <button onClick={() => setActiveTab('import')} className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <ArrowUpTrayIcon className="h-4 w-4 mr-2" /> Import CSV
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
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{c.full_name || c.phone_number}</div>
                      <div className="text-xs text-gray-500">{c.phone_number} {c.email ? `• ${c.email}` : ''}</div>
                      {c.notes && <div className="text-xs text-gray-400 mt-1">{c.notes}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-gray-500">{new Date(c.created_at).toLocaleDateString()}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditContact(c)}
                          className="p-1 text-gray-400 hover:text-whatsapp-600 transition-colors"
                          title="Edit contact"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(c)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete contact"
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

      {/* Contact Add/Edit Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsContactModalOpen(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleContactFormSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingContact ? 'Edit Contact' : 'Add New Contact'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {editingContact ? 'Update contact information.' : 'Create a new contact.'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="phone_number"
                        value={contactForm.phone_number}
                        onChange={(e) => setContactForm({ ...contactForm, phone_number: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-whatsapp-500 focus:border-whatsapp-500 sm:text-sm"
                        placeholder="254712345678"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">Include country code (e.g., 254712345678)</p>
                    </div>

                    <div>
                      <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        value={contactForm.full_name}
                        onChange={(e) => setContactForm({ ...contactForm, full_name: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-whatsapp-500 focus:border-whatsapp-500 sm:text-sm"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-whatsapp-500 focus:border-whatsapp-500 sm:text-sm"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Notes
                      </label>
                      <textarea
                        id="notes"
                        rows={3}
                        value={contactForm.notes}
                        onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-whatsapp-500 focus:border-whatsapp-500 sm:text-sm"
                        placeholder="Additional notes about this contact..."
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={createContactMutation.isPending || updateContactMutation.isPending}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-whatsapp-500 text-base font-medium text-white hover:bg-whatsapp-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-whatsapp-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {(createContactMutation.isPending || updateContactMutation.isPending) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {editingContact ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {editingContact ? 'Update Contact' : 'Create Contact'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsContactModalOpen(false)
                      setEditingContact(null)
                      resetContactForm()
                    }}
                    disabled={createContactMutation.isPending || updateContactMutation.isPending}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-whatsapp-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}