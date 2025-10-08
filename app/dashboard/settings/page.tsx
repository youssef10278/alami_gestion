'use client'

import { useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Building2, User, Shield, Bell, Palette, Paintbrush, FileText, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CompanySettings from '@/components/settings/CompanySettings'
import InvoiceDesigner from '@/components/settings/InvoiceDesigner'
import QuoteDesigner from '@/components/settings/QuoteDesigner'
import UserManagement from '@/components/settings/UserManagement'
import ProfileSettings from '@/components/settings/ProfileSettings'

export default function SettingsPage() {
  usePageTitle('Paramètres')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-lg">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">⚙️ Paramètres</h1>
            <p className="text-blue-100 mt-1">
              Configurez votre application selon vos besoins
            </p>
          </div>
        </div>
      </div>

      {/* Onglets de paramètres */}
      <Card className="glass">
        <CardContent className="p-6">
          <Tabs defaultValue="company" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Entreprise
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="invoice-design" className="flex items-center gap-2">
                <Paintbrush className="w-4 h-4" />
                Designer Facture
              </TabsTrigger>
              <TabsTrigger value="quote-design" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Designer Devis
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Apparence
              </TabsTrigger>
            </TabsList>

            {/* Onglet Entreprise */}
            <TabsContent value="company">
              <CompanySettings />
            </TabsContent>

            {/* Onglet Utilisateurs */}
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            {/* Onglet Designer de Facture */}
            <TabsContent value="invoice-design">
              <InvoiceDesigner />
            </TabsContent>

            {/* Onglet Designer de Devis */}
            <TabsContent value="quote-design">
              <QuoteDesigner />
            </TabsContent>

            {/* Onglet Profil */}
            <TabsContent value="profile">
              <ProfileSettings />
            </TabsContent>

            {/* Onglet Notifications */}
            <TabsContent value="notifications">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Paramètres de Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Les paramètres de notifications seront disponibles prochainement.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Apparence */}
            <TabsContent value="appearance">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Paramètres d'Apparence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">
                    Les paramètres d'apparence seront disponibles prochainement.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
