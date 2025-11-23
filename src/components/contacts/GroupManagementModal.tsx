'use client'

import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, MagnifyingGlassIcon, UserMinusIcon, UserPlusIcon } from '@heroicons/react/24/outline'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { ContactGroup, Contact } from '@/types'
import toast from 'react-hot-toast'

interface GroupManagementModalProps {
  isOpen: boolean
  onClose: () => void
  group: ContactGroup
}

export default function GroupManagementModal({ isOpen, onClose, group }: GroupManagementModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<number[]>([])
  const queryClient = useQueryClient()

  // Fetch group members
  const { data: membersData, isLoading: loadingMembers } = useQuery({
    queryKey: ['groupMembers', group.id],
    queryFn: () => apiClient.getGroupMembers(group.id, { skip: 0, limit: 100 }),
    enabled: isOpen
  })

  // Fetch all contacts
  const { data: contactsData, isLoading: loadingContacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => apiClient.getContacts({ skip: 0, limit: 100 }),
    enabled: isOpen
  })

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (contactId: number) => apiClient.removeGroupMember(group.id, contactId),
    onSuccess: () => {
      toast.success('Member removed')
      queryClient.invalidateQueries({ queryKey: ['groupMembers', group.id] })
      queryClient.invalidateQueries({ queryKey: ['contactGroups'] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to remove member')
  })

  // Add members mutation
  const addMembersMutation = useMutation({
    mutationFn: (data: { contact_ids: number[] }) => apiClient.addGroupMembers(group.id, data),
    onSuccess: (data) => {
      toast.success(`Added ${data.added_count} members`)
      setSelectedContacts([])
      queryClient.invalidateQueries({ queryKey: ['groupMembers', group.id] })
      queryClient.invalidateQueries({ queryKey: ['contactGroups'] })
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Failed to add members')
  })

  const handleRemoveMember = (contactId: number) => {
    if (confirm('Remove this member from the group?')) {
      removeMemberMutation.mutate(contactId)
    }
  }

  const handleAddMembers = () => {
    if (selectedContacts.length === 0) {
      toast.error('Select at least one contact')
      return
    }
    addMembersMutation.mutate({ contact_ids: selectedContacts })
  }

  const toggleContactSelection = (contactId: number) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  // Get member IDs for filtering
  const memberIds = new Set(membersData?.members?.map((m: any) => m.contact_id) || [])

  // Filter available contacts (not already in group)
  const availableContacts = contactsData?.contacts?.filter((c: Contact) => !memberIds.has(c.id)) || []

  // Filter contacts based on search
  const filteredContacts = availableContacts.filter((c: Contact) =>
    searchQuery
      ? (c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         c.phone_number.includes(searchQuery) ||
         c.email?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true
  )

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                  <div>
                    <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                      Manage Group: {group.name}
                    </Dialog.Title>
                    <p className="text-sm text-gray-500 mt-1">
                      {group.member_count || 0} members • {group.description}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Current Members */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center justify-between">
                        <span>Current Members ({membersData?.members?.length || 0})</span>
                      </h4>

                      {loadingMembers ? (
                        <div className="text-center py-8 text-sm text-gray-500">Loading members...</div>
                      ) : membersData?.members && membersData.members.length > 0 ? (
                        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-96 overflow-y-auto">
                          {membersData.members.map((m: any) => (
                            <div key={m.contact_id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {m.contact_name || m.contact_phone}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {m.contact_phone}
                                  {m.contact_email && ` • ${m.contact_email}`}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveMember(m.contact_id)}
                                disabled={removeMemberMutation.isPending}
                                className="ml-3 p-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                                title="Remove member"
                              >
                                <UserMinusIcon className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg p-8 text-center">
                          <p className="text-sm text-gray-500">No members in this group yet</p>
                        </div>
                      )}
                    </div>

                    {/* Add Members */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Add Members</h4>

                      {/* Search */}
                      <div className="relative mb-3">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search contacts..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-whatsapp-500 focus:border-whatsapp-500"
                        />
                      </div>

                      {loadingContacts ? (
                        <div className="text-center py-8 text-sm text-gray-500">Loading contacts...</div>
                      ) : filteredContacts.length > 0 ? (
                        <>
                          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-80 overflow-y-auto mb-3">
                            {filteredContacts.slice(0, 50).map((c: Contact) => (
                              <div key={c.id} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                <label className="flex items-center flex-1 min-w-0 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedContacts.includes(c.id)}
                                    onChange={() => toggleContactSelection(c.id)}
                                    className="h-4 w-4 text-whatsapp-600 focus:ring-whatsapp-500 border-gray-300 rounded"
                                  />
                                  <div className="ml-3 flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {c.full_name || c.phone_number}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate">
                                      {c.phone_number}
                                      {c.email && ` • ${c.email}`}
                                    </div>
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>

                          {selectedContacts.length > 0 && (
                            <button
                              onClick={handleAddMembers}
                              disabled={addMembersMutation.isPending}
                              className="w-full inline-flex items-center justify-center px-4 py-2 bg-whatsapp-500 text-white rounded-lg hover:bg-whatsapp-600 disabled:opacity-50"
                            >
                              <UserPlusIcon className="h-5 w-5 mr-2" />
                              {addMembersMutation.isPending
                                ? 'Adding...'
                                : `Add ${selectedContacts.length} Contact${selectedContacts.length > 1 ? 's' : ''}`}
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="border border-gray-200 rounded-lg p-8 text-center">
                          <p className="text-sm text-gray-500">
                            {searchQuery ? 'No contacts found' : 'All contacts are already in this group'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Done
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
