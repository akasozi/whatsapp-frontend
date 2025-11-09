import './globals.css'
import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/providers/Providers'
import AuthProviderWrapper from '@/components/providers/AuthProvider'

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WhatsApp Chatbot Admin',
  description: 'Admin dashboard for WhatsApp chatbot conversations and monitoring',
  keywords: ['whatsapp', 'chatbot', 'admin', 'dashboard'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          <AuthProviderWrapper>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </AuthProviderWrapper>
        </Providers>
      </body>
    </html>
  )
}