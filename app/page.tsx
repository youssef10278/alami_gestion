'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Alami Gestion
          </CardTitle>
          <p className="text-gray-600">
            Application de gestion d'entreprise
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-3">
            <Link href="/login">
              <Button className="w-full" size="lg">
                Se connecter
              </Button>
            </Link>

            <Link href="/debug">
              <Button variant="outline" className="w-full" size="sm">
                Page de diagnostic
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Version mobile optimisée
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
