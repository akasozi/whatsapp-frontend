'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { ConversationStats, MessageStats } from '@/lib/api'

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Monitor your WhatsApp chatbot performance</p>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/conversations"
              className="block w-full text-left px-4 py-3 bg-whatsapp-50 text-whatsapp-700 rounded-lg hover:bg-whatsapp-100 transition-colors"
            >
              <div className="flex items-center">
                <span className="mr-3">💬</span>
                View All Conversations
              </div>
            </Link>
            <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="flex items-center">
                <span className="mr-3">📊</span>
                View Analytics
              </div>
            </button>
            <button className="w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="flex items-center">
                <span className="mr-3">⚙️</span>
                Settings
              </div>
            </button>
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