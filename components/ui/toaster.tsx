'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--card))',
          backdropFilter: 'blur(10px)',
          border: '1px solid hsl(var(--border))',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          color: 'hsl(var(--foreground))',
        },
        className: 'glass',
      }}
      theme="light"
      richColors
      closeButton
    />
  )
}

