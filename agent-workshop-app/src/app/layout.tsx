import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Agent Workshop - Build AI Agents in Minutes',
  description: 'Transform your ideas into powerful AI agents. Choose your domain, configure tools, and download a complete agent project ready for deployment.',
  keywords: ['AI agents', 'Claude', 'OpenAI', 'agent builder', 'automation', 'no-code'],
  authors: [{ name: 'Agent Workshop Team' }],
  openGraph: {
    title: 'Agent Workshop - Build AI Agents in Minutes',
    description: 'From idea to agent in minutes. Build specialized AI assistants for any domain.',
    type: 'website',
    url: 'https://agent-workshop.dev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent Workshop - Build AI Agents in Minutes',
    description: 'From idea to agent in minutes. Build specialized AI assistants for any domain.',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'text-sm',
          }}
        />
      </body>
    </html>
  )
}