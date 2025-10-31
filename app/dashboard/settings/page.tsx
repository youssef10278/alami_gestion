'use client'

import { useState } from 'react'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useUser } from '@/hooks/useUser'
import { Building2, User, Shield, Paintbrush, Users, Database, HardDrive } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CompanySettings from '@/components/settings/CompanySettings'
import InvoiceDesigner from '@/components/settings/InvoiceDesigner'
import UserManagement from '@/components/settings/UserManagement'
import ProfileSettings from '@/components/settings/ProfileSettings'
import SystemReset from '@/components/settings/SystemReset'
import Link from 'next/link'

export default function SettingsPage() {
  usePageTitle('Paramètres')

  const { user, isOwner } = useUser()

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Responsive */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-lg sm:rounded-xl p-4 sm:p-6 text-white">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-white bg-opacity-20 rounded-lg flex-shrink-0">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold">⚙️ Paramètres</h1>
            <p className="text-blue-100 mt-1 text-sm sm:text-base">
              <span className="hidden sm:inline">Configurez votre application selon vos besoins</span>
              <span className="sm:hidden">Configuration de l'application</span>
            </p>
          </div>
        </div>
      </div>

      {/* Onglets de paramètres - Responsive */}
      <Card className="glass">
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="company" className="space-y-6 sm:space-y-8">
            <TabsList className={`grid w-full ${
              isOwner
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
            } gap-1 sm:gap-0 mb-6 sm:mb-8`}>
              <TabsTrigger value="company" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Entreprise</span>
                <span className="sm:hidden">Ent.</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Utilisateurs</span>
                <span className="sm:hidden">Users</span>
              </TabsTrigger>
              <TabsTrigger value="invoice-design" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
                <Paintbrush className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden lg:inline">Designer Facture</span>
                <span className="lg:hidden hidden sm:inline">Designer</span>
                <span className="sm:hidden">Design</span>
              </TabsTrigger>

              <TabsTrigger value="profile" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Profil</span>
                <span className="sm:hidden">Prof.</span>
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
                <HardDrive className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Sauvegarde</span>
                <span className="sm:hidden">Save</span>
              </TabsTrigger>
              {isOwner && (
                <TabsTrigger value="system" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3">
                  <Database className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Système</span>
                  <span className="sm:hidden">Sys.</span>
                </TabsTrigger>
              )}

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

            {/* Onglet Profil */}
            <TabsContent value="profile">
              <ProfileSettings />
            </TabsContent>

            {/* Onglet Sauvegarde - Responsive */}
            <TabsContent value="backup">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold">
                      <span className="hidden sm:inline">Sauvegarde & Restauration</span>
                      <span className="sm:hidden">Sauvegarde</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      <span className="hidden sm:inline">Gérez vos sauvegardes de données</span>
                      <span className="sm:hidden">Gestion des sauvegardes</span>
                    </p>
                  </div>
                  <Link href="/dashboard/settings/backup" className="flex-shrink-0">
                    <button className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm">
                      <span className="hidden sm:inline">Ouvrir la Section Complète</span>
                      <span className="sm:hidden">Section Complète</span>
                    </button>
                  </Link>
                </div>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="text-center space-y-3 sm:space-y-4">
                      <HardDrive className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground" />
                      <div>
                        <h4 className="font-medium text-sm sm:text-base">
                          <span className="hidden sm:inline">Système de Sauvegarde</span>
                          <span className="sm:hidden">Sauvegarde</span>
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          <span className="hidden sm:inline">Export et import de toutes vos données en toute sécurité</span>
                          <span className="sm:hidden">Export/import sécurisé</span>
                        </p>
                      </div>
                      <Link href="/dashboard/settings/backup">
                        <button className="w-full px-3 sm:px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm">
                          <span className="hidden sm:inline">Accéder aux Sauvegardes</span>
                          <span className="sm:hidden">Accéder</span>
                        </button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Système - Propriétaires seulement */}
            {isOwner && (
              <TabsContent value="system">
                <SystemReset />
              </TabsContent>
            )}

          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
