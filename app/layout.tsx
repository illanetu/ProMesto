import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ProMesto - Next.js + Prisma + NeonDB',
  description: 'Минимальный проект на Next.js с Prisma и NeonDB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
