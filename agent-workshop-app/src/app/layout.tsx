import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Agent Workshop - Learn to Build AI Agents',
  description: 'Explore four agent runtimes. Generate a TypeScript starter for Claude, OpenAI, or GitHub Copilot, or a HuggingFace tiny-agents configuration. Inspect the code, test boundaries, and evaluate results.',
  keywords: ['AI agents', 'Claude', 'OpenAI', 'GitHub Copilot', 'HuggingFace', 'agent builder', 'provider agnostic', 'automation', 'no-code'],
  authors: [{ name: 'Dakota Kim / reasoning.software (MadWatch LLC)' }],
  openGraph: {
    title: 'Agent Workshop - Learn to Build AI Agents',
    description: 'Learn with editable TypeScript starters for Claude, OpenAI, and Copilot, or lightweight HuggingFace configurations. Free builder; provider usage may cost money.',
    type: 'website',
    url: 'https://agent-workshop.dev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent Workshop - Learn to Build AI Agents',
    description: 'Learn with editable TypeScript starters for Claude, OpenAI, and Copilot, or lightweight HuggingFace configurations. Free builder; provider usage may cost money.',
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