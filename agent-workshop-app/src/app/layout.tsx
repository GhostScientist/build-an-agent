import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Agent Workshop - Build AI Agents on Any SDK',
  description: 'The provider-agnostic AI agent builder. One wizard, four runtimes: Claude Agent SDK, OpenAI Agents SDK, GitHub Copilot SDK, and HuggingFace Tiny Agents. Configure tools and permissions, then download a complete TypeScript agent CLI.',
  keywords: ['AI agents', 'Claude', 'OpenAI', 'GitHub Copilot', 'HuggingFace', 'agent builder', 'provider agnostic', 'automation', 'no-code'],
  authors: [{ name: 'Dakota Kim / reasoning.software (MadWatch LLC)' }],
  openGraph: {
    title: 'Agent Workshop - Build AI Agents on Any SDK',
    description: 'One wizard, four agent SDKs: Claude, OpenAI, GitHub Copilot, and HuggingFace. Build specialized AI assistants for any domain without vendor lock-in.',
    type: 'website',
    url: 'https://agent-workshop.dev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent Workshop - Build AI Agents on Any SDK',
    description: 'One wizard, four agent SDKs: Claude, OpenAI, GitHub Copilot, and HuggingFace. Build specialized AI assistants for any domain without vendor lock-in.',
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