'use client'

import { useState, useEffect, useRef } from 'react'

interface Message {
  id: string
  content: string
  isBot: boolean
  timestamp: Date
}

interface UserInfo {
  name: string
  email: string
  phone: string
}

export default function WebChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [showContactForm, setShowContactForm] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  // Contact form state
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')

  useEffect(() => {
    // Generate or retrieve session ID
    let storedSessionId = localStorage.getItem('whatsapp-widget-session')
    if (!storedSessionId) {
      storedSessionId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('whatsapp-widget-session', storedSessionId)
    }
    setSessionId(storedSessionId)

    // Check if user info is already saved
    const savedUserInfo = localStorage.getItem('webchat-user-info')
    if (savedUserInfo) {
      setUserInfo(JSON.parse(savedUserInfo))
      setShowContactForm(false)
    }

    // Load chat history from localStorage
    const savedMessages = localStorage.getItem('webchat-messages')
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages)
      setMessages(parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })))
    } else {
      // Add welcome message
      setMessages([{
        id: '1',
        content: 'Hi! How can we help you today?',
        isBot: true,
        timestamp: new Date()
      }])
    }
  }, [])

  useEffect(() => {
    // Save messages to localStorage
    if (messages.length > 0) {
      localStorage.setItem('webchat-messages', JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const info: UserInfo = {
      name: formName,
      email: formEmail,
      phone: formPhone
    }
    setUserInfo(info)
    localStorage.setItem('webchat-user-info', JSON.stringify(info))
    setShowContactForm(false)
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !userInfo) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/v1/webchat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId: sessionId,
          userEmail: userInfo.email,
          userName: userInfo.name,
          userPhone: userInfo.phone
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        isBot: true,
        timestamp: new Date(data.timestamp)
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting. Please try again in a moment.",
        isBot: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearSession = () => {
    // Clear all session data
    localStorage.removeItem('whatsapp-widget-session')
    localStorage.removeItem('webchat-user-info')
    localStorage.removeItem('webchat-messages')

    // Reset state
    setUserInfo(null)
    setShowContactForm(true)
    setMessages([{
      id: '1',
      content: 'Hi! How can we help you today?',
      isBot: true,
      timestamp: new Date()
    }])

    // Generate new session ID
    const newSessionId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('whatsapp-widget-session', newSessionId)
    setSessionId(newSessionId)
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 9999,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Chat Bubble */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isHovering ? '0 6px 20px rgba(0,0,0,0.25)' : '0 4px 12px rgba(0,0,0,0.15)',
          transform: isHovering ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            display: 'flex',
            width: '380px',
            height: '600px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            position: 'absolute',
            bottom: '80px',
            left: '0',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              color: 'white',
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Chat with us</h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>We typically reply within minutes</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {!showContactForm && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm('Are you sure you want to start a new chat? This will clear your current conversation.')) {
                      clearSession()
                    }
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  title="Start new chat"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '13px',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    transition: 'background 0.2s',
                    fontWeight: 500
                  }}
                >
                  New Chat
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOpen(false)
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: 0,
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background 0.2s'
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Contact Form or Messages */}
          {showContactForm ? (
            <div
              style={{
                flex: 1,
                padding: '30px',
                background: '#f0f2f5',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 600, color: '#333' }}>Welcome!</h3>
              <p style={{ margin: '0 0 24px', fontSize: '14px', color: '#666' }}>Please share your details to start chatting</p>

              <form onSubmit={handleContactFormSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#555' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="John Doe"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#555' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                    placeholder="john@example.com"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#555' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    required
                    placeholder="+1 234 567 8900"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Start Chat
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  padding: '20px',
                  overflowY: 'auto',
                  background: '#f0f2f5'
                }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      background: message.isBot ? 'white' : '#dcf8c6',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      maxWidth: '80%',
                      marginLeft: message.isBot ? '0' : 'auto',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      wordWrap: 'break-word'
                    }}
                  >
                    {message.content}
                  </div>
                ))}
                {isLoading && (
                  <div
                    style={{
                      background: 'white',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      maxWidth: '80%',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    Typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div
                style={{
                  padding: '16px',
                  background: 'white',
                  borderTop: '1px solid #e0e0e0',
                  display: 'flex',
                  gap: '8px'
                }}
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '24px',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  onMouseEnter={(e) => !isLoading && inputMessage.trim() && (e.currentTarget.style.background = '#128C7E')}
                  onMouseLeave={(e) => !isLoading && inputMessage.trim() && (e.currentTarget.style.background = '#25D366')}
                  style={{
                    background: isLoading || !inputMessage.trim() ? '#ccc' : '#25D366',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
