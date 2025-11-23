'use client'

import { useState } from 'react'
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  CodeBracketIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

type TabType = 'chatbot' | 'email' | 'sms'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('chatbot')
  const [copied, setCopied] = useState(false)
  const [widgetConfig, setWidgetConfig] = useState({
    apiUrl: typeof window !== 'undefined' ? window.location.origin : 'https://whatsapp01.cloudflow.co.ke',
    theme: 'green',
    position: 'bottom-right',
    greeting: 'Hi! How can we help you today?',
    placeholder: 'Type your message...',
    headerTitle: 'Chat with us',
    headerSubtitle: 'We typically reply within minutes'
  })

  const tabs = [
    { id: 'chatbot' as TabType, name: 'Chatbot Widget', icon: ChatBubbleLeftRightIcon },
    { id: 'email' as TabType, name: 'Email Config', icon: EnvelopeIcon },
    { id: 'sms' as TabType, name: 'SMS Config', icon: DevicePhoneMobileIcon },
  ]

  const generateWidgetCode = () => {
    const configStr = JSON.stringify(widgetConfig, null, 2).replace(/"/g, "'")

    return `<!-- WhatsApp Business Platform Widget -->
<script>
  (function() {
    // Widget Configuration
    const config = ${configStr};

    // State management
    let userInfo = null;
    let showContactForm = true;

    // Load saved user info
    const savedUserInfo = localStorage.getItem('webchat-user-info');
    if (savedUserInfo) {
      userInfo = JSON.parse(savedUserInfo);
      showContactForm = false;
    }

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'whatsapp-widget';
    widgetContainer.style.cssText = \`
      position: fixed;
      \${config.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : 'bottom: 20px; left: 20px;'}
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    \`;

    // Widget HTML
    widgetContainer.innerHTML = \`
      <div id="widget-bubble" style="
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      " onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.25)';"
         onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </div>

      <div id="widget-chat" style="
        display: none;
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        position: absolute;
        bottom: 80px;
        \${config.position === 'bottom-right' ? 'right: 0;' : 'left: 0;'}
        flex-direction: column;
        overflow: hidden;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <div>
            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">\${config.headerTitle}</h3>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">\${config.headerSubtitle}</p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button id="new-chat-btn" style="
              background: none;
              border: none;
              color: white;
              font-size: 12px;
              cursor: pointer;
              padding: 4px 8px;
              border-radius: 4px;
              transition: background 0.2s;
              display: none;
            " onmouseover="this.style.background='rgba(255,255,255,0.2)';"
               onmouseout="this.style.background='none';">New Chat</button>
            <button id="close-chat" style="
              background: none;
              border: none;
              color: white;
              font-size: 24px;
              cursor: pointer;
              padding: 0;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              transition: background 0.2s;
            " onmouseover="this.style.background='rgba(255,255,255,0.2)';"
               onmouseout="this.style.background='none';">×</button>
          </div>
        </div>

        <!-- Contact Form -->
        <div id="contact-form" style="
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          background: #f0f2f5;
          display: none;
        ">
          <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
            <h4 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #111;">Welcome! 👋</h4>
            <p style="margin: 0 0 20px; font-size: 14px; color: #666;">Please tell us a bit about yourself to get started.</p>

            <form id="user-info-form" onsubmit="handleContactFormSubmit(event)">
              <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #333;">Full Name *</label>
                <input id="form-name" type="text" required style="
                  width: 100%;
                  padding: 10px 12px;
                  border: 1px solid #e0e0e0;
                  border-radius: 8px;
                  font-size: 14px;
                  box-sizing: border-box;
                " placeholder="John Doe" />
              </div>

              <div style="margin-bottom: 16px;">
                <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #333;">Email Address *</label>
                <input id="form-email" type="email" required style="
                  width: 100%;
                  padding: 10px 12px;
                  border: 1px solid #e0e0e0;
                  border-radius: 8px;
                  font-size: 14px;
                  box-sizing: border-box;
                " placeholder="john@example.com" />
              </div>

              <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 6px; font-size: 13px; font-weight: 500; color: #333;">Phone Number *</label>
                <input id="form-phone" type="tel" required style="
                  width: 100%;
                  padding: 10px 12px;
                  border: 1px solid #e0e0e0;
                  border-radius: 8px;
                  font-size: 14px;
                  box-sizing: border-box;
                " placeholder="+1234567890" />
              </div>

              <button type="submit" style="
                width: 100%;
                background: #25D366;
                color: white;
                border: none;
                padding: 12px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
              " onmouseover="this.style.background='#128C7E';"
                 onmouseout="this.style.background='#25D366';">Start Chatting</button>
            </form>
          </div>
        </div>

        <!-- Messages -->
        <div id="messages" style="
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #f0f2f5;
          display: none;
        ">
          <div style="
            background: white;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 12px;
            max-width: 80%;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          ">\${config.greeting}</div>
        </div>

        <!-- Input -->
        <div id="message-input-container" style="
          padding: 16px;
          background: white;
          border-top: 1px solid #e0e0e0;
          display: none;
          gap: 8px;
        ">
          <input
            id="message-input"
            type="text"
            placeholder="\${config.placeholder}"
            style="
              flex: 1;
              padding: 12px 16px;
              border: 1px solid #e0e0e0;
              border-radius: 24px;
              outline: none;
              font-size: 14px;
            "
            onkeypress="if(event.key==='Enter') sendMessage();"
          />
          <button onclick="sendMessage()" style="
            background: #25D366;
            color: white;
            border: none;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
            flex-shrink: 0;
          " onmouseover="this.style.background='#128C7E';"
             onmouseout="this.style.background='#25D366';">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    \`;

    document.body.appendChild(widgetContainer);

    // UI Elements
    const bubble = document.getElementById('widget-bubble');
    const chat = document.getElementById('widget-chat');
    const closeBtn = document.getElementById('close-chat');
    const newChatBtn = document.getElementById('new-chat-btn');
    const contactForm = document.getElementById('contact-form');
    const messagesContainer = document.getElementById('messages');
    const messageInputContainer = document.getElementById('message-input-container');

    // Update UI based on state
    function updateUI() {
      if (showContactForm) {
        contactForm.style.display = 'block';
        messagesContainer.style.display = 'none';
        messageInputContainer.style.display = 'none';
        newChatBtn.style.display = 'none';
      } else {
        contactForm.style.display = 'none';
        messagesContainer.style.display = 'block';
        messageInputContainer.style.display = 'flex';
        newChatBtn.style.display = 'block';
      }
    }

    updateUI();

    // Toggle chat
    bubble.onclick = () => {
      chat.style.display = chat.style.display === 'none' ? 'flex' : 'none';
    };

    closeBtn.onclick = (e) => {
      e.stopPropagation();
      chat.style.display = 'none';
    };

    // Handle contact form submission
    window.handleContactFormSubmit = function(e) {
      e.preventDefault();
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const phone = document.getElementById('form-phone').value;

      userInfo = { name, email, phone };
      localStorage.setItem('webchat-user-info', JSON.stringify(userInfo));
      showContactForm = false;
      updateUI();
    };

    // New Chat button
    newChatBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm('Are you sure you want to start a new chat? This will clear your current conversation.')) {
        clearSession();
      }
    };

    // Clear session
    function clearSession() {
      localStorage.removeItem('whatsapp-widget-session');
      localStorage.removeItem('webchat-user-info');
      localStorage.removeItem('webchat-messages');
      userInfo = null;
      showContactForm = true;

      // Clear messages
      messagesContainer.innerHTML = \`
        <div style="
          background: white;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 12px;
          max-width: 80%;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        ">\${config.greeting}</div>
      \`;

      // Reset form
      document.getElementById('form-name').value = '';
      document.getElementById('form-email').value = '';
      document.getElementById('form-phone').value = '';

      updateUI();
    }

    // Send message function
    window.sendMessage = async function() {
      const input = document.getElementById('message-input');
      const message = input.value.trim();
      if (!message) return;

      // Add user message
      const userMsg = document.createElement('div');
      userMsg.style.cssText = 'background: #dcf8c6; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px; max-width: 80%; margin-left: auto; box-shadow: 0 1px 2px rgba(0,0,0,0.1);';
      userMsg.textContent = message;
      messagesContainer.appendChild(userMsg);

      input.value = '';
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      // Send to API
      try {
        const response = await fetch(config.apiUrl + '/api/v1/webchat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            sessionId: getSessionId(),
            userName: userInfo?.name,
            userEmail: userInfo?.email,
            userPhone: userInfo?.phone
          })
        });

        const data = await response.json();

        // Add bot response
        const botMsg = document.createElement('div');
        botMsg.style.cssText = 'background: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 12px; max-width: 80%; box-shadow: 0 1px 2px rgba(0,0,0,0.1);';
        botMsg.textContent = data.reply || 'Thank you for your message. We will get back to you shortly.';
        messagesContainer.appendChild(botMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } catch (error) {
        console.error('Error sending message:', error);
      }
    };

    // Session management
    function getSessionId() {
      let sessionId = localStorage.getItem('whatsapp-widget-session');
      if (!sessionId) {
        sessionId = 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('whatsapp-widget-session', sessionId);
      }
      return sessionId;
    }
  })();
</script>`
  }

  const copyToClipboard = async () => {
    const code = generateWidgetCode()
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Cog6ToothIcon className="h-8 w-8 mr-3 text-gray-600" />
            Settings
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your platform configurations and integrations
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    ${activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  `}
                >
                  <Icon
                    className={`
                      ${activeTab === tab.id ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'}
                      -ml-0.5 mr-2 h-5 w-5
                    `}
                  />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Chatbot Widget Tab */}
        {activeTab === 'chatbot' && (
          <div className="space-y-6">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                  <CodeBracketIcon className="h-6 w-6 mr-2 text-green-600" />
                  Chatbot Widget Code
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    Copy and paste this code into your website's HTML, just before the closing <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">&lt;/body&gt;</code> tag.
                    The widget will connect to the same backend as your WhatsApp integration.
                  </p>
                </div>

                {/* Widget Configuration */}
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Widget Position</label>
                    <select
                      value={widgetConfig.position}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, position: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Theme Color</label>
                    <select
                      value={widgetConfig.theme}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, theme: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    >
                      <option value="green">WhatsApp Green</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Greeting Message</label>
                    <input
                      type="text"
                      value={widgetConfig.greeting}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, greeting: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Header Title</label>
                    <input
                      type="text"
                      value={widgetConfig.headerTitle}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, headerTitle: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Header Subtitle</label>
                    <input
                      type="text"
                      value={widgetConfig.headerSubtitle}
                      onChange={(e) => setWidgetConfig({ ...widgetConfig, headerSubtitle: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* Code Display */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Embed Code</label>
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="h-4 w-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                          Copy Code
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed max-h-96">
                      <code>{generateWidgetCode()}</code>
                    </pre>
                  </div>
                </div>

                {/* Preview Note */}
                <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Note:</strong> The widget will automatically connect to your backend at <code className="bg-blue-100 px-1 py-0.5 rounded">{widgetConfig.apiUrl}</code>.
                        Make sure to implement the <code className="bg-blue-100 px-1 py-0.5 rounded">/api/v1/webchat/message</code> endpoint on your backend.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Config Tab */}
        {activeTab === 'email' && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <EnvelopeIcon className="h-6 w-6 mr-2 text-green-600" />
                Email Configuration
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Configure email notifications and integrations.</p>
              </div>
              <div className="mt-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Email configuration coming soon. This will allow you to set up SMTP settings, email templates, and notification preferences.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SMS Config Tab */}
        {activeTab === 'sms' && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <DevicePhoneMobileIcon className="h-6 w-6 mr-2 text-green-600" />
                SMS Configuration
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Configure SMS gateway and messaging settings.</p>
              </div>
              <div className="mt-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        SMS configuration coming soon. This will allow you to integrate with SMS providers like Twilio, Africa's Talking, or other SMS gateways.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
