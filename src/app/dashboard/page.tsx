'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { ConversationStats, MessageStats } from '@/types'

export default function DashboardPage() {
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

  const stats = [
    {
      name: 'Active Conversations',
      value: conversationStats?.active_conversations || 3,
      color: 'bg-whatsapp-500',
      icon: '💬',
      change: '+2.1%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Messages',
      value: messageStats?.total_messages || 12,
      color: 'bg-primary-500',
      icon: '📤',
      change: '+12.5%',
      changeType: 'positive' as const,
    },
    {
      name: 'Unique Users',
      value: conversationStats?.unique_users || 8,
      color: 'bg-purple-500',
      icon: '👥',
      change: '+5.4%',
      changeType: 'positive' as const,
    },
    {
      name: 'Completion Rate',
      value: `${conversationStats?.completion_rate || 87}%`,
      color: 'bg-green-500',
      icon: '✅',
      change: '+1.2%',
      changeType: 'positive' as const,
    },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">
          Monitor your WhatsApp chatbot performance and conversation activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`h-12 w-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-2xl font-bold`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/dashboard/conversations"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="text-4xl mb-2">💬</div>
              <h4 className="text-base font-medium text-gray-900">View Conversations</h4>
              <p className="text-sm text-gray-500 mt-1">
                Monitor and manage active conversations
              </p>
            </Link>

            <Link
              href="/dashboard/analytics"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="text-4xl mb-2">📊</div>
              <h4 className="text-base font-medium text-gray-900">Analytics</h4>
              <p className="text-sm text-gray-500 mt-1">
                View detailed performance metrics
              </p>
            </Link>

            <Link
              href="/dashboard/settings"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="text-4xl mb-2">⚙️</div>
              <h4 className="text-base font-medium text-gray-900">Settings</h4>
              <p className="text-sm text-gray-500 mt-1">
                Configure chatbot and API settings
              </p>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="text-center py-8">
            <div className="text-6xl mb-2">💬</div>
            <p className="mt-2 text-sm text-gray-500">
              3 conversation(s) processed
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/conversations"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                View All Conversations
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}