import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Darency - Syndic Smart | Property Management Platform Morocco',
  description: 'Darency is a comprehensive property management platform for residential buildings in Morocco. Manage buildings, residents, finances, and maintenance requests.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Cairo:wght@200..900&family=JetBrains+Mono:wght@400;500;600&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="font-body bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
