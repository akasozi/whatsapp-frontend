'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { apiClient } from '@/lib/api'
import { ConversationStats, MessageStats, AdminStats } from '@/types'
import {
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  TemplateIcon,
  MegaphoneIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState('overview')

  // Admin-specific statistics
  const { data: adminStats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => apiClient.getAdminDashboardStats(),
    refetchInterval: 30000,
  })

  // Regular statistics
  const { data: conversationStats } = useQuery({
    queryKey: ['conversationStats'],
    queryFn: () => apiClient.getConversationStats(),
    refetchInterval: 30000,
  })

  const { data: messageStats } = useQuery({
    queryKey: ['messageStats'],
    queryFn: () => apiClient.getMessageStats(),
    refetchInterval: 30000,
  })

  const adminStatsData = [
    {
      name: 'Admin Messages',
      value: adminStats?.total_admin_messages || 0,
      color: 'bg-blue-500',
      icon: '📋',
      change: `+${adminStats?.admin_messages_today || 0} today`,
      changeType: 'positive' as const,
    },
    {
      name: 'Active Admin Chats',
      value: adminStats?.active_admin_conversations || 0,
      color: 'bg-green-500',
      icon: '💬',
      change: 'Last 24h',
      changeType: 'neutral' as const,
    },
    {
      name: 'Templates Created',
      value: adminStats?.template_stats?.total_templates || 0,
      color: 'bg-purple-500',
      icon: '📝',
      change: `+${adminStats?.template_stats?.recent_templates || 0} this month`,
      changeType: 'positive' as const,
    },
    {
      name: 'Attachments Used',
      value: adminStats?.attachment_usage || 0,
      color: 'bg-orange-500',
      icon: '📎',
      change: 'Total',
      changeType: 'neutral' as const,
    },
  ]

  const regularStats = [
    {
      name: 'Total Conversations',
      value: conversationStats?.total_conversations || 0,
      color: 'bg-whatsapp-500',
      icon: '💬',
      change: '+2.1%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Messages',
      value: messageStats?.total_messages || 0,
      color: 'bg-primary-500',
      icon: '📤',
      change: '+12.5%',
      changeType: 'positive' as const,
    },
    {
      name: 'Unique Users',
      value: conversationStats?.unique_users || 0,
      color: 'bg-purple-500',
      icon: '👥',
      change: '+5.4%',
      changeType: 'positive' as const,
    },
    {
      name: 'Completion Rate',
      value: `${conversationStats?.completion_rate || 0}%`,
      color: 'bg-green-500',
      icon: '✅',
      change: '+1.2%',
      changeType: 'positive' as const,
    },
  ]

  const stats = selectedTab === 'overview' ? regularStats : adminStatsData

  const adminTabs = [
    { id: 'overview', name: 'Overview', icon: ChartBarIcon },
    { id: 'admin', name: 'Admin Actions', icon: Cog6ToothIcon },
  ]

  const adminQuickActions = [
    {
      name: 'Manage Templates',
      description: 'Create and edit message templates',
      icon: DocumentTextIcon,
      href: '/dashboard/templates',
      color: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
    },
    {
      name: 'View Conversations',
      description: 'Manage ongoing conversations',
      icon: ChatBubbleLeftRightIcon,
      href: '/dashboard/conversations',
      color: 'bg-whatsapp-50 text-whatsapp-700 hover:bg-whatsapp-100',
    },
    {
      name: 'Search Users',
      description: 'Find and message specific users',
      icon: UserGroupIcon,
      href: '/dashboard/users',
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
      name: 'Broadcast Message',
      description: 'Send messages to multiple users',
      icon: MegaphoneIcon,
      href: '/dashboard/broadcast',
      color: 'bg-orange-50 text-orange-700 hover:bg-orange-100',
    },
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage conversations and send WhatsApp messages</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {adminTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-whatsapp-500 text-whatsapp-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color} text-white mr-4`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                stat.changeType === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedTab === 'admin' ? 'Admin Actions' : 'Quick Actions'}
          </h2>
          <div className="space-y-3">
            {selectedTab === 'admin' ? (
              <>
                {adminQuickActions.map((action) => (
                  <Link
                    key={action.name}
                    href={action.href}
                    className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${action.color}`}
                  >
                    <div className="flex items-center">
                      <action.icon className="h-5 w-5 mr-3" />
                      <div>
                        <div className="font-medium">{action.name}</div>
                        <div className="text-sm opacity-75">{action.description}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            ) : (
              <>
                <Link
                  href="/dashboard/conversations"
                  className="block w-full text-left px-4 py-3 bg-whatsapp-50 text-whatsapp-700 rounded-lg hover:bg-whatsapp-100 transition-colors"
                >
                  <div className="flex items-center">
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-3" />
                    View All Conversations
                  </div>
                </Link>
                <Link
                  href="/dashboard/templates"
                  className="block w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-3" />
                    Manage Templates
                  </div>
                </Link>
                <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-3" />
                    View Analytics
                  </div>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600">New conversation started</span>
              <span className="ml-auto text-gray-500">2m ago</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Message sent successfully</span>
              <span className="ml-auto text-gray-500">5m ago</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Bot response generated</span>
              <span className="ml-auto text-gray-500">12m ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}