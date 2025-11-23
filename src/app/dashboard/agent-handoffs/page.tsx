'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  UserGroupIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface HandoffConversation {
  conversation_id: number
  user_name: string
  user_phone: string
  handoff_reason: string | null
  mode_changed_at: string | null
  last_message_time: string | null
  last_message: string | null
  last_message_direction: string | null
  unread_count: number
  session_id: string
}

interface Stats {
  pending_handoffs: number
  total_conversations_today: number
  human_mode_conversations: number
  llm_mode_conversations: number
  handoff_rate: number
}

export default function AgentHandoffsPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<HandoffConversation[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [returningToBot, setReturningToBot] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      // Fetch pending handoffs
      const handoffsResponse = await fetch(`${apiUrl}/api/v1/agent-handoffs/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!handoffsResponse.ok) throw new Error('Failed to fetch handoffs')
      const handoffsData = await handoffsResponse.json()
      setConversations(handoffsData.conversations)

      // Fetch stats
      const statsResponse = await fetch(`${apiUrl}/api/v1/agent-handoffs/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!statsResponse.ok) throw new Error('Failed to fetch stats')
      const statsData = await statsResponse.json()
      setStats(statsData)

      setError(null)
    } catch (err) {
      console.error('Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleViewConversation = (conversationId: number) => {
    router.push(`/dashboard/conversations?id=${conversationId}`)
  }

  const handleReturnToBot = async (conversationId: number) => {
    if (!confirm('Return this conversation to bot mode?')) return

    try {
      setReturningToBot(conversationId)
      const token = localStorage.getItem('access_token')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(
        `${apiUrl}/api/v1/agent-handoffs/${conversationId}/return-to-bot`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (!response.ok) throw new Error('Failed to return to bot mode')

      // Refresh data
      await fetchData()
    } catch (err) {
      console.error('Error returning to bot:', err)
      alert('Failed to return conversation to bot mode')
    } finally {
      setReturningToBot(null)
    }
  }

  const formatTimeAgo = (timestamp: string | null) => {
    if (!timestamp) return 'Unknown'
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Handoffs</h1>
          <p className="text-gray-600 mt-1">
            Conversations that need human assistance
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Handoffs</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.pending_handoffs}</p>
              </div>
              <UserGroupIcon className="h-10 w-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Today</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_conversations_today}</p>
              </div>
              <ChatBubbleLeftRightIcon className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Handoff Rate</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{stats.handoff_rate}%</p>
              </div>
              <ClockIcon className="h-10 w-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bot Handling</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.llm_mode_conversations}</p>
              </div>
              <CheckCircleIcon className="h-10 w-10 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Conversations List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Pending Conversations ({conversations.length})
          </h2>
        </div>

        {conversations.length === 0 ? (
          <div className="p-12 text-center">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No conversations need human assistance</p>
            <p className="text-sm text-gray-500 mt-2">
              Conversations will appear here when users request to speak with an agent
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {conversations.map((conv) => (
              <div key={conv.conversation_id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {conv.user_name}
                      </h3>
                      <span className="text-sm text-gray-500">{conv.user_phone}</span>
                      {conv.unread_count > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {conv.unread_count} new
                        </span>
                      )}
                    </div>

                    {conv.handoff_reason && (
                      <p className="text-sm text-orange-700 bg-orange-50 rounded px-2 py-1 inline-block mt-2">
                        Reason: {conv.handoff_reason}
                      </p>
                    )}

                    {conv.last_message && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">
                            {conv.last_message_direction === 'INBOUND' ? 'User' : 'Bot'}:
                          </span>{' '}
                          {conv.last_message}
                        </p>
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4" />
                        {formatTimeAgo(conv.last_message_time)}
                      </span>
                      {conv.mode_changed_at && (
                        <span>
                          Handoff requested: {formatTimeAgo(conv.mode_changed_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleViewConversation(conv.conversation_id)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 whitespace-nowrap"
                    >
                      View & Respond
                    </button>
                    <button
                      onClick={() => handleReturnToBot(conv.conversation_id)}
                      disabled={returningToBot === conv.conversation_id}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 whitespace-nowrap disabled:opacity-50"
                    >
                      {returningToBot === conv.conversation_id ? 'Processing...' : 'Return to Bot'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
