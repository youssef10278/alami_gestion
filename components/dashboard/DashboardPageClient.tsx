'use client'

import { usePageTitle } from '@/hooks/usePageTitle'
import { useEffect } from 'react'

interface DashboardPageClientProps {
  children: React.ReactNode
}

export default function DashboardPageClient({ children }: DashboardPageClientProps) {
  usePageTitle('Tableau de bord')

  return <>{children}</>
}
